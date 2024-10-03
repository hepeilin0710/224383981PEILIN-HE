const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const request = require('request');

var session = require("express-session")
var NedbStore = require('nedb-session-store')(session);

const { verifyUserPassword, getUserInfo, saveUser } = require('./db/user.js');
const { getSensorByUsername, getLightsByUsername, getScheduleByUsername, updateSchedule, deleteSchedule, createSchedule, getSchedule, updateLightState } = require('./db/equipmentname.js')
const path = require('path');
const app = express();


const sensorurl = "http://localhost:8082/sensor_management"
const lighturl = "http://localhost:8083/light_management"


// Parse the multipart/form-data request body
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.json());
app.use(express.text({ type: "*/*" }));



app.engine('art', require('express-art-template'));

app.use(express.static(path.join(__dirname, '/static')));

app.set('view options', {
    debug: process.env.NODE_ENV !== 'production'
});


// Creating session Middleware
const sessionMiddleware = session({
    secret: "fas fas",
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000   // e.g. 1 year
    },
    store: new NedbStore({
        filename: 'path_to_nedb_persistence_file.db'
    })
})

app.use(sessionMiddleware);

// Scheduled task
const cron = require('node-cron');

//Execute
cron.schedule('*/1 * * * *', async () => {
    console.log('任务每一分钟执行一次。');
    // Get the current time and convert it to a format like 10:30
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    hours = hours < 10 ? '0' + hours : hours.toString();
    minutes = minutes < 10 ? '0' + minutes : minutes.toString();
    console.log("当前时间：", `${hours}:${minutes}`)
    // Determine if there is a schedule corresponding to it
    var schedules = await getSchedule();
    // Loop reads schedules' timetext against '${hours}:${minutes}' and modifies if the same
    for (const schedule of schedules) {
        console.log("获取时间的时间为：",schedule.timetext)
        console.log("对比的时间为：",`${hours}:${minutes}`)
        if (schedule.timetext == `${hours}:${minutes}`) {
            console.log(`时间表中的时间 ${schedule.timetext} 与当前时间 ${`${hours}:${minutes}`} 匹配`);
            // Execute
            var body = {
                equipmentname: schedule.lightname,
                equipmentstate: schedule.action
            }
            await updateLightState(body);
        }
    }
});

// Get present time
app.get('/current-time', (req, res) => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // When the hour and minute are less than two digits, fill in the first zero
    hours = hours < 10 ? '0' + hours : hours.toString();
    minutes = minutes < 10 ? '0' + minutes : minutes.toString();

    const currentTime = `${hours}:${minutes}`;
    res.json({ currentTime });
});


app.get('/', function (req, res) {
    res.render('index.art', {
        user: {
            name: 'aui',
            tags: ['art', 'template', 'nodejs']
        }
    });
});

// Login request
app.post("/", async function (req, res) {
    // Gets the incoming username and password
    var username = req.body.username;
    var password = req.body.password;

    const user = await verifyUserPassword(username, password);

    if (user) {
        // Save to session
        req.session.user = {
            username: username,
            authenticated: true
        };
        // Query
        lights = await getLightsByUsername(username)
        // return
        res.render('dashboard.art', { lights: lights });
    } else {
       
        res.status(401).render('index.art', { error: 'Invalid user name or password' });
    }
});
app.get("/dashboard",async function (req, res) {

    var username = req.session.user.username
    // Query the sensor device corresponding to the user name
    lights = await getLightsByUsername(username)
    res.render('dashboard.art', { lights: lights });
})

app.get("/logout", async function (req, res) {
    // clear session
    if (req.session.user) {
        req.session.destroy(err => {
            if (err) {
                console.error('Session destroy error:', err);
                res.status(500).send('Error destroying session.');
            } else {
                res.redirect("/");
            }
        });
    } else {
        res.redirect("/");
    }
});


app.get("/registration", async function (req, res) {
    res.render('register.art')
})


app.post("/register", async function (req, res) {

    var username = req.body.username;
    var password = req.body.password;

    if (await saveUser(username, password)) {
        
        res.render('index.art');
    } else {
        
        res.redirect("/registration");
    }

})



app.get("/user_info", async function (req, res) {
    var username = req.session.user.username

    user = await getUserInfo(username);
   
    res.render('user_info.art', { user: user });
})


app.get("/sensor_management", async function (req, res) {
    
    var username = req.session.user.username
  
    sensors = await getSensorByUsername(username)

    res.render('sensor_management.art', { sensors: sensors });
})

