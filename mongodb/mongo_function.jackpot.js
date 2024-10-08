
const Jackpot  =  require('./model/jackpot.js')

// Function to find settings and emit them to the client
async function findJackpotAllSocket(name, io) {
  try {
    let jackpot = await Jackpot.findOne({ }).sort({ createdAt: -1 }).exec();
    
    if (!jackpot) {
      jackpot = await Jackpot.findOne({  }).sort({ createdAt: -1 }).exec();
    }
    console.log('findjackpotFirstSocket result: ',[jackpot])
    io.emit(name, [jackpot]);
   
  } catch (error) {
    throw new Error('Error fetching jackpot record: ' + error.message);
  }
}



// Function to find the latest jackpots of type 1 and type 2, and emit them to the client
async function findJackpotPriceSocket(name, io) {
  try {
    // Find the most recent jackpots with typeJackpot = 1 and typeJackpot = 2
    let jackpots = await Jackpot.find({
      typeJackpot: { $in: [1, 2] }
    })
      .sort({ createdAt: -1 })  // Sort by createdAt in descending order
      .limit(2)                  // Limit the result to 2 records
      .exec();

    // Emit the result to the client
    console.log('findJackpotPriceSocket result: ', jackpots);
    io.emit(name, jackpots);
  } catch (error) {
    throw new Error('Error fetching jackpot records: ' + error.message);
  }
}

// //export router for use
module.exports = {
  findJackpotAllSocket:findJackpotAllSocket,
  findJackpotPriceSocket:findJackpotPriceSocket
};
