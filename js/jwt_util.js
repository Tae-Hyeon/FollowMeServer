const jwt = require('jsonwebtoken');

exports.getAccount = token => {
    let decode_data = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(token +'\n'+ decode_data);
    return decode_data;
};