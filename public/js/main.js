const socket = io();
const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// get username and room from urls
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

// join chatroom
socket.emit('joinRoom', { username, room })

// get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
})


// we're console logging the message that we get from the websocket in server.js
socket.on("message", (message) => {
    // console.log(message);
    outputMessage(message);
    // scrolls to the bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message submit from form

chatForm.addEventListener("submit", (event) => {
    // prevent refreshing
    event.preventDefault();
    // access the message text
    const message = event.target.elements.msg.value;
    // emit the message to the server
    socket.emit("chatMessage", message);

    // clear input after the message has been sent
    event.target.elements.msg.value = "";
    event.target.elements.msg.focus();
});

// output message to dom
function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `
        <p class="meta">${message.username}  <span>${message.time}</span></p> 
        <p class="text">
            ${message.textMessage}
        </p>`;
    document.querySelector(".chat-messages").appendChild(div);
}


// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}

//Prompt the user before leave chat room
document.getElementById('leave-btn').addEventListener('click', () => {
    const leaveRoom = confirm('Are you sure you want to leave the chatroom?');
    if (leaveRoom) {
        window.location = '../index.html';
    } else {}
});