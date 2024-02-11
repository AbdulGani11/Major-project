// Initialize Socket.IO connection with WebSocket transport
const socket = io('http://localhost:3000', { transports: ['websocket'] });

// Cache DOM elements for performance
const htmlCodeElement = document.getElementById('html-code');
const cssCodeElement = document.getElementById('css-code');
const jsCodeElement = document.getElementById('js-code');
const outputIframe = document.getElementById('output');
const rawCodeContainer = document.getElementById('raw-code-container');
const rawCodeButton = document.getElementById('raw-code-button');
const renderedOutputButton = document.getElementById('rendered-output-button');
const resetButton = document.getElementById('reset-button');

// State variables
let liveMode = false;
let userId = null; // This will hold the unique user ID

// Generate a unique ID for the user (for simplicity, we'll use a random number)
userId = Math.random().toString(36).substr(2,   9);

// Constants for cursor position calculation (replace with actual values)
const CHARACTER_WIDTH =  10; // Replace with actual character width
const FONT_SIZE =  16; // Replace with actual font size

// Function to toggle live mode
function toggleLiveMode() {
  liveMode = !liveMode;
  document.getElementById('live-mode-toggle-button').innerText = liveMode ? 'Exit Live Mode' : 'Enter Live Mode';
}

// Function to toggle between raw code and rendered output
function toggleRawAndRendered() {
  const isRawCodeVisible = outputIframe.style.display === 'none';
  outputIframe.style.display = isRawCodeVisible ? 'block' : 'none';
  rawCodeContainer.style.display = isRawCodeVisible ? 'none' : 'block';
  rawCodeButton.classList.toggle('active', isRawCodeVisible);
  renderedOutputButton.classList.toggle('active', !isRawCodeVisible);
}

// Function to reset the output window
function resetOutput() {
  outputIframe.src = '';
  // Reset the raw code containers if necessary
  // ...
}

// Function to update the cursor position for a user
function updateCursorPosition(userId, cursorPosition) {
  // Find or create a span element for the user's cursor
  let cursorSpan = document.getElementById(`cursor-${userId}`);
  if (!cursorSpan) {
    cursorSpan = document.createElement('span');
    cursorSpan.id = `cursor-${userId}`;
    cursorSpan.className = 'cursor-marker';
    cursorSpan.style.backgroundColor = getRandomColor(); // Function to generate a random color
    // Append the cursor span to the editor
    htmlCodeElement.appendChild(cursorSpan);
  }

  // Position the cursor span at the cursor position
  // Note: This is a simplified example and assumes a monospace font where each character is the same width.
  // In reality, you would need to calculate the exact pixel position based on the font and character width.
  cursorSpan.style.left = `${(cursorPosition * CHARACTER_WIDTH)}px`;
  cursorSpan.style.top = `${(FONT_SIZE /  2)}px`; // Adjust the top position based on the font size
}

// Function to generate a random color
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i =   0; i <   6; i++) {
    color += letters[Math.floor(Math.random() *   16)];
  }
  return color;
}

// Initial run function
async function run() {
  // Capture the values from the textareas
  const htmlContent = htmlCodeElement.value;
  const cssContent = cssCodeElement.value;
  const jsContent = jsCodeElement.value;

  // Create a blob with the HTML, CSS, and JavaScript code
  const codeBlob = new Blob([
      `<!DOCTYPE html>
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
      </html>`
    ], { type: 'text/html' });

  // Create a URL for the blob
  const blobUrl = URL.createObjectURL(codeBlob);

  // Set the source of the iframe to the blob URL
  outputIframe.src = blobUrl;

  // Emit the updated code to the server with an acknowledgment
  socket.emit('code update', {
    html: htmlContent,
    css: cssContent,
    js: jsContent,
    userId: userId // Include the user ID in the event data
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

// Listen for 'cursor move' events from the server
socket.on('cursor move', (data) => {
  // Update the cursor position for the user with the received data.userId
  updateCursorPosition(data.userId, data.cursorPosition);
});

// Emit 'code update' events to the server whenever the code is changed
[htmlCodeElement, cssCodeElement, jsCodeElement].forEach(textarea => {
  textarea.addEventListener('input', (event) => {
    if (liveMode) {
      run().catch(console.error);
    }
  });
});

// Emit 'cursor move' events to the server whenever the cursor moves
htmlCodeElement.addEventListener('keydown', (event) => {
  const cursorPosition = htmlCodeElement.selectionStart;
  socket.emit('cursor move', {
    userId: userId,
    cursorPosition: cursorPosition
  });
});

// Attach event listener to toggle between raw code and rendered output
[rawCodeButton, renderedOutputButton].forEach(button => {
  button.addEventListener('click', toggleRawAndRendered);
});

// Attach event listener to toggle live mode
document.getElementById('live-mode-toggle-button').addEventListener('click', toggleLiveMode);

// Attach event listener to reset the output
resetButton.addEventListener('click', resetOutput);

// Run the function initially to log the output
run().catch(console.error);