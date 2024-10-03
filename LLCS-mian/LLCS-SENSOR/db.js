const { MongoClient } = require('mongodb');

var uri = "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.3.0";

async function createSenSor(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');
        // create sensor
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


async function updateSenSor(body) {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const database = client.db('llcs');
        const collection = database.collection('equipments');
        // Modify the corresponding data based on body.username
        // Modify the corresponding records according to the body equipmentname
        const result = await collection.updateOne(
            { equipmentname: body.equipmentname }, // Search criteria
            {
                $set: {
                    equipmentname: body.equipmentname,
                    equipmenturl: body.equipmenturl,
                    equipmentstate: body.equipmentstate,
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

async function deleteSenSor(body) {
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
    createSenSor,
    updateSenSor,
    deleteSenSor
};