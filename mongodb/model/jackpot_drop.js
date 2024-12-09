const mongoose = require('mongoose');
const moment = require('moment');

const JackpotHitSchema = new mongoose.Schema({

    name:{
        required:true,
        type:String
    },
    value: {
        type:Number,
    },
    //machine hit id
    machineId:{
        type:Number,
    },
    count: {
        required: true,
        type: Number,
    },
    status:{
        required:true,
        type:Boolean,
        default:true,
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        type: Date,
    },





})


const JackpotHits = mongoose.model("jackpot_hits", JackpotHitSchema);
module.exports = JackpotHits;
