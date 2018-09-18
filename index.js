const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const DataStore = require('nedb-core');
const voxiorRouter = require('./voxior');
const common = require('./common');

const Devices = require('./database/Devices');
const Users = require('./database/Users');




let app = express();

app.use(session({ secret: 'sami osli', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use('/voxior/api', voxiorRouter);

app.use('', (req,res,next)=>{
    if (req.session.user){
        if (req.path == '/login') res.redirect('/');
        else next();
    } else {
        if (req.path == '/login' ||req.path.startsWith("/voxior/api/")) 
            next();
        else res.redirect('/login');
    }
})

app.get('/login', (req,res)=>{
    res.end(`
        <html>
            <head></head>
            <body>
                <form method="post">
                    <input type="text" placeholder="username" name="username"></input>
                    <input type="password" placeholder="password" name="password"></input>
                    <input type="submit" value="Login"> </input>
                </form>
            </body>
        </html>
    `)
})

app.post('/login', (req,res)=>{
    let { username, password } = req.body;
    let passwordHash = common.passwordHash(password);

    Users.ValidateUser(username, passwordHash)
        .then(user=>{
           req.session.user = user;
           res.redirect('/');
        })
        .catch(()=>{
            res.redirect('/login');
        })
})

app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.redirect('/login');
})

app.get('/', (req,res)=>{

    Devices.GetDevices()
        .then(devices=>{
            let out = ''
            devices.forEach(d=>{
                out+=`<div>${d.name} - ${d.url}</div>`;
            })
            res.end(`
                <html>
                    <head></head>
                    <body>
                        ${out}
                        <div><a href="devices/add">Add device</a></div>
                    </body>
                </html>
            `)
        })
    
})

app.get('/devices/add', (req,res)=>{
    res.end(`
        <html>
            <head></head>
            <body>
                <form method="post">
                    <input type="text" placeholder="Name" name="name"></input>
                    <input type="text" placeholder="Device url" name="url"></input>
                    <input type="submit" value="Add"></input> 
                </form>
            </body>
        </html> 
    `)
})

app.post('/devices/add', (req,res)=>{
    let {name, url} = req.body;

    Devices.InsertDevice(name, url)
        .then(()=>{
            res.redirect('/');
        })
        .catch(()=>{
            res.redirect('/devices/add');
        })
})

app.listen(8080, ()=>{
    console.log('OSEL started on port 8080');
})