// The lighting management page is displayed
app.get("/light_management", async function (req, res) {
    var username = req.session.user.username

    lights = await getLightsByUsername(username)

    res.render('light_management.art', { lights: lights });
})


// The schedule page is displayed
app.get("/schedule", async function (req, res) {
    var username = req.session.user.username
    // Query the sensor device corresponding to the user name
    schedules = await getScheduleByUsername(username)
    lights = await getLightsByUsername(username);

    res.render('schedule.art', { schedules: schedules, lights: lights });
})

//===================================================================================================

// Request the sensor service to create a sensor
app.post("/create_sensor", async function (req, res) {

    var method = req.method.toUpperCase();
    var proxy_url = sensorurl + '/create_sensor';

    req.body.equipmentusername = req.session.user.username;
    req.body.equipmenttype = "sensor";
    var options = {
        headers: { "Connection": "close" },
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('------data------', data);
            console.log("The sensor service was requested successfully.")
        }
    }

    request(options, callback);

    res.status(201).json(req.body);
})

// Requests the sensor service to modify the sensor
app.post("/update_sensor", async function (req, res) {
    console.log("The sensor modification request was obtained :", req.body)
    var method = req.method.toUpperCase();
    var proxy_url = sensorurl + '/update_sensor';
    req.body.equipmentusername = req.session.user.username;
    req.body.equipmenttype = "sensor";
    var options = {
        headers: { "Connection": "close" },
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('------data------', data);
            console.log("The sensor service was requested successfully.")

        }
    }

    request(options, callback);

    res.status(201).json(req.body);
})

// Request the sensor service to delete the sensor
app.post("/delete_sensor", async function (req, res) {
    
    console.log("Get a request to modify the sensor:", req.body)
    var method = req.method.toUpperCase();
    var proxy_url = sensorurl + '/delete_sensor';

    req.body.equipmentusername = req.session.user.username;
    req.body.equipmenttype = "sensor";
    var options = {
        headers: { "Connection": "close" },
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('------Interface data------', data);
            console.log("The sensor service was requested successfully")

        }
    }

    request(options, callback);

    res.status(201).json(req.body);
})

//==============================================================================================================

// Request the light service to create a sensor
app.post("/create_light", async function (req, res) {
    console.log("获取到创建灯光请求：", req.body)
    var method = req.method.toUpperCase();
    var proxy_url = lighturl + '/create_light';

    req.body.equipmentusername = req.session.user.username;
    req.body.equipmenttype = "light";
    var options = {
        headers: { "Connection": "close" },
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('------Interface data------', data);
            console.log("The sensor service was requested successfully")
        }
    }

    request(options, callback);

    res.status(201).json(req.body);
})



app.post("/update_light", async function (req, res) {
    console.log("Got the request to modify the light :", req.body)
    var method = req.method.toUpperCase();
    var proxy_url = lighturl + '/update_light';

    req.body.equipmentusername = req.session.user.username;
    req.body.equipmenttype = "light";
    var options = {
        headers: { "Connection": "close" },
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('------Interface data------', data);
            console.log("The sensor service was requested successfully")

        }
    }

    request(options, callback);

    res.status(201).json(req.body);
})


// delete light
app.post("/delete_light", async function (req, res) {
    var method = req.method.toUpperCase();
    var proxy_url = lighturl + '/delete_light';
    // Automatically fill in data that does not need to be entered
    req.body.equipmentusername = req.session.user.username;
    req.body.equipmenttype = "light";
    var options = {
        headers: { "Connection": "close" },
        url: proxy_url,
        method: method,
        json: true,
        body: req.body
    };

    function callback(error, response, data) {
        if (!error && response.statusCode == 200) {
            console.log('------Interface data------', data);
            console.log("The sensor service was requested successfully")
 
        }
    }

    request(options, callback);

    res.status(201).json(req.body);
})
//===========================================================================
app.post('/create_schedule', async function (req, res) {
    req.body.timeusername = req.session.user.username;
    console.log(req.body)
    await createSchedule(req.body);
    res.status(201).json(req.body);
});

app.post('/update_schedule', async function (req, res) {
    req.body.timeusername = req.session.user.username;
    console.log(req.body)
    // edit data
    await updateSchedule(req.body)
    res.status(201).json(req.body);
})

app.post('/delete_schedule', async function (req, res) {
    req.body.timeusername = req.session.user.username;
    console.log(req.body)
    // edit data
    await deleteSchedule(req.body)
    res.status(201).json(req.body);
})


app.listen(8081, () => {
    console.log("The sample application is listening on port 8081!");
});