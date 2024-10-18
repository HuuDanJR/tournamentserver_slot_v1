const Jackpot = require("../model/jackpot.js");

// Function to find settings and emit them to the client
async function findJackpotAllSocket(name, io) {
  try {
    let jackpot = await Jackpot.findOne({}).sort({ createdAt: -1 }).exec();

    if (!jackpot) {
      jackpot = await Jackpot.findOne({}).sort({ createdAt: -1 }).exec();
    }
    console.log("findjackpotFirstSocket result: ", [jackpot]);
    io.emit(name, [jackpot]);
  } catch (error) {
    throw new Error("Error fetching jackpot record: " + error.message);
  }
}

// Function to find the latest jackpots of type 1 and type 2, and emit them to the client
async function findJackpotPriceSocket(name, io) {
  try {
    // Find the most recent jackpots with typeJackpot = 1 and typeJackpot = 2
    let jackpots = await Jackpot.find({
      typeJackpot: { $in: [1, 2] },
    })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(2) // Limit the result to 2 records
      .exec();

    // Emit the result to the client
    console.log("findJackpotPriceSocket result: ", jackpots.length);
    io.emit(name, jackpots);
  } catch (error) {
    throw new Error("Error fetching jackpot records: " + error.message);
  }
}

const connection = require("../../mysql/mysql_dbconfig.js");
let lastExecutionTime = 0;
const throttleInterval = 10000; // 5 seconds interval
let previousAverageCredit = null; // Track the previous averageCredit
let timeCount = 0; // Time count variable to increment for each run
let initialAverageCredit = null; // Track the initial averageCredit for diff calculation
let returnValue = 100; // Initialize return value with default 100
let oldValue = 100; // Initialize oldValue with 100 as well
const limit = 150; // Set the limit value
const defaultThreshold = 135; // Set default threshold variable


async function findJackpotNumberSocket(name, io) {
  try {
    const currentTime = Date.now();

    // Throttle the execution if the interval is too short
    if (currentTime - lastExecutionTime < throttleInterval) {
      return;
    }
    lastExecutionTime = currentTime;
    timeCount++; // Increment the time count on each run

    let query = `SELECT credit, ip, member FROM stationdata WHERE display = 1 ORDER BY credit DESC LIMIT 10`;
    // Query the database for the top 10 records
    connection.query(query, async function (err, result, fields) {
      if (err) {
        console.log(err);
      } else {
        // Map credit values and divide by 100
        let newCredits = result.map((item) => parseFloat(item.credit) / 100);
        // Sum the credits and calculate the average
        let totalCredit = newCredits.reduce((sum, credit) => sum + credit, 0);
        let averageCredit = (totalCredit / newCredits.length) * 0.1;
        // console.log(`Average credit (sum/total * 0.01): ${averageCredit}`);
        let diff = null; // Initialize the diff value as null
        let drop = false; // Initialize the drop variable

        // Emit the initial averageCredit if it's the first run
        if (previousAverageCredit === null) {
          initialAverageCredit = averageCredit; // Store the initial averageCredit
          returnValue += averageCredit;
          // Ensure returnValue is within the limit
          returnValue = Math.min(Math.max(returnValue, 100), limit);
          // Set drop based on the returnValue range
          drop = returnValue >= defaultThreshold && returnValue <= limit;

          io.emit(name, { averageCredit, status: "init", timeCount, diff,oldValue,returnValue ,drop});
          console.log( `${timeCount}| init : ${averageCredit} , diff: ${diff},oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop} `);
        } else {
          let status; // Compare current averageCredit with the previous one
          if (averageCredit > previousAverageCredit) {
            status = "increase";
            returnValue += averageCredit; // Update returnValue on increase
          } else if (averageCredit < previousAverageCredit) {
            status = "decrease";
            returnValue += averageCredit; // Update returnValue on decrease
          } else {
            status = "same";
          }
          
           // Ensure returnValue is within the limit
           returnValue = Math.min(Math.max(returnValue, 100), limit);
           diff = averageCredit - initialAverageCredit;
 
           // Set drop based on the returnValue range
           drop = returnValue >= defaultThreshold && returnValue <= limit;
 
           // If drop is true, keep returnValue as oldValue
           if (drop) {
             returnValue = oldValue; // Keep returnValue as oldValue
           }

          // Emit the averageCredit along with the status
          io.emit(name, { averageCredit, status, timeCount, diff,oldValue,returnValue,drop });
          console.log(`${timeCount}| ${status} : ${averageCredit} , diff: ${diff},oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop}`);
        }
        // Update oldValue to be the current returnValue before the next run
        if(!drop){
          oldValue = returnValue;
          // Update the previousAverageCredit for the next run
          previousAverageCredit = averageCredit;
        }
      }
    });
  } catch (error) {
    throw new Error("Error fetching jackpot number records: " + error.message);
  }
}

// async function findJackpotNumberSocket(name,io){
//   try {
//     const currentTime = Date.now();
//     if (currentTime - lastExecutionTime < throttleInterval) {
//       return;
//     }
//     lastExecutionTime = currentTime;
//     let query = `SELECT credit, ip,member FROM stationdata WHERE display = 1 ORDER BY credit DESC LIMIT 10 `;
//     connection.query(query, async function (err, result, fields) {
//       if (err) {
//         console.log(err);
//       } else {
//         let newCredits = result.map(item => parseFloat(item.credit) / 100);
//         // Sum newCredits and divide by the number of records, then multiply by 0.01
//         let totalCredit = newCredits.reduce((sum, credit) => sum + credit, 0);
//         let averageCredit = (totalCredit / newCredits.length) * 0.01;
//         console.log(`Average credit (sum/total * 0.01): ${averageCredit}`);
//         // console.log('findJackpotNumberSocket initial: receive data each 5s')
//         io.emit(name, [averageCredit]);

//       }
//   });
//   } catch (error) {
//     throw new Error('Error fetching jackpot number records: ' + error.message);
//   }
// }

//export router for use
module.exports = {
  findJackpotAllSocket: findJackpotAllSocket,
  findJackpotPriceSocket: findJackpotPriceSocket,
  findJackpotNumberSocket: findJackpotNumberSocket,
};
