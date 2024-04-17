document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    const messageContainer = document.getElementById("message-container");
    const messageInput = document.getElementById("message-input");
    const messageButton = document.getElementById("message-button");
    const joinedUser = document.getElementById("joined-user")

    if (joinedUser) {
        setTimeout(() => {
            joinedUser.style.display = "none";
        }, 2000);
    }
    socket.on("chat message", ({ message, senderUsername }) => {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        
        if (senderUsername === username) {
            messageElement.classList.add("sent");
        } else {
            messageElement.classList.add("received");
        }
    
        const senderElement = document.createElement("div");
        senderElement.classList.add("message-sender");
        senderElement.innerText = senderUsername;
    
        const messageContentElement = document.createElement("div");
        messageContentElement.classList.add("message-content");
        messageContentElement.innerText = message;
    
        messageElement.appendChild(senderElement);
        messageElement.appendChild(messageContentElement);
        messageContainer.appendChild(messageElement);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    });
    
    messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) { 
            e.preventDefault();
            messageButton.click();
        }
    });
    
    messageButton.addEventListener("click", (e) => {
        e.preventDefault();
        const message = messageInput.value;
        if (message.trim() !== "") {
            socket.emit("chat message", { message, senderUsername: username });
            messageInput.value = "";
        }
    });    
});
