const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose);

const RankingSchema = new mongoose.Schema({
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





// Add the auto-increment plugin to your schema
// RankingSchema.plugin(AutoIncrement, { inc_field: 'id', start_seq: 1 });


const Rankings = mongoose.model("rankings", RankingSchema);
module.exports = Rankings;
