const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const jimp = require("jimp");

const fs = require("fs");

const articlesDao = require("../modules/articles-dao.js");
const commentsDao = require("../modules/comments-dao.js");
const userDao = require("../modules/users-dao.js")
const { verifyAuthenticated } = require("../middleware/auth-middleware.js");

router.get("/", async function (req, res) {

    res.locals.allArticleCards = await articlesDao.getAllArticles();

    if (req.user) {
        res.locals.user = req.user;
    }

    res.render("home");
});

const upload = multer({
    dest: path.join(__dirname, "temp")
});

router.get("/addArticle", verifyAuthenticated, async function (req, res) {
    res.locals.allArticleCards = await articlesDao.getAllArticles(); //for search

    if (req.user) {
        res.locals.user = req.user;
    }

    res.render("new-article");
});

router.get("/article/:article", async function (req, res) {
    res.locals.allArticleCards = await articlesDao.getAllArticles(); //for search

    const article_id = req.params.article;
    const articleData = await articlesDao.getArticle(article_id);

    res.locals.articleCards = await articlesDao.getXRandomArticlesByTopic(articleData.topic, article_id, 2);

    if (articleData == undefined) {
        res.locals.articleTitle = "YOU LIED TO ME, MARKER"
        res.locals.articleShortText = "That is not even a real article ID, you TYPED that in the address bar.";
        res.locals.articleAuthor = "Golly";
    } else {
        if (req.user && req.user.id === articleData.author_id) {
            res.locals.usersArticles = true;
        }
        res.locals.article_id = article_id;
        res.locals.articleTitle = articleData.title;
        res.locals.articleTopic = articleData.topic;
        res.locals.articleAuthor = articleData.username;
        res.locals.articleShortText = articleData.short_text;
        res.locals.articleText = articleData.text;
        res.locals.articleDate = articleData.date;
        res.locals.articleImage = articleData.image;
        res.locals.userAvatar = articleData.avatar;
    }

    const commentsData = await commentsDao.getAllComments(article_id);
    if (commentsData) {
        res.locals.comments = commentsData;
    }

    if (req.user) {
        res.render("read-article", { user: req.user, comments: commentsData });
        res.locals.user = req.user;
    } else {
        res.render("read-article");
    }

});

// this function is for when a user uploads a image that has spaces in the name -- this function gets rid of those spaces.
function manipulateFileName(filename) {
    return filename.replace(/\s+/g, '_').toLowerCase();
  }

router.post("/createArticle", verifyAuthenticated, upload.single("imageFile"), async function (req, res) {
    res.locals.allArticleCards = await articlesDao.getAllArticles(); //for search

    if (req.user) {
        res.locals.user = req.user;
    }

    const fileInfo = req.file;
    const manipulatedFilename = manipulateFileName(fileInfo.originalname);
    const oldFileName = fileInfo.path;
    const newFileName = `./public/images/${manipulatedFilename}`;
    const filteredPath = newFileName.replace('./public/', '/');
    fs.renameSync(oldFileName, newFileName);
    const manipulatedImage = await jimp.read(newFileName);
    manipulatedImage.resize(800, jimp.AUTO);
    await manipulatedImage.writeAsync(`./public/images/${fileInfo.originalname}`);

    const title = req.body.title;
    const shortText = req.body.summary;
    const text = req.body.content;
    const topicsId = req.body.topic;
    const authorId = req.user.id;
    const image = filteredPath;

    const articles = {
        title,
        shortText,
        text,
        topicsId,
        authorId,
        image
    }

    await articlesDao.createArticle(articles);

    res.redirect("/my-articles");
});

