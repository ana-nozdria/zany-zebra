const SQL = require("sql-template-strings");
const dbPromise = require("./database.js");
const bcrypt = require("bcrypt");
const saltRounds = 10;

async function createUser(user) {
    const db = await dbPromise;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const result = await db.run(SQL`
        insert into users (username, password, fname, lname, dob, bio, avatar) 
        values(${user.username}, ${hashedPassword}, ${user.fname}, ${user.lname}, ${user.dob}, ${user.bio}, ${user.avatar})`);

    user.id = result.lastID;
}

async function retrieveUserByUsername(username) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from users
        where username = ${username}`);

    return user;
}

async function retrieveUserById(id) {
    const db = await dbPromise;

    const user = await db.get(SQL`
        select * from users
        where id = ${id}`);

    return user;
}

async function retrieveAllUsernames() {
    const db = await dbPromise;

    const users = await db.all(SQL`select username from users`);

    return users;
}

async function retrieveAllUsers() {
    const db = await dbPromise;

    const users = await db.all(SQL`select * from users`);

    return users;
}

async function updateUser(user, id) {
    const db = await dbPromise;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    await db.run(SQL`
        update users
        set username = ${user.username}, password = ${hashedPassword}, fname = ${user.fname}, lname = ${user.lname}, 
        dob = ${user.dob}, bio = ${user.bio}, avatar = ${user.avatar}
        where id = ${id}`);
}

async function deleteUser(id) {
    const db = await dbPromise;

    await db.run(SQL`
        delete from users
        where id = ${id}`);
}

module.exports = {
    createUser,
    retrieveUserByUsername,
    retrieveUserById,
    retrieveAllUsernames,
    retrieveAllUsers,
    updateUser,
    deleteUser
};
