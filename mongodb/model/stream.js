const mongoose = require('mongoose');
const moment = require('moment-timezone');

const StreamSchema = new mongoose.Schema({
    id: {
        type: String, unique: true
    },
    name:{
        type:String, default: "PLAYER",
        required:true
    },
    url: {
        type: String,
        required: true,
    },
    active: {
        type:Boolean,
        required:true,
        default:false,
    },
    createdAt: {
        type: Date,
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        required: true
    },
    updateAt: {
        type: Date,
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        required: true
    },
});

StreamSchema.pre('save', function(next) {
    this.updateAt = moment().tz("Asia/Bangkok").toDate();
    next();
});

const Stream = mongoose.model('streams', StreamSchema);
module.exports = Stream;
