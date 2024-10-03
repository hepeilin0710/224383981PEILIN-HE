const { MongoClient } = require('mongodb');

var uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0";

async function createLight(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');
        // Create a corresponding sensor
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


async function updateLight(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');
        // Modify the data based on body.username
        // Modify records according to the body equipmentname
        const result = await collection.updateOne(
            { equipmentname: body.equipmentname }, // Search criteria
            {
                $set: {
                    equipmentname: body.equipmentname,
                    equipmenturl: body.equipmenturl,
                    equipmentstate: body.equipmentstate,
                    color: body.color,
                    remarks: body.remarks
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

async function deleteLight(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');

        // Modify the deleted records according to the equipmentname in the body
        const result = await collection.deleteOne({ equipmentname: body.equipmentname });

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
    createLight,
    updateLight,
    deleteLight
};