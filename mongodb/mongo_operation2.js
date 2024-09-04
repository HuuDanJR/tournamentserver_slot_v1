// const rankingModel = require('./model/ranking');
// const dboperation_socketio = require('../socket/socket_operation');

// async function addRankings(customerNames, customerNumbers, points,) {
//   try {
//     // Check if input arrays have the same length
//     if (
//       !Array.isArray(customerNames) ||
//       !Array.isArray(customerNumbers) ||
//       !Array.isArray(points) ||
//       customerNames.length !== customerNumbers.length ||
//       customerNumbers.length !== points.length
//     ) {
//       return {
//         status: false,
//         message: 'Invalid input arrays.',
//       };
//     }

//     // Retrieve existing rankings from the database
//     const existingRankings = await rankingModel.find().sort({ point: -1, customer_number: -1 }) // Sort by point in descending order and then by customer_number in descending order
//     .exec();

//     // Create a map to store the latest point for each customer (based on customerNumber + customerName)
//     const latestPointsMap = new Map();

//     // Iterate over existing rankings and update the latest point for each customer
//     existingRankings.forEach((r) => {
//       const key = r.customer_number + r.customer_name;
//       if (!latestPointsMap.has(key) || r.point > latestPointsMap.get(key)) {
//         latestPointsMap.set(key, r.point);
//       }
//     });

//     // Iterate over input arrays and add/update records
//     for (let i = 0; i < customerNames.length; i++) {
//       const customerName = customerNames[i].toString();
//       const customerNumber = customerNumbers[i].toString();
//       const point = points[i];

//       const key = customerNumber + customerName;

//       // Check if the customer already exists in the rankings
//       if (latestPointsMap.has(key)) {
//         const existingPoint = latestPointsMap.get(key);

//         // If the point is greater than the existing point, update the record
//         if (point > existingPoint) {
//           await rankingModel.findOneAndUpdate(
//             { customer_number: customerNumber, customer_name: customerName },
//             { point: point }
//           );
          
//         }
//       } else {
//         // If the customer does not exist, create a new ranking record
//         const newRanking = new rankingModel({
//           customer_name: customerName,
//           customer_number: customerNumber,
//           point: point,
//         });
//         // Save the new ranking record to the database
//         await newRanking.save();
        
//       }
      
//     }

//     return {
//       status: true,
//       message: 'Ranking records added/updated successfully.',
//     };
    
//   } catch (error) {
//     console.error(error);
//     return {
//       status: false,
//       message: 'An error occurred while adding/updating ranking records.',
//       error: error.message,
//     };
//   }
// }


// module.exports = {addRankings};


// function handleSocketIO(io,) {
//     io.on('connection', (socket) => {
//         console.log('A user connected', socket.id);
//         // dboperation_socketio.findListRankingSocket('eventFromServerMongo', io, false, apiSettings.topRakingLimit);

//         socket.on('eventFromClient2_force', (data) => {
//             dboperation_socketio.findListRankingSocket('eventFromServerMongo', io, true, apiSettings.topRakingLimit);
//         });
        
//         socket.on('disconnect', () => {
//             console.log('A user disconnected');
//             cronJob.stop();
//         });
//     });
// }