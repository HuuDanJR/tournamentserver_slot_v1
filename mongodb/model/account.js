var mongoose = require('mongoose');
const moment = require('moment-timezone');
const { ObjectId } = mongoose.Types;

const AccountSchema = new mongoose.Schema({
    
    username:{
        type:String,unique: true,
    },
    password:{
        type:String,
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString(),//correct
        required:true,type:String,
    },
    
});

const Account = mongoose.model("accounts", AccountSchema);
module.exports = Account;
