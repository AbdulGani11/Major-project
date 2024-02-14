// Initialize Socket.IO connection with WebSocket transport
const socket = io('http://localhost:3000', { transports: ['websocket'] });

// Cache DOM elements for performance
const htmlCodeElement = document.getElementById('html-code');
const cssCodeElement = document.getElementById('css-code');
const jsCodeElement = document.getElementById('js-code');
const outputIframe = document.getElementById('output');
const usernameInput = document.getElementById('username'); // New element for username input
const roomIdDisplay = document.getElementById('room-id'); // Element to display the room ID
const roomIdInput = document.getElementById('room-id-input'); // Input field for entering room ID

// State variables
let liveMode = false;
let currentRoomId = null; // This will hold the current room ID

// Function to create a room and join it
function createRoom(event) {
  event.preventDefault(); // Prevent form submission
  const username = usernameInput.value;
  const roomId = Math.random().toString(36).substr(2,   9);
  joinRoom(roomId, username);
  roomIdDisplay.textContent = roomId; // Display the room ID
}

// Function to join a room
function joinRoom(roomId, username) {
  socket.emit('join room', { roomId, username });
  currentRoomId = roomId;
  localStorage.setItem('lastJoinedRoomId', roomId);
}

// Function to leave a room
function leaveRoom() {
  if (currentRoomId) {
    socket.emit('leave room', currentRoomId);
    currentRoomId = null;
    localStorage.removeItem('lastJoinedRoomId');
  }
}

// Function to toggle live mode
function toggleLiveMode() {
  liveMode = !liveMode;
  document.getElementById('live-mode-toggle-button').innerText = liveMode ? 'Exit Live Mode' : 'Enter Live Mode';
}

// Function to run the code and display the output
function run() {
  const html = htmlCodeElement.value;
  const css = cssCodeElement.value;
  const js = jsCodeElement.value;

  // Convert the code into a format suitable for the iframe
  const code = `<style>${css}</style><div id="app">${html}</div><script>${js}</script>`;

  // Update the iframe's content
  outputIframe.srcdoc = code;
}

// Listen for 'code update' events from the server
socket.on('code update', (data) => {
  if (liveMode && data.roomId === currentRoomId) {
    switch (data.language) {
      case 'html':
        htmlCodeElement.value = data.code;
        break;
      case 'css':
        cssCodeElement.value = data.code;
        break;
      case 'js':
        jsCodeElement.value = data.code;
        break;
    }
    run();
  }
});

// Emit 'code update' events to the server whenever the code is changed
[htmlCodeElement, cssCodeElement, jsCodeElement].forEach(textarea => {
  textarea.addEventListener('input', (event) => {
    if (liveMode) {
      const language = textarea.id.split('-')[0]; // Determine the language based on the textarea's ID
      socket.emit('code update', {
        roomId: currentRoomId,
        username: usernameInput.value,
        language: language,
        code: textarea.value
      });
    }
  });
});

// Attach event listener to create a room and join it
document.getElementById('room-creation-form').addEventListener('submit', createRoom);

// Attach event listener to join a room
document.getElementById('join-room-button').addEventListener('click', () => {
  const roomId = roomIdInput.value;
  const username = usernameInput.value;
  joinRoom(roomId, username);
});

// Attach event listener to toggle live mode
document.getElementById('live-mode-toggle-button').addEventListener('click', toggleLiveMode);

// Attach event listener to reset the output
document.getElementById('reset-button').addEventListener('click', () => {
  outputIframe.srcdoc = '';
});

// Run the function initially to log the output
run();

// Rejoin the last room if available
const lastJoinedRoomId = localStorage.getItem('lastJoinedRoomId');
if (lastJoinedRoomId) {
  joinRoom(lastJoinedRoomId, usernameInput.value);
}
