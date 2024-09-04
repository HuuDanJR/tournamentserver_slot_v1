const mongoose = require('mongoose')
// const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone')

const RoundRealTimeSchema = new mongoose.Schema({
    id: {
        type: String,required:false
    },
    name:{
        required:true,
        type:String
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
          }),//correct
        required:true,type:Date,
    },
    rankings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'rankings_realtime', // Make sure it matches the model name 'trips' defined in mongoose.model
        },
    ]
})


const Rounds = mongoose.model("rounds_realtime", RoundRealTimeSchema);
module.exports = Rounds;
