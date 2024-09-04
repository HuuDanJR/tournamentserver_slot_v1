const mongoose = require('mongoose')
// const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone')

const RoundSchema = new mongoose.Schema({
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
            ref: 'ranking_rounds', // Make sure it matches the model name 'trips' defined in mongoose.model
        },
    ]
})
// Apply the auto-increment plugin to the 'id' field
// RoundSchema.plugin(AutoIncrement, { inc_field: 'id' });

const Rounds = mongoose.model("rounds", RoundSchema);
module.exports = Rounds;
