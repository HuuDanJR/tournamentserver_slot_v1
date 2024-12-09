const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const RankingRealTimeSchema = new mongoose.Schema({
    id: {
        type: Number,required:false
    },
    roundName :{
        required:true,type:String,unique:false,
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



const RankingsRealTime = mongoose.model("rankings_realtime", RankingRealTimeSchema);
module.exports = RankingsRealTime;
