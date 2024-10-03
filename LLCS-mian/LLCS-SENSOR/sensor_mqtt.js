const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const path = require('path');
const app = express();


const { createSenSor,updateSenSor,deleteSenSor } = require('./db.js');

// Parse the multipart/form-data request body
app.use(bodyParser.urlencoded({ extended: false }));

// Configure the middleware to parse data in JSON format
app.use(express.json());
app.use(express.text({ type: "*/*" }));



app.post('/sensor_management/create_sensor', async function (req, res) {
    console.log(req.body)
    //save data 
    await createSenSor(req.body);
    //sent mqtt message
    res.status(201).json(req.body);
});

app.post('/sensor_management/update_sensor',async function (req,res) {
    console.log(req.body)
    // Modify the data according to equipmentname
    await updateSenSor(req.body)
    res.status(201).json(req.body);
})

app.post('/sensor_management/delete_sensor',async function (req,res) {
    console.log(req.body)
    // Modify the data according to equipmentname
    await deleteSenSor(req.body)
    res.status(201).json(req.body);
})


app.listen(8082, () => {
    console.log("Application listening on port 8083!");
});