const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const http = require('http');
const axios = require('axios');

//const Database = require('../database');
const common = require('../common');
const Devices = require('../database/Devices');
const Users = require('../database/Users');

let tokens = {};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const authorize = (req, res, next)=>{
    // next();
    let token = '';
    
    try {
        token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';
    } catch (err) {
        console.error(err);
    }

    if (tokens[token] || req.originalUrl.indexOf('voxior/api/login') > -1) {
        req.token = token;

        return next()
    }
    
    res.status(403).send('User not authenticated.')
    
}

router.use('/', authorize);
router.use(bodyParser.json());

router.post('/login', (req, res)=>{
    // check username and password

    let { username, password } = req.body;
    let passwordHash = common.passwordHash(password);

    Users.ValidateUser(username, passwordHash)
        .then(user=>{
            let token = common.getNewToken();
            tokens[token] = user;
            res.status(200).send({ token });
        })
        .catch(()=>{
            res.status(401).send({ err: 'UNAUTHORIZED', msg: 'Username and password does not match!' });
        })
});

router.post('/logout', (req, res)=>{
    // destroy session token
    if (req.token !== '' && tokens[req.token]) {
        Reflect.deleteProperty(tokens, req.token);
    }
    res.status(204).send();
})


router.get('/devices', (req, res)=>{


    Devices.GetDevices()
        .then(prepareDevices)
        .then(preparedDevices=>{
            res.status(200).json(preparedDevices);
        })
   
});

router.get('/devices/states/:id', (req, res)=>{
    const id = String(req.params.id);
    const query = req.query.query;

    Devices.GetDevice(id)
        .then((device)=>{
            axios.get(`http://${device.url}/cm?cmnd=Power`)
                .then(response=>{
                    let power = response.data.POWER == 'ON';
                    res.status(200).send(power);
                })
        })
    return;
    return res.status(200).send(String(false));


    Database.Devices.getById(id)
        .then((selectedDevice)=>{
            if (selectedDevice) {
                switch (query) {
                    case 'power':
                        res.status(200).send(String(selectedDevice.state));
                        break;
                    default:
                }
            } else {
                res.status(404).send();
            }
        })
        .catch((err)=>{
            console.log(err);
            res.statusCode(500).send(err);
        });    
});

router.post('/devices/:id', (req, res)=>{
    const id = String(req.params.id);
    const body = req.body;

    Devices.GetDevice(id)
        .then((device)=>{
            
            switch (body.action) {
                case 'turnOn':
                    http.get(`http://${device.url}/cm?cmnd=Power%20On`, (respo)=>{
                        res.status(200).send(true);
                    })
                    break;
                case 'turnOff':
                    http.get(`http://${device.url}/cm?cmnd=Power%20Off`, (respo)=>{
                        res.status(200).send(true);
                    })
                    break;
                default:
                    res.status(404).send();
            }
        })

    /*if (tokens[req.token].devices.indexOf(id) === -1) {
        return res.status(400).send({ msg: 'Not user device' });
    }

    switch (body.action) {
        case 'turnOn':
            devices.execute(id, 'on')
                .then((state)=>{
                    res.status(200).send(state);
                })
                .catch((err)=>{
                    res.status(400).send(err);
                })
            break;
        case 'turnOff':
            devices.execute(id, 'off')
                .then((state)=>{
                    res.status(200).send(state);
                })
                .catch((err)=>{
                    res.status(400).send(err);
                })
            break;
        default:
            res.status(404).send();
    }*/
});



/**
 * 
 * @param {Array} devicesD devices 
 * @return {Array} prepared devices
 */
function prepareDevices (devicesD) {
    let newDevices = [];

    devicesD.forEach((device)=>{
        newDevices.push({
            actions: [
                'turnOn',
                'turnOff'
            ],
            queryTypes: [
                'power'
            ],
            id: device._id,
            name: device.name,
            room: 'Other',
            type: 'SWITCH'
        })
    })

    return newDevices;
}

module.exports = router;