
const Time  =  require('./model/time.js')

// Function to find settings and emit them to the client
async function findTimeFirstSocket(name, io) {
  try {
    let time = await Time.findOne({ active: true }).sort({ createdAt: -1 }).exec();
    if (!time) {
      time = await Time.findOne({ active: false }).sort({ createdAt: -1 }).exec();
    }
    // console.log('findTimeFirstSocket Reuslt: ',[time])
    io.emit(name, [time]);
   
  } catch (error) {
    throw new Error('Error fetching time record: ' + error.message);
  }
}


// Function to find latest time get id and update 
async function updateTimeByIdSocket(name, io,updateData) {
  try {
    let time = await Time.findOne({ active: true }).sort({ createdAt: -1 }).exec();
    if (!time) {
      time = await Time.findOne({ active: false }).sort({ createdAt: -1 }).exec();
    }
    if (!time) {
      throw new Error('No time record found to update.');
    }
    let updatedTime = await Time.findByIdAndUpdate(
      time._id,              // Use the _id of the found time record
      { $set: updateData },   // The new data to update
      { new: true }           // Return the updated document
    ).exec();

    console.log('updateTimeFirstSocket Result:', updatedTime);
    io.emit(name, updatedTime);

  } catch (error) {
    throw new Error('Error updating time record: ' + error.message);
  }
}




// //export router for use
module.exports = {
  findTimeFirstSocket:findTimeFirstSocket,
  updateTimeByIdSocket:updateTimeByIdSocket,
};
