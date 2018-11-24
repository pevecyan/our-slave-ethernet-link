const common = require('../common');
const fs = require('fs');



//let usersDB = new DataStore({filename:__dirname+'/data/users.data', autoload:true});

let users = [];
try{
    let usersData = fs.readFileSync('/data/tasmotaUsers', 'utf-8');
    if (usersData){
        users = JSON.parse(usersData);
    }
}catch(err){}


class Users{
    static InitilizeUsers(){
        let adminUser = users.find(a=>a.username == 'admin');
        if (!adminUser){
            users.push({username:'admin', password:common.passwordHash('jazsemoselkernisemspremenilgesla')})
            Users.SaveUsers();
        }
        /*usersDB.find({username:'admin'}, {}, (err, data)=>{
            if (err){return console.error(err);}
            if (data.length == 0){ usersDB.insert({username:'admin', password:common.passwordHash('jazsemoselkernisemspremenilgesla')});}
        })*/
    }
    static ValidateUser(username, password){
        return new Promise((resolve, reject)=>{
            let user = users.find(a=>a.username == username && a.password == password);
            if (user) return resolve(user);
            return reject();
            /*usersDB.find({username, password}, {}, (err, data)=>{
                if (err || data.length == 0) return reject();
                return resolve(data[0]);
            })*/
        })
    }
    static SaveUsers(){
        fs.writeFileSync('/data/tasmotaUsers', JSON.stringify(users));
    }
}


module.exports = Users;

Users.InitilizeUsers()