const { join } = require('path');
const connection = require('../mysql/mysql_dbconfig');
const rankingModel = require('../mongodb/model/ranking');
const mongofunctions = require('../mongodb/mongo_operation_v2');
const client = require('../redis/redis_config');
const displayModel  =require('../mongodb/model/display');
const displayModelRealTop  =require('../mongodb/model/display_realtop');



let oldCredits = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let lastExecutionTime = 0;
const throttleInterval = 2000;
// const throttleInterval = 2000; //change throttleInterval from 2s - 1.5s
function findDataSocketFull(name, io, isInit,customLimit) {
  const currentTime = Date.now();
  if (currentTime - lastExecutionTime < throttleInterval) {
    return;
  }
  lastExecutionTime = currentTime;
  let limitClause = customLimit ? `LIMIT ${parseInt(customLimit, 10)}` : 'LIMIT 10'; // Use the provided customLimit or default to 10 if not provided
  let query = `SELECT credit, ip,member FROM stationdata WHERE display = 1 ORDER BY credit DESC ${limitClause} `;
  connection.query(query, async function (err, result, fields) {
    if (err) {
      console.log(err);
    } else {
      let newCredits = result.map(item => parseFloat(item.credit) / 100);
      let ips = result.map(item => parseInt(item.ip, 10));
      let member = result.map(item => (item.member));
      if (isInit == true) {
        // console.log('findDataSocketFull: receive data each 5s')
        io.emit(name, member, [ips, oldCredits, newCredits]);
      }
      if (!areArraysEqual(oldCredits, newCredits)) {
        console.log(`findDataSocketFull: data changed`);
        io.emit(name, member, [ips, oldCredits, newCredits]);
        oldCredits = newCredits;
      }
      else {
        oldCredits = newCredits;
      }
    }
});
}

const defaultPoint = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
let lastData = []; // Store the last retrieved data
async function findListRankingSocket(eventName, io, isInit,customLimit) {
  let limit = customLimit || 10;
  try {
  const data = await rankingModel.aggregate([
    {
      $group: {
        _id: { name: '$customer_name', number: '$customer_number' },
        data: { $first: '$$ROOT' }, // Keep the first occurrence
      },
    },
    {
      $replaceRoot: {
        newRoot: '$data',
      },
    },
    {
      $sort: { point: -1, customer_number: -1 } // Sort by point in descending order and then by customer_number in descending order
    },
    {
      $limit: limit, // Add a $limit stage to limit the number of documents returned to 10
    },
  ]);
    if (data == null || data.length === 0) {
      console.log('findListRankingSocket: No Data')
    } else {
      const formattedData = data.map(item => ({
        data: item.point,
        name: item.customer_name,
        number: item.customer_number,
        time: item.createdAt
      }));
      // console.log('data 1',formattedData);
      const dataFind = formattedData.map(item => item.data);
      let dataResult = [defaultPoint, dataFind.map(item => item / 2), dataFind];
      let myData = {
        data: dataResult,
        name: formattedData.map(item => item.name),
        number: formattedData.map(item => item.number),
        time: formattedData.map(item => item.time),
      }
      if (isInit == true) {
        lastData = dataFind; // Store the initial data
        io.emit(eventName, myData);
      } 
    }
  } catch (err) {
    console.error(err);
    console.log('findListRankingSocket: An Error Orcur')
  }
}


async function findListRankingSocketNoData(eventName, io) {
  try {
    let myData = {
      data: [],
      name: null,
      number: null,
      time: null,
    }
    console.log('findListRankingSocketNoData: No Data');
    io.emit(eventName, myData);
    
  } catch (err) {
    console.error(err);
    console.log('findListRankingSocket: An Error Orcur');
  }
}

// async function findListRankingSocketRedis(eventName, io, isInit, customLimit) {
//   let limit = customLimit || 10;
//   let key = `${eventName}:${limit}`;
  
