const userDao = require("../modules/users-dao.js");

function verifyAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    }
    else {
        res.redirect("./login");
    }
}

function verifyNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
       return res.redirect("/");
    }
    next();
}

module.exports = {
    verifyAuthenticated,
    verifyNotAuthenticated
}