const mongoose = require('mongoose')

const JackpotSchema = new mongoose.Schema({
    id: {
        type: String,required:false
    },
    typeJackpot:{
        required :true,
        type:Number,
        
    },
    name:{
        required:true,
        type:String
    },
    initValue: {
        required:true,
        type:Number,
    },
    startValue: {
        required: true,
        type: Number,
    },
    endValue:{
        required:true,
        type:Number,
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
    hitDateTime: {
        default: Date.now(),
        type: Date,
    },
    hitValue:{
        required: true,
        type:Number,
    },
    //machine hit id
    machineId:{
        type:Number,
    },
    
});


const Jackpots = mongoose.model("jackpots", JackpotSchema);
module.exports = Jackpots;