router.get("/editArticle/:article", verifyAuthenticated, async function (req, res) {
    res.locals.allArticleCards = await articlesDao.getAllArticles(); //for search

    const article_id = req.params.article;
    const articleData = await articlesDao.getArticle(article_id);

    // Check if the user is the author of the article
    if (articleData) {
        if (req.user && req.user.id === articleData.author_id) {
            res.locals.user = req.user;
            res.locals.articleData = articleData;
            res.locals.articleTitle = articleData.title;
            res.locals.articleContent = articleData.text;
            res.locals.articleSummary = articleData.short_text;
            res.locals.article_id = article_id;
            res.locals.isEditing = true;
            res.render("new-article");
        } else {
            res.redirect("../login");
        }
    }
});

router.post("/updateArticle/:article", verifyAuthenticated, upload.single("upload_imageFile"), async function (req, res) {

    if (req.user) {
        res.locals.user = req.user;
    }

    const article_id = req.params.article;
    const title = req.body.title;
    const shortText = req.body.summary;
    const text = req.body.content;
    const topic = req.body.topic;

    const updatedArticle = {
        title,
        shortText,
        text,
        topic
    }

    const fileInfo = req.file;

    if (fileInfo) {
        const oldFileName = fileInfo.path;
        const manipulatedFilename = manipulateFileName(fileInfo.originalname);
        const newFileName = `./public/images/${manipulatedFilename}`;
        const filteredPath = newFileName.replace('./public/', '/');
        fs.renameSync(oldFileName, newFileName);
        const manipulatedImage = await jimp.read(newFileName);
        manipulatedImage.resize(350, jimp.AUTO);

        await manipulatedImage.writeAsync(`./public/images/${fileInfo.originalname}`);

        const image = filteredPath;
        updatedArticle.image = image;
    }

    await articlesDao.updateArticle(article_id, updatedArticle);


    res.redirect("/my-articles");
});

router.post("/addComment", verifyAuthenticated, async function (req, res) {

    const users_id = req.user.id;
    const articles_id = req.body.article_id;
    const content = req.body.new_comment;
    let parent_id = req.body.parent_id;
    if (parent_id == "") {
        parent_id = null;
    }


    const comment = {
        users_id,
        articles_id,
        content,
        parent_id,
    }

    await commentsDao.addComment(comment);

    res.redirect(`/article/${articles_id}/#comments-area`);
});

router.get("/deleteComment/:articlesId/:commentId", verifyAuthenticated, async function (req, res) {

    const comments_id = req.params["commentId"];
    const articles_id = req.params["articlesId"];

    await commentsDao.deleteComment(comments_id);

    res.redirect(`/article/${articles_id}`);
});

router.get("/directMessage", verifyAuthenticated, async function (req, res) {
    res.locals.allArticleCards = await articlesDao.getAllArticles(); //for search

    if(req.user) {
        const user = await userDao.retrieveUserById(req.user.id);
        res.locals.username = user.username; 
        res.locals.user = req.user;
        res.render("messenger");
    } else {
        res.redirect("/login")
    }
   
});


router.get("/deleteArticle/:article", verifyAuthenticated, async function (req, res) {
    const article_id = req.params.article;

    try {
        await articlesDao.deleteArticle(article_id);
        res.setToastMessage("article deleted");
        res.redirect("/my-articles");
    } catch (error) {
        console.log("oops?" + error);
        res.setToastMessage("Something went wrong, try again");
        res.redirect("/my-articles");
    }
});

router.get("/topic/:topic", async function (req, res) {

    const topic = req.params.topic;

    if (req.user) {
        res.locals.user = req.user;
    }

    res.locals[topic] = true;
    res.locals.allArticleCards = await articlesDao.getArticlesByTopic(topic);

    res.render("home");
});

router.get("/my-articles", verifyAuthenticated, async function (req, res) {
    
    res.locals.myArticles = true;

    if (req.user) {
        res.locals.user = req.user;
    }

    res.locals.allArticleCards = await articlesDao.getArticleByUserId(req.user.id);
    res.render("home");
});

router.get("/search", async function (req, res) {
    const searchQuery = req.query.q;
    const searchResults = await articlesDao.searchArticle(searchQuery);

    res.json(searchResults);
});

module.exports = router;
