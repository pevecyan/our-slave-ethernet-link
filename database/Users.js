const DataStore = require('nedb-core');
const common = require('../common');

let usersDB = new DataStore({filename:__dirname+'/data/users.data', autoload:true});

class Users{
    static InitilizeUsers(){
        usersDB.find({username:'admin'}, {}, (err, data)=>{
            if (err){return console.error(err);}
            if (data.length == 0){ usersDB.insert({username:'admin', password:common.passwordHash('jazsemoselkernisemspremenilgesla')});}
        })
    }
    static ValidateUser(username, password){
        return new Promise((resolve, reject)=>{
            usersDB.find({username, password}, {}, (err, data)=>{
                if (err || data.length == 0) return reject();
                return resolve(data[0]);
            })
        })
    }
}


module.exports = Users;

Users.InitilizeUsers()