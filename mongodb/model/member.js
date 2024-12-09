const mongoose = require('mongoose')
// const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone')

const MemberSchema = new mongoose.Schema({

    name:{
        required:true,
        type:String,
        default:"DF Member"
    },
    number:{
        required :true,
        type: String,
    },
    ip:{
        required:true,
        type:String,

    },
    deviceId:{
        type:String,
    },
    deviceName:{
        type:String,
    },
    deviceInfo:{
       type:String,
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        required:true,type:Date,
    },
    updateAt:{
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        required:true,type:Date,
    }

})

const Member = mongoose.model("members", MemberSchema);
module.exports = Member;
