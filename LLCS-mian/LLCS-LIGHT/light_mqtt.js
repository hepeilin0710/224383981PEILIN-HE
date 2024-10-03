const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const path = require('path');
const app = express();


const { createLight,updateLight, deleteLight } = require('./db.js');

// Parse the multipart/form-data request body
app.use(bodyParser.urlencoded({ extended: false }));

// Configure the middleware to parse data in JSON format
app.use(express.json());
app.use(express.text({ type: "*/*" }));



app.post('/light_management/create_light', async function (req, res) {
    console.log(req.body)
    //save data
    await createLight(req.body);
    //sent mqtt message
    res.status(201).json(req.body);
});

app.post('/light_management/update_light',async function (req,res) {
    console.log(req.body)
    //Modify the corresponding data according to equipmentname
    await updateLight(req.body)
    res.status(201).json(req.body);
})

app.post('/light_management/delete_light',async function (req,res) {
    console.log(req.body)
    // Modify the corresponding data according to equipmentname
    await deleteLight(req.body)
    res.status(201).json(req.body);
})


app.listen(8083, () => {
    console.log("Application listening on port 8083!");
});