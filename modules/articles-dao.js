const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function createArticle(article) {
    const db = await dbPromise;

    const result = await db.run(SQL`
        insert into articles (title, topics_id, author_id, short_text, text, date, image) values(${article.title}, ${article.topicsId},${article.authorId},${article.shortText}, ${article.text}, datetime(CURRENT_TIMESTAMP, 'LOCALTIME'),${article.image})`);

    article.id = result.lastID;
};

async function getAllArticles() {
    const db = await dbPromise;

    return await db.all(SQL`
                        select a.image, a.title, a.short_text, a.articles_id, u.username, u.avatar
                        from articles a, users u
                        where a.author_id = u.id;`);
};

async function getArticle(id) {
    const db = await dbPromise;

    return await db.get(SQL`
                        select a.articles_id, a.title, t.name as topic, u.username, a.short_text, a.text, a.date, a.image, u.avatar,a.author_id
                        from articles a, users u, topics t
                        where a.articles_id = ${id} and a.author_id = u.id and t.topics_id = a.topics_id`);
};

async function getArticleByUserId(id) {
    const db = await dbPromise;

    return await db.all(SQL`
    select distinct a.articles_id, a.author_id, a.title, u.username, a.short_text, a.text, a.date, a.image, u.avatar
    from articles a, users u
    where a.author_id = ${id} and a.author_id = u.id`);
};


async function getArticlesByTopic(topic) {
    const db = await dbPromise;

    return await db.all(SQL`
                select a.articles_id, a.image, a.title, a.short_text, u.username, u.avatar
                from articles a, users u, topics t
                where a.author_id = u.id and a.topics_id = t.topics_id and t.name = ${topic};`);
};

async function getXRandomArticlesByTopic(topic, articlesId, x) {
    const db = await dbPromise;

    return await db.all(SQL`
                select a.articles_id, a.image, a.title, a.short_text, u.username, u.avatar
                from articles a, users u, topics t
                where a.author_id = u.id 
                and a.topics_id = t.topics_id 
                and t.name = ${topic}
                and a.articles_id <> ${articlesId}
                ORDER BY RANDOM() LIMIT ${x};`);
};

async function searchArticle(searchQuery) {
    const db = await dbPromise;

    const searchValue = `%${searchQuery}%`;

    return await db.all(SQL`select a.articles_id, a.title, a.author_id, a.image, u.username, u.avatar
                        FROM articles a, users u
                        WHERE  a.author_id = u.id 
                        AND (LOWER(a.title) LIKE ${searchValue} 
                            OR LOWER(u.username) LIKE ${searchValue})`);

};

async function updateArticle(id, updatedArticle) {
    const db = await dbPromise;

    if (updatedArticle) {
        if (updatedArticle.image) {
            await db.run(SQL`
            update articles
            set text = ${updatedArticle.text}, title = ${updatedArticle.title}, short_text = ${updatedArticle.shortText}, topics_id = ${updatedArticle.topic}, image =  ${updatedArticle.image}
            where articles_id = ${id}`);
        }
        await db.run(SQL`
            update articles
            set text = ${updatedArticle.text}, title = ${updatedArticle.title}, short_text = ${updatedArticle.shortText}, topics_id = ${updatedArticle.topic}
            where articles_id = ${id}`);

    }
}

async function deleteArticle(id) {
    const db = await dbPromise;

    await db.run(SQL`delete from articles where articles_id = ${id}`);
};


module.exports = {
    createArticle,
    getAllArticles,
    getArticlesByTopic,
    getXRandomArticlesByTopic,
    deleteArticle,
    getArticle,
    getArticleByUserId,
    searchArticle,
    updateArticle
};