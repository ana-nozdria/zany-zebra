if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

const express = require("express");
const router = express.Router();
const { verifyNotAuthenticated, verifyAuthenticated } = require("../middleware/auth-middleware.js");

// The DAO that handles CRUD operations for users.
const userDao = require("../modules/users-dao.js");

const passport = require("passport");
const initializePassport = require("../middleware/passport.js");
const flash = require("express-flash");
const session = require("express-session");

router.use(flash());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
router.use(passport.initialize());
router.use(passport.session());

initializePassport(
    passport,
    async username => await userDao.retrieveAllUsers.find(user => user.username === username),
    async id => await userDao.retrieveAllUsers(user => user.id === id)
);

// Whenever we navigate to /login, if we're not already logged in, render the "login" view.
router.get("/login", verifyNotAuthenticated, function (req, res) {
    try {
        res.render("login", { message: req.flash('error'), layout: false });

    } catch (err) {
        res.status(500).send();
    }

});


router.post("/login", verifyNotAuthenticated, passport.authenticate("local", {

    successRedirect: "/",
    failureRedirect: "/login",
    badRequestMessage: "The username does not match any account",
    failureFlash: true

}));


router.get("/logout", function (req, res) {

    req.logout((err) => {
        if (err) {
            console.error(err);
        }

        res.redirect('/');
    });
});


// Account creation
router.get("/register", verifyNotAuthenticated, function (req, res) {

    res.render("register-update", { layout: false });
})


router.post("/register", verifyNotAuthenticated, async function (req, res) {
    const user = handleFormData(req);

    try {
        await userDao.createUser(user);
        res.setToastMessage("Account creation successful. Please login using your new credentials.");
        res.redirect("/login");
    }
    catch (err) {
        res.setToastMessage("Sorry, registration did not work correctly. Please try again");
        res.redirect("/register");
    }

});


// Account Update
router.get("/update", verifyAuthenticated, function (req, res) {
    const currentURL = req.originalUrl;
    const isUpdatePage = currentURL.includes("/update");

    res.render("register-update", { currentURL, isUpdatePage, layout: false });
});


router.post("/update", verifyAuthenticated, async function (req, res) {
    const user = handleFormData(req);
    const id = req.user.id;

    try {
        await userDao.updateUser(user, id);
        res.setToastMessage("Your information has updated successfully");
        res.redirect("/");
    }
    catch (err) {
        res.setToastMessage("Sorry, updating information did not work correctly. Please try again");
        res.redirect("/update");
    }

});


router.get("/delete", verifyAuthenticated, async function (req, res) {
    try {
        const userId = req.user.id;
        await userDao.deleteUser(userId);
        req.logout((err) => {
            if (err) {
                console.error(err);
            }
            res.setToastMessage("Your account has been deleted successfully.");
            res.redirect('/');
        });
    }
    catch (err) {
        console.error(err);
        res.setToastMessage(`Sorry, deleting account did not work properly. Please try again. The error message received was : ${err}`);
        res.redirect("/update");
    }
});


function handleFormData(req) {
    const response = {
        username: req.body.username,
        password: req.body.password,
        fname: req.body.fname,
        lname: req.body.lname,
        dob: req.body.birthdate,
        bio: req.body.description,
        avatar: req.body.avatar
    };

    return response;
}

module.exports = router;