const crypto = require('crypto');
const uuid = require('uuid');

module.exports.passwordHash = (password)=>{
    let hash = crypto.createHash('sha256');

    hash.update(password+'supersafesaltnobodywilleverguess');

    return hash.digest('hex');
}

module.exports.getNewToken = ()=>{
    let hash = crypto.createHash('sha256');

    hash.update(uuid.v4());

    return hash.digest('hex');
}
