const connection = require("../mysql/mysql_dbconfig");
const settings = require("../socket/socket_handler.js");
const settings2 = require("../socket/socket_handler.js");





let lastExecutionTime = 0;
let previousAverageCredit = null; // Track the previous averageCredit
let timeCount = 0; // Time count variable to increment for each run
let hasDropped = false; // Track whether the drop has occurred
let returnValue = settings.returnValue || 100; // Initialize return value
let oldValue = settings.oldValue || 100; // Initialize old value

//VEGAS PRICE
async function findJackpotNumberSocket(name, io, init = false, settings, exceptNum = null) {
  try {
    if (init) {
      // Reset flags and values when init is true
      hasDropped = false;
      returnValue = settings.returnValue; // Reset returnValue to default
      oldValue = settings.oldValue; // Reset oldValue to default
      previousAverageCredit = null; // Reset previousAverageCredit
      timeCount = 0; // Reset timeCount
      lastExecutionTime = 0;
      // Reset selectedIp in settings to default (null or 0) when initialized
      settings.selectedIp = null;
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
        selectedIp: settings.selectedIp, // Set ip to default value 0
      };

      io.emit(name, defaultData);
      console.log( `Init condition met, emitting default data: ${JSON.stringify(defaultData )}`);
      // return; // Exit the function after emitting default data
    }

    const currentTime = Date.now();
    // Throttle the execution if the interval is too short
    if (currentTime - lastExecutionTime < settings.throttleInterval) {
      return;
    }
    lastExecutionTime = currentTime;
    timeCount++; // Increment the time count on each run

    let query = `SELECT credit,bet, ip,status, member FROM stationdata WHERE display = 1 ORDER BY credit DESC LIMIT 10`;
    // Query the database for the top 10 records
    connection.query(query, async function (err, result, fields) {
      // console.log('VEGAS JP DATA',result)
      if (err) {
        console.log(err);
      } else {
        // Map credit values and divide by 100
        let newCredits = result.map((item) => parseFloat(item.bet) / 100);
        // Sum the credits and calculate the average
        let totalCredit = newCredits.reduce((sum, bet) => sum + bet, 0);
        let averageCredit = (totalCredit / newCredits.length) * settings.percent;
        let diff = null; // Initialize the diff value as null
        let drop = false; // Initialize drop variable
     // SELECTE IP LOCGIC  Filter IP addresses where status = 0 and credit > 0
     let availableIps = result.filter((item) => item.status === 0 && parseFloat(item.bet) > 0).map((item) => item.ip);

     let selectedIp = settings.selectedIp;  // Start with the current selected IP

     if (availableIps.length > 1) {
     // More than one IP available, exclude exceptNum and select a random one
     availableIps = availableIps.filter(ip => ip !== exceptNum);

     // Only proceed if there are still IPs left after filtering
     if (availableIps.length > 0) {
     selectedIp = availableIps[Math.floor(Math.random() * availableIps.length)];
     console.log(`Selected IP VEGAS FUNCTION: ${selectedIp}`);
     settings.selectedIp = selectedIp;
     } else {
     console.log(`No available IP 1  after excluding ${exceptNum}`);
     }
     } else if (availableIps.length === 1) {
     // Exactly one IP available, assign the exceptNum as the selected IP
     settings.selectedIp = availableIps[0];
     console.log(`Only one IP available, selected: ${settings.selectedIp}`);
     } else {
     // No IPs available
     console.log("Lucky prize. No IP with status = 0 available, skipping IP emit");
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
          console.log(`${timeCount}. init : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${oldValue}, drop: ${drop},selectIp: ${selectedIp}, percent: ${settings.percent}`);
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
          }
          // Set drop based on the returnValue range
          drop = returnValue >= settings.defaultThreshold && returnValue <= settings.limit;
          // Emit the averageCredit along with the status only if not dropped
          if (!hasDropped) {
            if (returnValue > settings.limit) {
              returnValue = settings.limit; // Set returnValue to the limit
            }            
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
            console.log(`#VEGAS.${timeCount}.${status}:${averageCredit},${diff},${oldValue},${returnValue},${drop},${selectedIp},${settings.percent}`);
          } else {
            console.log("VEGAS PRIZE. DROPPED!!");
          }
        }
        // If drop condition is met, keep the returnValue as oldValue
        if (drop) {
          // Emit one last time before stopping further emissions
          // console.log('Emit one last time before stopping further emissions');
          if (!hasDropped && selectedIp != exceptNum) {
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
            console.log(`${timeCount}| dropped : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp: ${selectedIp},percent: ${settings.percent}`
            );
          }
          else if (!hasDropped && selectedIp === exceptNum) {
            hasDropped = true; // Set dropped state
            const emitData = {
              averageCredit,
              status: "dropped with exceptNum",
              timeCount,
              diff,
              oldValue,
              returnValue,
              drop,
            };
            if (selectedIp) {
              emitData.ip = exceptNum;
            }
            io.emit(name, emitData);
            console.log(`${timeCount}| dropped dropped with exceptNum : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp: ${exceptNum},percent: ${settings.percent}`
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


//export router for use
module.exports = {
  findJackpotAllSocket: findJackpotAllSocket,
  findJackpotPriceSocket: findJackpotPriceSocket,
  findJackpotNumberSocket: findJackpotNumberSocket,
};
