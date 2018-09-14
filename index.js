const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const DataStore = require('nedb-core');


let usersDB = new DataStore({filename:'data/users.data', autoload:true});
usersDB.update({username:'admin'}, {username:'admin', password:'admin'}, {upsert:true}, (err, data)=>{})

let devicesDB = new DataStore({filename: 'data/devices.data', autoload:true});


let app = express();

app.use(session({ secret: 'sami osli', cookie: { maxAge: 60000 }, resave: true, saveUninitialized: true}))

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.use('', (req,res,next)=>{
    if (req.session.user){
        if (req.path == '/login') res.redirect('/');
        else next();
    } else {
        if (req.path == '/login') next();
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
    let {username, password} = req.body;

    usersDB.find({username, password}, {}, (err,data)=>{
        if (err || data.length == 0) res.redirect('/login');
        req.session.user = data[0];
        res.redirect('/');
    })
})

app.get('/logout', (req,res)=>{
    req.session.destroy();
    res.redirect('/login');
})

app.get('/', (req,res)=>{

    devicesDB.find({}, {}, (err,data)=>{
        let devices = '';
        data.forEach(d=>{
            devices+=`<div>${d.name} - ${d.url}</div>`;

        })
        res.end(`
            <html>
                <head></head>
                <body>
                    ${devices}
                    <div><a href="devices/add">Add device</a></div>
                </body>
            </html>
        `)
    });


    
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
    devicesDB.insert({name, url}, (err)=>{
        console.error(err);
    });
    res.redirect('/');
})

app.listen(8080, ()=>{
    console.log('OSEL started on port 8080');
})