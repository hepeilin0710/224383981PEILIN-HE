const { MongoClient } = require('mongodb');

var uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0";

/**
 * Query sensor information by user name
 * @param {string|string[]} usernames 
 * @returns {Promise<Array<Object>>} 
 */
async function getSensorByUsername(usernames) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');

        // Construct criteria
        let queryCondition = {};
        if (Array.isArray(usernames)) {
            queryCondition = { $or: usernames.map(username => ({ username })) };
        } else {
            queryCondition = { equipmentusername: usernames };
        }

        // Execute
        const sensors = await collection.find({
            equipmenttype: "sensor",
            ...queryCondition
        }).toArray();

        return sensors;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}

async function getLightsByUsername(usernames) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');

        //Construct criteria 
        let queryCondition = {};
        if (Array.isArray(usernames)) {
            queryCondition = { $or: usernames.map(username => ({ username })) };
        } else {
            queryCondition = { equipmentusername: usernames };
        }

        //Execute 
        const sensors = await collection.find({
            equipmenttype: "light",
            ...queryCondition
        }).toArray();

        return sensors;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}


async function getScheduleByUsername(usernames) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('timeschedules');

        // Construct criteria 
        let queryCondition = {};
        queryCondition = { timeusername: usernames };

        // Execute
        const schedules = await collection.find({
            ...queryCondition
        }).toArray();

        return schedules;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}

async function getSchedule() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('timeschedules');
        // Execute
        const schedules = await collection.find().toArray();
        return schedules;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}


async function createSchedule(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('timeschedules');
        // creat sensor
        const result = await collection.insertOne(body);

        if (result.acknowledged && result.insertedId) {
            console.log(`Sensor created with ID: ${result.insertedId}`);
            return { success: true, message: 'Sensor created successfully', id: result.insertedId };
        } else {
            console.error('Failed to create sensor');
            return { success: false, message: 'Failed to create sensor' };
        }
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}

async function updateSchedule(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('timeschedules');
        const result = await collection.updateOne(
            { timeid: body.timeid }, 
            {
                $set: {
                    timetext: body.timetext,
                    action: body.action,
                    lightname: body.lightname,
                    timestate: body.timestate,
                    timeusername: body.timeusername
                }
            }
        );

        console.log(`Document updated with the result: ${result}`);
        return result;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}

async function deleteSchedule(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('timeschedules');


        const result = await collection.deleteOne({ timeid: body.timeid });

        console.log(`Document updated with the result: ${result}`);
        return result;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}

async function updateLightState(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');
        const result = await collection.updateOne(
            { equipmentname: body.equipmentname }, 
            {
                $set: {
                    equipmentstate: body.equipmentstate
                }
            }
        );

        console.log(`Document updated with the result: ${result}`);
        return result;
    } catch (err) {
        console.error(err);
        return [];
    } finally {
        await client.close();
    }
}

module.exports = {
    getSensorByUsername,
    getLightsByUsername,
    getScheduleByUsername,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedule,
    updateLightState
};