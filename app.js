/**
 * Main application file.
 * 
 * NOTE: This file contains many required packages, but not all of them - you may need to add more!
 */

if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// Setup Express
const express = require("express");
const app = express();
const port = 3000;
const http = require("http");
const socketIo = require("socket.io");

const passport = require("passport");
const session = require("express-session");
const initializePassport = require("./middleware/passport.js");

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

initializePassport(
    passport,
    async username => await userDao.retrieveAllUsers.find(user => user.username === username),
    async id => await userDao.retrieveAllUsers(user => user.id === id)
);

// Setup Handlebars
const handlebars = require("express-handlebars");
const customHelpers = require('./helpers.js');
app.engine("handlebars", handlebars.engine({
    defaultLayout: "main",
    helpers: customHelpers,
}));

app.set("view engine", "handlebars");

// Setup body-parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Setup cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

// Use the toaster middleware
app.use(require("./middleware/toaster-middleware.js"));

// Setup routes
app.use(require("./routes/application-routes.js"));
app.use(require("./routes/auth-routes.js"));

const routes = require("./routes/routes.js");
app.use("/", routes);

// Setup socket.io
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
    socket.on('chat message', ({ message, senderUsername }) => {
        io.emit('chat message', { message, senderUsername });
    });
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server running.
server.listen(port, () => {
    console.log(`The Best App In The World ™️ listening on port ${port}!`);
});