const mongoose = require('mongoose');
const deviceModel = require('./model/device');


async function listDevices  (name,io)  {
  console.log("listDevices access");
  try {
    const data = await deviceModel.find();
    if (!data || data.length === 0) {
      io.emit(name, []);
    }
    console.log(data);
    io.emit(name, data);
  } catch (err) {
    throw new Error('Error fetching devices: ' + err.message);
  }
};




module.exports = {
  listDevices:listDevices
}