//   try {
//       // Check Redis cache first
//       client.get(key, async function (err, cachedData) {
//           if (err) {
//               console.error('Error retrieving data from Redis cache:', err);
//           } else if (cachedData) {
//               // Data found in cache, return it
//               const parsedData = JSON.parse(cachedData);
//               io.emit(eventName, parsedData);
//           } else {
//               // Data not found in cache, query MongoDB
//               const data = await rankingModel.aggregate([
//                   {
//                       $group: {
//                           _id: { name: '$customer_name', number: '$customer_number' },
//                           data: { $first: '$$ROOT' },
//                       },
//                   },
//                   {
//                       $replaceRoot: {
//                           newRoot: '$data',
//                       },
//                   },
//                   {
//                       $sort: { point: -1, customer_number: -1 }
//                   },
//                   {
//                       $limit: limit,
//                   },
//               ]);

//               if (data == null || data.length === 0) {
//                   console.log('findListRankingSocket: No Data');
//                   return;
//               }

//               const formattedData = data.map(item => ({
//                   data: item.point,
//                   name: item.customer_name,
//                   number: item.customer_number,
//                   time: item.createdAt
//               }));

//               const dataFind = formattedData.map(item => item.data);
//               let dataResult = [defaultPoint, dataFind.map(item => item / 2), dataFind];
//               let myData = {
//                   data: dataResult,
//                   name: formattedData.map(item => item.name),
//                   number: formattedData.map(item => item.number),
//                   time: formattedData.map(item => item.time),
//               };

//               // Store data in Redis cache
//               client.set(key, JSON.stringify(myData));
//               io.emit(eventName, myData);
//           }
//       });
//   } catch (err) {
//       console.error(err);
//       console.log('findListRankingSocket: An Error Occurred');
//   }
// }


function arraysHaveDifferences(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return true;
    } else {
      return false;
    }
  }
  return false;
}








function findDataSocketFullRedis(name, io, isInit, customLimit) {
  let limitClause = customLimit ? `LIMIT ${parseInt(customLimit, 10)}` : 'LIMIT 10';
  const { updateRankings } = require('../mongodb/mongo_operation_v2.1');
  let query = `SELECT credit, ip, member FROM stationdata WHERE display = 1 ORDER BY credit DESC ${limitClause}`;
  // Check Redis cache first
  client.get('station_data', async function (err, cachedData) {
      if (err) {
          console.error('Error retrieving data from Redis cache:', err);
      } else if (cachedData) {
          // Data found in cache, return it
          const parsedData = JSON.parse(cachedData);
          io.emit(name, parsedData.member, parsedData.data);
      } else {
          connection.query(query, async function (err, result, fields) {
              if (err) {
                  console.error('Error querying MySQL:', err);
              } else {
                  let newCredits = result.map(item => parseFloat(item.credit) / 100);
                  let ips = result.map(item => parseInt(item.ip, 10));
                  let member = result.map(item => item.member);
                  if (isInit == true) {
                      io.emit(name, member, [ips, oldCredits, newCredits]);
                  }
                  if (!areArraysEqual(oldCredits, newCredits)) {
                      io.emit(name, member, [ips, oldCredits, newCredits]);
                      oldCredits = newCredits;
                  } else {
                      oldCredits = newCredits;
                  }
                  // Store data in Redis cache
                  const dataToCache = JSON.stringify({ member, data: [ips, oldCredits, newCredits] });
                  client.set(name, dataToCache);
                  // console.log(`start time ${startTime}`); // Log the time taken
              }
          });
      }
  });
}




