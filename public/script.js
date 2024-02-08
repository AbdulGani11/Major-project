// Initialize Socket.IO connection with WebSocket transport
const socket = io('http://localhost:3000', { transports: ['websocket'] });

// Connection event listener
socket.on('connect', () => {
  console.log('Connected to the server');
});

// Connection error event listener
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Connection timeout event listener
socket.on('connect_timeout', () => {
  console.log('Connection timed out');
});

// Cache DOM elements for performance
const htmlCodeElement = document.getElementById('html-code');
const cssCodeElement = document.getElementById('css-code');
const jsCodeElement = document.getElementById('js-code');
const outputIframe = document.getElementById('output');
const rawCodeContainer = document.getElementById('raw-code-container');
const rawCodeButton = document.getElementById('raw-code-button');
const renderedOutputButton = document.getElementById('rendered-output-button');

/**
 * Runs the code editor by capturing the values from the textareas, creating a blob
 * with the HTML, CSS, and JavaScript code, setting the iframe source to the blob URL,
 * emitting the updated code to the server, and logging the HTML content to the console.
 */
async function run() {
  // Capture the values from the textareas
  const htmlContent = htmlCodeElement.value;
  const cssContent = cssCodeElement.value;
  const jsContent = jsCodeElement.value;

  // Create a blob with the HTML, CSS, and JavaScript code
  const codeBlob = new Blob([`
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssContent}</style>
        </head>
        <body>
          ${htmlContent}
          <script>
            ${jsContent}
          </script>
        </body>
      </html>
    `], { type: 'text/html' });

  // Create a URL for the blob
  const blobUrl = URL.createObjectURL(codeBlob);

  // Set the source of the iframe to the blob URL
  outputIframe.src = blobUrl;

  // Emit the updated code to the server with an acknowledgment
  socket.emit('code update', {
    html: htmlContent,
    css: cssContent,
    js: jsContent
  }, (response) => {
    if (response && response.status === 'success') {
        console.log('Code update successful');
    } else {
        console.error('Code update failed');
    }
  });

  // Log the HTML content to the console
  console.log(htmlContent);
}

// Listen for 'code update' events from the server
socket.on('code update', (data) => {
  // Update the editor with the received code
  htmlCodeElement.value = data.html;
  cssCodeElement.value = data.css;
  jsCodeElement.value = data.js;

  // Call run() to reflect the changes in the output iframe
  run();
});

/**
 * Toggles between showing the raw code and the rendered output.
 */
function toggleRawAndRendered() {
  const isRawCodeVisible = outputIframe.style.display === 'none';
  outputIframe.style.display = isRawCodeVisible ? 'block' : 'none';
  rawCodeContainer.style.display = isRawCodeVisible ? 'none' : 'block';
  rawCodeButton.classList.toggle('active', isRawCodeVisible);
  renderedOutputButton.classList.toggle('active', !isRawCodeVisible);
}

/**
 * Resets the output to its default state.
 */
function resetOutput() {
  outputIframe.src = '';
  // Reset the raw code containers if necessary
  // ...
}

// Attach event listeners to trigger the run function on input change
[htmlCodeElement, cssCodeElement, jsCodeElement].forEach(textarea => {
  textarea.addEventListener('input', run);
});

// Attach event listener to toggle between raw code and rendered output
[rawCodeButton, renderedOutputButton].forEach(button => {
  button.addEventListener('click', toggleRawAndRendered);
});

// Attach event listener to reset the output
document.getElementById('reset-button').addEventListener('click', resetOutput);

// Run the function initially to log the output
run();
