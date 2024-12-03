const mongoose = require('mongoose')
// const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone')

const DeviceSchema = new mongoose.Schema({
    
    deviceId:{
        required:true,
        type:String,
    },
    deviceName:{
        required :true,
        type: String,
    },
    deviceInfo:{
        type:String,
        default: "device info"
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
          }),
        required:true,type:Date,
    },
   
   
})

const Member = mongoose.model("devices", DeviceSchema);
module.exports = Member;
