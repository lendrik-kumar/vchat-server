"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = process.env.PORT || 8080; // Use the PORT environment variable or default to 8080
const wss = new ws_1.WebSocketServer({ port });
let userCount = 0;
let allSockets = [];
wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message.toString());
        if (parsedMessage.type === "join") {
            // Check if the user already exists in allSockets
            const existingUser = allSockets.find(user => user.socket === socket);
            if (existingUser) {
                // Update the user's room
                existingUser.room = parsedMessage.payload.roomId;
            }
            else {
                // Add the new user to allSockets
                allSockets.push({
                    socket,
                    room: parsedMessage.payload.roomId
                });
            }
        }
        if (parsedMessage.type === "chat") {
            const currentUser = allSockets.find(user => user.socket === socket);
            if (currentUser) {
                allSockets.forEach((s) => {
                    if (s.room === currentUser.room) {
                        s.socket.send(parsedMessage.payload.message);
                    }
                });
            }
        }
    });
    socket.on("disconnect", () => {
        allSockets = allSockets.filter((s) => s.socket !== socket);
        userCount -= 1;
        console.log("#" + userCount + " user disconnected");
    });
});
