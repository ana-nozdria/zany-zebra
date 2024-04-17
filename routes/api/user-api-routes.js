const express = require("express");
const {retrieveAllUsers } = require("../../modules/users-dao");
const {searchArticle} = require("../../modules/articles-dao");
const router = express.Router();

router.get("/", async function (req, res) {
     const allUsersData = await retrieveAllUsers();

    if (allUsersData) {
        res.json(allUsersData);

    } else {
        res.sendStatus(404);
    }
});

router.get("/loggedinuser", async function (req, res) {
    const loggedInUsernameData = req.user.username;

    if (loggedInUsernameData) {
        res.json(loggedInUsernameData);

    } else {
        res.sendStatus(404);
    }
});

router.post("/articles", async function (req, res) {
    const inputData = req.body.data;

    const allArticlesData = await searchArticle(inputData);

    if (allArticlesData) {
        res.json(allArticlesData);

    } else {
        res.send("No Matching result")
    }
});

module.exports = router;
