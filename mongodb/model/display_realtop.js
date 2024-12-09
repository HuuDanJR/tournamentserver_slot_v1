const mongoose = require('mongoose')

const DisplaySchemaRealTop = new mongoose.Schema({
    id: {
        type: Number,required:false
    },
    name:{
        type:String,required:false,
    },
    enable: {
        required: true,
        type: Boolean,
        default:false
    },
    content:{
        type:String,
        default:"display page"
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        type: Date,
    },

})


const DisplaysRealTop = mongoose.model("displays_realtop", DisplaySchemaRealTop);
module.exports = DisplaysRealTop;