async function addRankingRealTimeToMongo(callback) {
  const Rankings = require('../mongodb/model/ranking');
  try {
    const query = `SELECT credit, ip, member FROM stationdata WHERE display = 1 ORDER BY credit DESC `;
    // Assume connection is established somewhere in your code
    const result = await new Promise((resolve, reject) => {
      connection.query(query, (err, result, fields) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });

    const newCredits = result.map(item => parseFloat(item.credit) / 100);
    const members = result.map(item => item.member);

    for (let i = 0; i < result.length; i++) {
      const customerName = members[i].toString();
      // Check if record with the same customer_name already exists
      const existingRecord = await Rankings.findOne({ customer_name: customerName });

      if (!existingRecord || newCredits[i] > existingRecord.point) {
        // If the record doesn't exist or the new point is greater, update or insert
        if (!existingRecord) {
          const rankingData = {
            customer_name: members[i],
            customer_number: members[i], // Assuming customer_number should be set to the same value as customer_name
            point: newCredits[i],
          };

          const ranking = new Rankings(rankingData);
          await ranking.save();
        } else {
          // Update the point if the new point is greater
          existingRecord.point = newCredits[i];
          await existingRecord.save();
        }
      }
    }
    console.log('Data added to MongoDB successfully.');
    callback(null, { "message": 'Data added to MongoDB successfully.' });
  } catch (error) {
    console.error('Error while adding data to MongoDB:', error);
    callback(error, { "message": 'Error while adding data to MongoDB.' });
  }
}


function addRankingsToSocket(name, io,) {
  let query = `SELECT credit, ip,member FROM stationdata WHERE display = 1 ORDER BY credit DESC `;
  connection.query(query, async function (err, result, fields) {
    if (err) {
      console.log(err);
    } else {
      let newCredits = result.map(item => parseFloat(item.credit) / 100);
      let ips = result.map(item => parseInt(item.ip, 10));
      let member = result.map(item => (item.member));
      try {
        await mongofunctions.addRankings(member, member, newCredits);
      } catch (error) {
        console.log(error);
      }
      io.emit(name,);
    }
  });
}





function generateGoodRandomData(nbRows, nbColumns) {
  const data = [];

  for (let i = 0; i < nbRows; i++) {
    data[i] = new Array(nbColumns).fill(0);
  }

  for (let j = 0; j < nbColumns; j++) {
    data[0][j] = j * 10.0;
  }

  for (let i = 1; i < nbRows; i++) {
    for (let j = 0; j < nbColumns; j++) {
      const calculatedValue =
        data[i - 1][j] +
        (nbColumns - j) +
        Math.random() * 20 +
        (j === 2 ? 10 : 0);
      data[i][j] = calculatedValue;
      // console.log('calculate value: ' + calculatedValue);
    }
  }
  // console.log(data);
  return data;
}



function areListsDifferent(list1, list2) {
  // Check if the lengths of the lists are different
  if (list1.length !== list2.length) {
    return true;
  }

  // Iterate through the items in the lists and compare them
  for (let i = 0; i < list1.length; i++) {
    // Use Number.EPSILON to handle potential floating-point precision issues
    if (Math.abs(list1[i] - list2[i]) > Number.EPSILON) {
      return true;
    }
  }

  // If no differing items are found, return false
  return false;
}


function areArraysEqual(arr1, arr2) {
  // console.log('ASSET THIS AREARRAYEQUAL ')
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }
  return true;
}



//SELECT CREDIT AND NUMBER 






function deleteStationDataSocketWName(name, io, ip) {
  let query = `DELETE FROM stationdata WHERE ip = ?`;
  connection.query(query, [ip], function (err, result, fields) {
    if (err) {
      console.log(err);
      // Handle any error if needed
    } else {
      console.log(result);
      // Emit the result back to the client using the specified event name
      io.emit(name, result);
    }
  });
}




