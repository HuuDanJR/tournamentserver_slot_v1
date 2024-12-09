const mongoose = require('mongoose');
const moment = require('moment-timezone');

const TimeSchema = new mongoose.Schema({
    id: {
        type: String, unique: true
    },
    minutes: {
        type: Number,
        required: true,
    },
    seconds: {
        type: Number,
        required: true,
    },
    status: {
        type: Number,
        default:0,
        required: true,
        // 0 : init | 1 : ticking | 2 : pause | 3 : stop  | 4 restart
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

TimeSchema.pre('save', function(next) {
    this.updateAt = moment().tz("Asia/Bangkok").toDate();
    next();
});

const Time = mongoose.model('Time', TimeSchema);
module.exports = Time;
