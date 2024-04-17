const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const userDao = require("../modules/users-dao.js");
const bcrypt = require("bcrypt");

function initialize(passport) {
    const authenticateUser = async (username, password, done) => {
        const user = await userDao.retrieveUserByUsername(username);

        if (!user) {
            return done(null, false, { message: "This Username is not registered" });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                return done(null, user);

            } else {
                return done(null, false, { message: "Username or Password incorrect" });

            }

        } catch (error) {
            return done(error);
        }
    }

    passport.use(new LocalStrategy({ usernameField: "username", passwordField: "password" }, authenticateUser));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const results = await userDao.retrieveUserById(id);
            done(null, results);

        } catch (error) {
            done(error);
        }
    });

}

module.exports = initialize;