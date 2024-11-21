const connection = require("../mysql/mysql_dbconfig.js");
const settings = require("../socket/socket_handler.js");
let lastExecutionTime = 0;
let previousAverageCredit = null; // Track the previous averageCredit
let timeCount = 0; // Time count variable to increment for each run
let hasDropped = false; // Track whether the drop has occurred
let returnValue = settings.returnValue || 50; // Initialize return value
let oldValue = settings.oldValue || 50; // Initialize old value


//JACKPOT PRICE
async function findJackpot2NumberSocket(name, io, init = false, settings,exceptNum = null) {
  try {
    if (init) {
      hasDropped = false;
      returnValue = settings.returnValue; // Reset returnValue to default
      oldValue = settings.oldValue; // Reset oldValue to default
      previousAverageCredit = null; // Reset previousAverageCredit
      timeCount = 0; // Reset timeCount
      lastExecutionTime = 0;
      settings.selectedIp = null;


      const defaultData = {
        averageCredit: 0,
        status: "init2 ",
        timeCount: 0,
        diff: 0,
        oldValue: settings.oldValue,
        returnValue: settings.oldValue,
        limit: settings.limit,
        drop: false,
        selectedIp: settings.selectedIp, // Set ip to default value 0
      };

      io.emit(name, defaultData);
      console.log(`Init2  condition met, emitting default data: ${JSON.stringify(
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
    let query = `SELECT credit,bet,ip,status, member FROM stationdata WHERE display = 1 ORDER BY credit DESC LIMIT 10`;
    connection.query(query, async function (err, result, fields) {
      if (err) {
        console.log(err);
      } else {
        let newCredits = result.map((item) => parseFloat(item.bet) / 100);
        // Sum the credits and calculate the average
        let totalCredit = newCredits.reduce((sum, bet) => sum + bet, 0);
        let averageCredit = (totalCredit / newCredits.length) * settings.percent;
        let diff = null; // Initialize the diff value as null
        let drop = false; // Initialize drop variable


      // SELECTE IP LOCGIC  Filter IP addresses where status = 0 and credit > 0
      let availableIps = result.filter((item) => item.status === 1 && parseFloat(item.bet) > 0).map((item) => item.ip);

      let selectedIp = settings.selectedIp;  // Start with the current selected IP

      if (availableIps.length > 1) {
      // More than one IP available, exclude exceptNum and select a random one
      availableIps = availableIps.filter(ip => ip !== exceptNum);

      // Only proceed if there are still IPs left after filtering
      if (availableIps.length > 0) {
      selectedIp = availableIps[Math.floor(Math.random() * availableIps.length)];
      console.log(`Selected IP LUCKY FUNCTION: ${selectedIp}`);
      settings.selectedIp = selectedIp;
      } else {
      console.log(`No available IP 2  after excluding ${exceptNum}`);
      }
      } else if (availableIps.length === 1) {
      // Exactly one IP available, assign the exceptNum as the selected IP
      settings.selectedIp = availableIps[0];
      console.log(`Only one IP available, selected: ${settings.selectedIp}`);
      } else {
      // No IPs available
      console.log("Lucky prize. No IP with status = 0 available, skipping IP emit");
      }



     if (previousAverageCredit === null) {
          initialAverageCredit = averageCredit; // Store the initial averageCredit
          io.emit(name, {
            averageCredit,
            status: "init2",
            timeCount,
            diff,
            oldValue,
            returnValue,
            drop,
            selectedIp,
          });
          console.log(`${timeCount}. init2: ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${oldValue}, drop: ${drop},selectIp: ${selectedIp}, percent: ${settings.percent}`);
        } else {
          let status; // Compare current averageCredit with the previous one
          if (averageCredit > previousAverageCredit) {
            status = "increase2";
            returnValue += averageCredit; // Update returnValue on increase
          } else if (averageCredit < previousAverageCredit) {
            status = "decrease2";
            returnValue += averageCredit; // Update returnValue on decrease
          } else {
            status = "same2";
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
              status: `LUCKY PRIZE. DROPPED!!! ${selectedIp}`,
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
            console.log(`#LUCKY.${timeCount}.${status}:${averageCredit},${diff},${oldValue},${returnValue},${drop},${selectedIp},${settings.percent}`);
          } else {
            console.log("lucky prize. dropped jp");
            // console.log(`lucky prize. *${timeCount}. ${status} : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp:${selectedIp},percent: ${settings.percent}`);
          }
        }
        // If drop condition is met, keep the returnValue as oldValue
        if (drop) {
          // Emit one last time before stopping further emissions
          if (!hasDropped && selectedIp != exceptNum) {
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
            console.log(`${timeCount}.dropped2: ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp: ${selectedIp},percent: ${settings.percent}`
            );
          }

        //   else if (!hasDropped && selectedIp === exceptNum) {
        //     hasDropped = true; // Set dropped state
        //     const emitData = {
        //       averageCredit,
        //       status: "dropped with exceptNum",
        //       timeCount,
        //       diff,
        //       oldValue,
        //       returnValue,
        //       drop,
        //     };
        //     if (selectedIp) {
        //       emitData.ip = exceptNum;
        //     }
        //     io.emit(name, emitData);
        //     console.log(`${timeCount}. dropped dropped with exceptNum : ${averageCredit} , diff: ${diff}, oldValue: ${oldValue}, value: ${returnValue}, drop: ${drop},selectedIp: ${exceptNum},percent: ${settings.percent}`
        //     );
        //   }
          
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
