const connection = require("../mysql/mysql_dbconfig.js");
const settings = require("../socket/socket_handler.js");
let lastExecutionTime = 0;
let previousAverageCredit = null; // Track the previous averageCredit
let timeCount = 0; // Time count variable to increment for each run
let hasDropped = false; // Track whether the drop has occurred
let returnValue = settings.returnValue || 50; // Initialize return value
let oldValue = settings.oldValue || 50; // Initialize old value


//JACKPOT PRICE
async function findJackpot2NumberSocket(name, io, init = false, settings) {
  try {
    if (init) {
      hasDropped = false;
      returnValue = settings.returnValue; // Reset returnValue to default
      oldValue = settings.oldValue; // Reset oldValue to default
      previousAverageCredit = null; // Reset previousAverageCredit
      timeCount = 0; // Reset timeCount
      lastExecutionTime = 0;

      const defaultData = {
        averageCredit: 0,
        status: "lucky price. init ",
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
        `lucky price. Init condition met, emitting default data: ${JSON.stringify(
          defaultData
        )}`
      );
    }

    const currentTime = Date.now();
    if (currentTime - lastExecutionTime < settings.throttleInterval) {
      return;
    }
    lastExecutionTime = currentTime;
    timeCount++; // Increment the time count on each run
    let query = `SELECT credit, ip,status, member FROM stationdata WHERE display = 1 ORDER BY credit DESC LIMIT 10`;
    connection.query(query, async function (err, result, fields) {
      if (err) {
        console.log(err);
      } else {
        let newCredits = result.map((item) => parseFloat(item.credit) / 100);
        // Sum the credits and calculate the average
        let totalCredit = newCredits.reduce((sum, credit) => sum + credit, 0);
        let averageCredit = (totalCredit / newCredits.length) * settings.percent;
        let diff = null; // Initialize the diff value as null
        let drop = false; // Initialize drop variable
        let availableIps = result .filter((item) => item.status === 1 && parseFloat(item.credit) > 0).map((item) => item.ip); // Randomly select an IP if any are available
        let selectedIp = null;
        if (availableIps.length > 0) {
          selectedIp =  availableIps[Math.floor(Math.random() * availableIps.length)];
        } else {
          console.log("lucky prize. No IP with status = 0 available, skipping IP emit");
        }
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
          console.log(`lucky prize. ${timeCount}. init : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${oldValue}, drop: ${drop},selectIp: ${selectedIp}, percent: ${settings.percent}`);
        } else {
          let status; // Compare current averageCredit with the previous one
          if (averageCredit > previousAverageCredit) {
            status = "lucky prize. increase";
            returnValue += averageCredit; // Update returnValue on increase
          } else if (averageCredit < previousAverageCredit) {
            status = "lucky prize. decrease";
            returnValue += averageCredit; // Update returnValue on decrease
          } else {
            status = "lucky prize. same";
          }
          diff = averageCredit - initialAverageCredit;
          if (returnValue > settings.limit) {
            returnValue = settings.limit; // Set returnValue to the limit
          }
          drop = returnValue >= settings.defaultThreshold && returnValue <= settings.limit;
          if (!hasDropped) {
            if (returnValue > settings.limit) {
              returnValue = settings.limit; // Set returnValue to the limit
            }            
            const emitData = {
              averageCredit,
              status: "lucky prize. dropped",
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
            console.log(`lucky prize. ${timeCount}. ${status} : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp:${selectedIp},percent: ${settings.percent}`);
          } else {
            console.log("lucky prize. dropped jp");
            // console.log(`lucky prize. *${timeCount}. ${status} : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp:${selectedIp},percent: ${settings.percent}`);
          }
        }
        // If drop condition is met, keep the returnValue as oldValue
        if (drop) {
          // Emit one last time before stopping further emissions
          if (!hasDropped) {
            hasDropped = true; // Set dropped state
            const emitData = {
              averageCredit,
              status: "lucky prize. dropped",
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
            console.log(`lucky prize. ${timeCount}.dropped : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp: ${selectedIp},percent: ${settings.percent}`
            );
          }
        } else {
          oldValue = returnValue;
          previousAverageCredit = averageCredit;
        }
      }
    });
  } catch (error) {
    throw new Error("lucky prize. Error fetching jackpot number records: " + error.message);
  }
}





//export router for use
module.exports = {
  findJackpot2NumberSocket: findJackpot2NumberSocket,
};
