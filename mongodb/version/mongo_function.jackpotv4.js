const Jackpot = require("../model/jackpot.js");
const connection = require("../../mysql/mysql_dbconfig.js");
const settings = require("../../socket/socket_handler.js");
let lastExecutionTime = 0;
let previousAverageCredit = null; // Track the previous averageCredit
let timeCount = 0; // Time count variable to increment for each run
let hasDropped = false; // Track whether the drop has occurred
let returnValue = settings.returnValue || 100; // Initialize return value
let oldValue = settings.oldValue || 100; // Initialize old value
// Set global returnValue and oldValue to settings values before calling your function

async function findJackpotNumberSocket(name, io, init = false, settings) {
  // console.log(`Global settings & returnValue: ${oldValue} ${returnValue}`, );
  try {
    if (init) {
      // Reset flags and values when init is true
      hasDropped = false;
      returnValue = settings.returnValue; // Reset returnValue to default
      oldValue = settings.oldValue; // Reset oldValue to default
      previousAverageCredit = null; // Reset previousAverageCredit
      timeCount = 0; // Reset timeCount
      lastExecutionTime = 0;

      // Emit default data when init is true
      const defaultData = {
        averageCredit: 0,
        status: "init",
        timeCount: 0,
        diff: 0,
        oldValue: settings.oldValue,
        returnValue: settings.oldValue,
        limit: settings.limit,
        drop: false,
        selectedIp: 0, // Set ip to default value 0
      };

      io.emit(name, defaultData);
      console.log(
        `Init condition met, emitting default data: ${JSON.stringify(
          defaultData
        )}`
      );
      // return; // Exit the function after emitting default data
    }

    const currentTime = Date.now();
    // Throttle the execution if the interval is too short
    if (currentTime - lastExecutionTime < settings.throttleInterval) {
      return;
    }
    lastExecutionTime = currentTime;
    timeCount++; // Increment the time count on each run

    let query = `SELECT credit, ip,status, member FROM stationdata WHERE display = 1 ORDER BY credit DESC LIMIT 10`;
    // Query the database for the top 10 records
    connection.query(query, async function (err, result, fields) {
      if (err) {
        console.log(err);
      } else {
        // Map credit values and divide by 100
        let newCredits = result.map((item) => parseFloat(item.credit) / 100);

        // Sum the credits and calculate the average
        let totalCredit = newCredits.reduce((sum, credit) => sum + credit, 0);
        let averageCredit =
          (totalCredit / newCredits.length) * settings.percent;

        let diff = null; // Initialize the diff value as null
        let drop = false; // Initialize drop variable

        // Filter IP addresses where status = 0 and credit > 0
        let availableIps = result
          .filter((item) => item.status === 0 && parseFloat(item.credit) > 0)
          .map((item) => item.ip); // Randomly select an IP if any are available
        let selectedIp = null;
        if (availableIps.length > 0) {
          selectedIp =
            availableIps[Math.floor(Math.random() * availableIps.length)];
          // console.log(`Selected IP: ${selectedIp}`);
        } else {
          console.log("No IP with status = 0 available, skipping IP emit");
        }
        // Emit the initial averageCredit if it's the first run
        if (previousAverageCredit === null) {
          initialAverageCredit = averageCredit; // Store the initial averageCredit
          io.emit(name, {
            averageCredit,
            status: "init",
            timeCount,
            diff,
            oldValue,
            returnValue,
            drop,
            selectedIp,
          });
          console.log(
            `${timeCount}| init : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${oldValue}, drop: ${drop},selectIp: ${selectedIp}, percent: ${settings.percent}`
          );
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
          diff = averageCredit - initialAverageCredit;
          // Ensure returnValue does not exceed the limit
          if (returnValue > settings.limit) {
            returnValue = settings.limit; // Set returnValue to the limit
            hasDropped = true; // Set the drop flag to true
          }
          // Set drop based on the returnValue range
          drop = returnValue >= settings.defaultThreshold && returnValue <= settings.limit;

          // Emit the averageCredit along with the status only if not dropped
          if (!hasDropped) {
            // io.emit(name, { averageCredit, status, timeCount, diff, oldValue, returnValue, drop });
            const emitData = {
              averageCredit,
              status: "dropped",
              timeCount,
              diff,
              oldValue,
              returnValue,
              drop,
            };
            if (selectedIp) {
              emitData.ip = selectedIp;
            }
            io.emit(name, emitData);
            console.log( `${timeCount}| ${status} : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp:${selectedIp},percent: ${settings.percent}`
            );
          } else {
            console.log("dropped");
          }
        }
        // If drop condition is met, keep the returnValue as oldValue
        if (drop) {
          // Emit one last time before stopping further emissions
          if (!hasDropped) {
            hasDropped = true; // Set dropped state
            const emitData = {
              averageCredit,
              status: "dropped",
              timeCount,
              diff,
              oldValue,
              returnValue,
              drop,
            };
            if (selectedIp) {
              emitData.ip = selectedIp;
            }
            io.emit(name, emitData);
            console.log(
              `${timeCount}| dropped : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp: ${selectedIp},percent: ${settings.percent}`
            );
          }
        } else {
          // Update oldValue to be the current returnValue before the next run
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
