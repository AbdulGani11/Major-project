// Initialize Socket.IO connection
const socket = io();

/**
 * Runs the code editor by capturing the values from the textareas, creating a blob
 * with the HTML, CSS, and JavaScript code, setting the iframe source to the blob URL,
 * emitting the updated code to the server, and logging the HTML content to the console.
 */
function run() {
  // Capture the values from the textareas
  const htmlContent = document.getElementById('html-code').value;
  const cssContent = document.getElementById('css-code').value;
  const jsContent = document.getElementById('js-code').value;

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
  const outputIframe = document.getElementById('output');
  outputIframe.src = blobUrl;

  // Emit the updated code to the server
  socket.emit('code update', {
    html: htmlContent,
    css: cssContent,
    js: jsContent
  });

  // Log the HTML content to the console
  console.log(htmlContent);
}

// Listen for 'code update' events from the server
socket.on('code update', (data) => {
  // Update the editor with the received code
  document.getElementById('html-code').value = data.html;
  document.getElementById('css-code').value = data.css;
  document.getElementById('js-code').value = data.js;

  // Call run() to reflect the changes in the output iframe
  run();
});

/**
 * Toggles between showing the raw code and the rendered output.
 */
function toggleRawAndRendered() {
  const outputIframe = document.getElementById('output');
  const rawCodeContainer = document.getElementById('raw-code-container');
  const rawCodeButton = document.getElementById('raw-code-button');
  const renderedOutputButton = document.getElementById('rendered-output-button');

  if (outputIframe.style.display === 'none') {
    // Show the rendered output
    outputIframe.style.display = 'block';
    rawCodeContainer.style.display = 'none';
    rawCodeButton.classList.remove('active');
    renderedOutputButton.classList.add('active');
  } else {
    // Show the raw code
    outputIframe.style.display = 'none';
    rawCodeContainer.style.display = 'block';
    rawCodeButton.classList.add('active');
    renderedOutputButton.classList.remove('active');
  }
}

/**
 * Resets the output to its default state.
 */
function resetOutput() {
  const outputIframe = document.getElementById('output');
  outputIframe.src = '';
  // Reset the raw code containers if necessary
  // ...
}

// Attach event listeners to trigger the run function on input change
document.querySelectorAll('#html-code, #css-code, #js-code').forEach(textarea => {
  textarea.addEventListener('input', run);
});

// Attach event listener to toggle between raw code and rendered output
document.getElementById('raw-code-button').addEventListener('click', toggleRawAndRendered);
document.getElementById('rendered-output-button').addEventListener('click', toggleRawAndRendered);

// Attach event listener to reset the output
document.getElementById('reset-button').addEventListener('click', resetOutput);

// Run the function initially to log the output
run();
