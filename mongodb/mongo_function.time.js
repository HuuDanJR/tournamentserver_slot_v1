
const Time  =  require('./model/time.js')

// Function to find settings and emit them to the client
async function findTimeFirstSocket(name, io) {
  try {
    let time = await Time.findOne({ active: true }).sort({ createdAt: -1 }).exec();
    
    if (!time) {
      time = await Time.findOne({ active: false }).sort({ createdAt: -1 }).exec();
    }
    console.log('findTimeFirstSocket Reuslt: ',time)
    io.emit(name, time);
   
  } catch (error) {
    throw new Error('Error fetching time record: ' + error.message);
  }
}
// //export router for use
module.exports = {
  findTimeFirstSocket:findTimeFirstSocket
};