function addStationDataSocketWName(name, io, machine, member, bet, credit, connect, status, aft, lastupdate) {
  const query = `INSERT INTO stationdata (machine, member, bet, credit, connect, status, aft, lastupdate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const values = [machine, member, bet, credit, connect, status, aft, lastupdate];
  connection.query(query, values, function (err, result, fields) {
    if (err) {
      console.log(err);
      // Handle any error if needed
    } else {

      // console.log(result);
      // Emit the result back to the client using the specified event name
      io.emit(name, result);
    }
  });
}

module.exports = {
  findStationDataSocketWName: findStationDataSocketWName,
  findDataSocketFullRedis:findDataSocketFullRedis,
  deleteStationDataSocketWName: deleteStationDataSocketWName,
  addStationDataSocketWName: addStationDataSocketWName,
  // findDataSocket: findDataSocket,
  findDataSocketFull: findDataSocketFull,
  findListRankingSocket: findListRankingSocket,
  // findListRankingSocketAll: findListRankingSocketAll,
  // findDataSocketFullWmongo:findDataSocketFullWmongo
  addRankingsToSocket: addRankingsToSocket,
  addRankingRealTimeToMongo: addRankingRealTimeToMongo,
  // findListRankingSocketRedis:findListRankingSocketRedis,
  findListDisplaySocket:findListDisplaySocket,
  updateDisplayEnableStatus:updateDisplayEnableStatus,
  // updateDisplayEnableDefault:updateDisplayEnableDefault,

  findListRankingSocketNoData:findListRankingSocketNoData,
  findListDisplayRealTopSocket:findListDisplayRealTopSocket,
}










// function findDataSocketFullWmongo(name, io, isInit) {
//   let query = `SELECT credit, ip,member FROM stationdata WHERE connect = 1 ORDER BY credit DESC  LIMIT 10`;
//   connection.query(query, function (err, result, fields) {
//     if (err) {
//       console.log(err);
//     } else {
//       const newCredits = result.map(item => parseFloat(item.credit) / 100);
//       const ips = result.map(item => parseInt(item.ip, 10));
//       const member = result.map(item => (item.member));
//       //compare with mongoDB 
//       rankingModel.find({}, (err, item) => {
//         if (err) {
//           console.error(err);
//           return;
//         }
//       })
//       for (let i = 0; i < item.length; i++) {
//         if (newCredits[i] > item[i].point) {
//           console.log('mongo point:',item[i].point)
//           mongoRankings[i].point = newCredits[i];
//           mongoRankings[i].customer_name = member[i];
//           mongoRankings[i].customer_number = ips[i];


//           const newRanking = new rankingModel({
//             customer_name: mongoRankings[i].customer_name,
//             customer_number: mongoRankings[i].customer_number,
//             point: mongoRankings[i].point,
//             id: id
//           });
//          newRanking.save((err) => {
//             if (err) {
//               console.error(err);
//             }
//           });
//         }
//       }

//       if (isInit == true) {
//         io.emit(name,member, [ips, oldCredits, newCredits]);
//       }
//       if (!areArraysEqual(oldCredits, newCredits)) {
//         io.emit(name,member, [ips, oldCredits, newCredits]);
//         oldCredits = newCredits;
//       }
//       else {
//         oldCredits = newCredits;
//       }
//     }
//   });
// }



async function findListDisplaySocket(name,io) {
  try {
    const data = await displayModel.find();
    if (!data || data.length === 0) {
      console.log('No displays found');
    } else {
      io.emit(name, data);
    }
  } catch (err) {
    console.error(err);
    console.log('An error occurred while retrieving displays')
  }
}
//DISPLAY ONLY REALTIME OR TOP RANKING ONLY
async function findListDisplayRealTopSocket(name,io) {
  try {
    const data = await displayModelRealTop.find();
    if (!data || data.length === 0) {
      console.log('display 2: real & top');
    } else {
      console.log('display only real')
      io.emit(name, data);
    }
  } catch (err) {
    console.error(err);
    console.log('An error occurred while retrieving displays');
  }
}


async function updateDisplayEnableStatus(id, newStatus,name,io) {
  try {
    // Find the display document by its ID
    const display = await displayModel.findById(id);
    if (!display) {
      console.log('Display not found');
      return; // Exit the function if display is not found
    }

    // Update the 'enable' field with the new status
    display.enable = newStatus;
    await display.save(); // Save the updated document

    console.log(`Display with ID ${id} updated successfully. New enable status: ${newStatus}`);

    // Emit an event to inform clients about the updated display
    console.log(`updateDisplayEnableStatus ${display}`);
    io.emit(name, display);
  } catch (err) {
    console.error('An error occurred while updating display enable status:', err);
  }
}


async function findListRankingSocketAll(eventName, io) {
  try {
    const data = await rankingModel.find().exec();
    if (data == null || data.length === 0) {
      console.log('findListRankingSocketAll: No Data')
    } else {
      console.log('findListRankingSocketAll Data:', data)
      io.emit(eventName, data);
    }
  } catch (err) {
    console.error(err);
    console.log('findListRankingSocketAll: An Error Orcur')
  }
}


function findStationDataSocketWName(name, io) {
  let query = `SELECT * FROM stationdata WHERE connect = 1 ORDER BY credit DESC LIMIT 10`;
  connection.query(query, function (err, result, fields) {
    if (err) {
      console.log(err);
      // Handle any error if needed
    } else {
      // Emit the result back to the client using the 'stationData' event
      // console.log(result.length);
      // console.log('*find station data*',result)
      io.emit(name, result);
    }
  });
}



function hasChangesInList(inputList) {
  let previousItem = null;
  for (const item of inputList) {
    if (previousItem !== null && previousItem !== item) {
      return true;
    }
    previousItem = item;
  }
  return false;
}