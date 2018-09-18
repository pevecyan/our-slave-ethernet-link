const DataStore = require('nedb-core');
const common = require('../common');

let devicesDB = new DataStore({filename:__dirname+'/data/devices.data', autoload:true});

class Devices{
   
    static GetDevices(){
        return new Promise((resolve, reject)=>{
            devicesDB.find({}, {}, (err, data)=>{
                if (err) return resolve([]);
                return resolve(data);
            })
        })
    }

    static InsertDevice(name, url){
        return new Promise((resolve, reject)=>{
            devicesDB.insert({name, url}, (err, data)=>{
                if (err) return reject();
                return resolve();
            })
        })
    }

    static GetDevice(id){
        return new Promise((resolve, reject)=>{
            devicesDB.find({_id:id}, {}, (err,data)=>{
                if (err || data.length == 0) return reject();
                return resolve(data[0]); 
            })
        })
    }
}


module.exports = Devices;