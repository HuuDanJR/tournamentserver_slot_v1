const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const RankingRoundSchema = new mongoose.Schema({
    id: {
        type: Number,required:false
    },
    customer_name:{
        // required:true,
        type:String
    },
    customer_number: {
        // required: true,
        type: String,
    },
    point:{
        // required:true,
        type:Number,
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        type: Date,
    },

})



const RankingRounds = mongoose.model("ranking_rounds", RankingRoundSchema);
module.exports = RankingRounds;
