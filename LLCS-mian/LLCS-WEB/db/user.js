const { MongoClient } = require('mongodb');
const uuid = require("uuid");

var uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0"

async function verifyUserPassword(usernames, passwords) {
    const client = new MongoClient(uri);
    try {
        const database = client.db('llcs');
        const collection = database.collection('users');
        console.log("query", usernames, passwords)
        // const user = await collection.findOne({ username: "'" + username + "'", password: password });
        const user = await collection.findOne({ username: usernames, password: passwords });
        if (user) {
            console.log("username verified");
            return true;
        } else {
            console.log("Usernot found or password is incorrect.");
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        await client.close();
    }
}


async function getUserInfo(usernames) {
    const client = new MongoClient(uri);
    try {
        const database = client.db('llcs');
        const collection = database.collection('users');
        // const user = await collection.findOne({ username: "'" + username + "'", password: password });
        const user = await collection.findOne({ username: usernames });
        if (user) {
            console.log("username verified");
            return user;
        } else {
            console.log("Usernot found or password is incorrect.");
            return false;
        }
    } catch (err) {
        console.error(err);
        return false;
    } finally {
        await client.close();
    }
}


/**
 * Save the new user information to the database
 * @param {string} username username
 * @param {string} password password
 * @returns {Promise<boolean>} The result of the insert operation
 */
async function saveUser(username, password) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });

    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('users');
        // Generate a random UUID
        const newUserId = uuid.v4()

        // Building user objects
        const newUser = {
            userid: newUserId,
            username: username,
            password: password,
            userage: null,
            userrole: 'user'
        };

        // Insert new user
        const result = await collection.insertOne(newUser);

        
        if (result.acknowledged && result.insertedId) {
            console.log(`user ${username} Saved successfully`);
            return true;
        } else {
            console.error(`Save user ${username} Lose`);
            return false;
        }
    } catch (err) {
        console.error(`Error saving user ${username} :`, err);
        return false;
    } finally {
        await client.close();
    }
}


module.exports = {
    verifyUserPassword,
    getUserInfo,
    saveUser
}