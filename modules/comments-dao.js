const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");

async function addComment(comment) {
    const db = await dbPromise;

    const result = await db.run(SQL`
        insert into comments (users_id, articles_id, content, date, parent_comments_id) 
        values(${comment.users_id}, ${comment.articles_id},${comment.content},datetime(CURRENT_TIMESTAMP, 'LOCALTIME'), ${comment.parent_id})`);

    comment.id = result.lastID;
};

async function getAllComments(article_id) {
    const db = await dbPromise;

    return await db.all(SQL`
                        SELECT u.username, u.avatar, c.articles_id, c.comments_id, c.content, c.date, c.parent_comments_id
                        from comments c, users u
                        WHERE c.articles_id = ${article_id} AND u.id = c.users_id
                        ORDER BY COALESCE(c.parent_comments_id, c.comments_id), c.parent_comments_id IS NOT NULL, c.comments_id;`);
};


async function deleteComment(id) {
    const db = await dbPromise;

    await db.run(SQL`delete from comments where comments_id = ${id}`);
};

module.exports = {
    addComment,
    getAllComments,
    deleteComment
};