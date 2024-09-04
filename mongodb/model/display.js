const mongoose = require('mongoose')

const DisplaySchema = new mongoose.Schema({
    id: {
        type: Number,required:false
    },
    name:{
        required:true,
        type:String
    },
    enable: {
        required: true,
        type: Boolean,
        default:false
    },
    content:{
        required:true,
        type:String,
        default:"display page"
    },
    createdAt: {
        default: Date.now(),
        type: Date,
    },
    
})


const Displays = mongoose.model("displays", DisplaySchema);
module.exports = Displays;
