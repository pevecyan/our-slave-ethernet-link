const common = require('../common');
const fs = require('fs');

//let devicesDB = new DataStore({filename:__dirname+'/data/devices.data', autoload:true});

let devices = [];
try{
    let devicesData = fs.readFileSync('/data/tasmotaDevices', 'utf-8');
    if (devicesData){
        devices = JSON.parse(devicesData);
    }
}catch(err){}

class Devices{
   
    static GetDevices(){
        return new Promise((resolve, reject)=>{
            resolve(devices);
            /*devicesDB.find({}, {}, (err, data)=>{
                if (err) return resolve([]);
                return resolve(data);
            })*/
        })
    }

    static InsertDevice(name, url, id){
        return new Promise((resolve, reject)=>{
            devices.push({
                name, url, id
            })
            
            Devices.SaveDevices();
            return Promise.resolve();

            /*devicesDB.insert({name, url}, (err, data)=>{
                if (err) return reject();
                return resolve();
            })*/
        })
    }

    static GetDevice(id){
        return new Promise((resolve, reject)=>{

            let device = devices.find(a=>a.id == id);

            if (device) return resolve(device);
            return reject(); 

            /*devicesDB.find({_id:id}, {}, (err,data)=>{
                if (err || data.length == 0) return reject();
                return resolve(data[0]); 
            })*/
        })
    }

    static SaveDevices(){
        fs.writeFileSync('/data/tasmotaDevices', JSON.stringify(devices));
    }
}


module.exports = Devices;