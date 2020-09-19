const jwt = require('jsonwebtoken');

exports.getAccount = token => {
    let decode_data;
    try{
        decode_data = jwt.verify(token, process.env.JWT_SECRET);
        if(!decode_data.user_id)
        {
            decode_data = null;
        }
        //console.log(token +'\n'+ decode_data);
    }
    catch (e) {
        decode_data = null;
        console.log("json verify error : \n" + e);
    }
    finally {
        return decode_data;
    }
};