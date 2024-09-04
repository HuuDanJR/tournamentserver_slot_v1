
const express = require('express');
const router = express.Router();
var dboperation = require('./mysql/mysql_operation')
const rankingModel = require('./mongodb/model/ranking');
const accountModel = require('./mongodb/model/account');
var io = require('socket.io')(http);
var http = require('http');
var path = require('path');
const dboperation_socketio = require('./socket/socket_operation');
const rankingRealtimeModel = require('./mongodb/model/rankings_realtime');
const mongodbFunction = require('./mongodb/mongo_function');
const randomstring =require('randomstring');


router.use((request, response, next) => {
    console.log('middleware!');
    next();
});


router.route('/home').get((req, res) => {
    return res.status(200).json('home tournament');
})

router.route('/triggerSocketEvent').get(async (req, res) => {
    const data = await rankingModel.find().sort({ point: -1 }).limit(10).exec();
    if (data == null || data.length === 0) {
      console.log('findListRankingSocket: No Data')
    } else {
      const formattedData = data.map(item => ({
        data: item.point,
        name: item.customer_name,
        number: item.customer_number,
        time: item.createdAt
      }));
      const defaultPoint = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      const dataFind = formattedData.map(item => item.data);
      let dataResult = [defaultPoint, dataFind.map(item => item / 2), dataFind];
      let myData = {
        data: dataResult,
        name: formattedData.map(item => item.name),
        number: formattedData.map(item => item.number),
        time: formattedData.map(item => item.time),
      }
    io.emit('eventFromClient2', { myData });
    res.status(200).json({ message: 'Socket event triggered' });
}})


router.route('/init').get((req, res) => {
    // const url = 'http://localhost:8090'; // Your desired URL
    const url = `${req.protocol}://${req.get('host')}`
    res.json({ "url": url });
})


router.route('/findbetnumber').get((req, res) => {
    try {
        dboperation.findBetNumber((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching bet numbers.' });
            }
            return res.status(200).json(result);
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})

//ALL DATA 
router.route('/list_station').get((req, res) => {
    try {
        dboperation.allStationData((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching all station data.' });
            }
            return res.status(200).json(result);
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})
// //SAVE ALL DATA FROM MYSQL TO MONGODB
router.route('/save_list_station').get((req, res) => {
    try {
        dboperation.allStationData((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching all station data.' });
            }
            // Extract relevant fields from each station object
            const extractedData = result.map(station => {
                const { machine, member, credit, lastupdate } = station;
                return { machine, member, credit, lastupdate };
            });
            mongodbFunction.saveListStationToMongo(extractedData,randomstring.generate(10));

            return res.status(200).json({ message: 'Data saved to MongoDB successfully.' });
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})
//List Item have in RoundName
router.route('/list_ranking_realtime/:roundName').get(async (req, res) => {
    try {
        const roundName = req.params.roundName;
        // Find all records with the specified roundName
        const records = await rankingRealtimeModel.find({ roundName: roundName });

        // Return the records as JSON
        return res.status(200).json(records);
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})

//LIST GROUP
// Define a route to get the list of records grouped by roundName
router.route('/list_ranking_realtime_group').get(async (req, res) => {
    try {
        // Aggregate records by roundName
        const records = await rankingRealtimeModel.aggregate([
            {
                $group: {
                    _id: {
                        $concat: ["Round_Realtime_", "$roundName"]
                    },
                    createdAt: { $first: '$createdAt' }, 
                    items: { $push: '$$ROOT' }
                }
            }
        ]);
        // Return the aggregated records as JSON
        return res.status(200).json(records);
    } catch (error) {
        // If an error occurs, return a 500 status code with an error message
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});






//UPDATE MEMBER
router.post('/update_member', async (req, res) => {
    try {
        const { ip, member } = req.body; // Get IP address and new member number from request body

        // Update member number in the database
        await dboperation.updateMemberNumber(ip, member);

        res.status(200).json({ message: 'Member number updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating member number' });
    }
});


//CREATE STATION 
router.route('/create_station').post((req, res) => {
    const {machine,member,bet,credit,connect,display,status,aft,lastupdate} = req.body;
    try {
        dboperation.createStation(machine,member,bet,credit,connect,display,status,aft,lastupdate,(err, result) => {
            if (err) {
             return res.status(500).json({ error: 'Error create new station data.' });
            }
             return res.status(200).json(result);
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred when create new station' });
    }
})

// ADD REALTIME TO TOP RANKING
router.route('/add_ranking_realtime').post(async(req, res) => {
    try {
        await dboperation_socketio.addRankingRealTimeToMongo((err, message) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching all station data.' });
            }
            return res.status(200).json(message);
        });
        
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred when add realtime raking data' });
    }
});
//UPDATE STATION CREDIT
router.route('/update_station_credit').put((req,res)=>{
  const { machine, member, credit } = req.body;
  try {
    dboperation.updateStationCredit(machine, member, credit, (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error updating station credit.' });
      }

      return res.status(200).json(result);
    });
  } catch (error) {
    return res.status(500).json({ error: 'An unexpected error occurred when updating station credit.' });
  }
})
//DELETE
router.route('/delete_station').delete((req,res) =>{
    const {machine,member} = req.body;
    try {
        dboperation.deleteStation(machine,member,(err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error delete station data by machine & member' });
            }
            return res.status(200).json(result);
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred when delete station by member & machine' });
    }
});

//UPDATE STATUS
router.route('/update_station').post(async (req, res) => {
    try {
      const { ip, display } = req.body;
      // Update the connect status
      await dboperation.updateStatusByIP(ip, display, (error, result) => {
        if (error) {
          console.error(`Error updating connect status: ${error}`);
          return res.status(500).json({ error: 'An unexpected error occurred during the update.' });
        }
        // The update was successful
        // console.log(`Update result:`, result);
        return res.status(200).json({ success: true, message: `Connect status updated successfully. ` });
      });
    } catch (error) {
      console.error(`An unexpected error occurred: ${error}`);
      return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
});

router.route('/finddata').get((req, res) => {
    try {
        dboperation.findData((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching data.' });
            }
            // Extract credit values from the result array
            const credits = result.map(item => item.credit);
            const credits_default = [100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0, 100.0];
            // Create the desired result format
            const desiredResult = [credits_default, credits];

            return res.status(200).json(desiredResult);
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})

router.route('/finddatanumber').get((req, res) => {
    try {
        dboperation.findDataNumber((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching data.' });
            }
            // Extract credit values from the result array
            const credits = result.map(item => item.credit);
            const members = result.map(item => item.member);
            const desiredResult = [members, credits];

            return res.status(200).json(desiredResult);
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})


router.route('/findstationdata').get((req, res) => {
    try {
        dboperation.findStationData((err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error fetching bet numbers.' });
            }
            return res.status(200).json(result);
            //   return res.status(200).json(result);
        });
    } catch (error) {
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})
router.route('/addstationdata').post((req, res) => {
    try {
        const { machine, member, bet, credit, connect, status, aft, lastupdate } = req.body;
        // Ensure all required fields are present in the request body
        if (!machine || !member || !bet || !credit || !connect || !status || !aft || !lastupdate) {
            return res.status(400).json({ error: 'Missing required fields in the request body.' });
        }
        // Call the function to insert the data into the 'stationdata' table
        dboperation.addStationData(machine, member, bet, credit, connect, status, aft, lastupdate, (err, result) => {
            if (err) {
                console.error('Error adding station data:', err);
                return res.status(500).json({ error: 'Error adding station data.' });
            }

            // Return success response
            return res.status(201).json({ message: 'Station data added successfully.', result });
        });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})
router.route('/addstationdata_w_ip').post((req, res) => {
    try {
        const { ip, machine, member, bet, credit, connect, status, aft, lastupdate } = req.body;
        // Ensure all required fields are present in the request body
        if (!machine || !member || !bet || !credit || !connect || !status || !aft || !lastupdate) {
            return res.status(400).json({ error: 'Missing required fields in the request body. data data w ip' });
        }
        // Call the function to insert the data into the 'stationdata' table
        dboperation.addStationDataWithIP(ip, machine, member, bet, credit, connect, status, aft, lastupdate, (err, result) => {
            if (err) {
                console.error('Error adding station data:', err);
                return res.status(500).json({ error: 'Error adding  w ip station data.' });
            }

            // Return success response
            return res.status(201).json({ message: 'Station data w ip added successfully.', result });
        });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})

router.route('/updatestationdata').post((req, res) => {
    try {
        const { member, credit, } = req.body;

        dboperation.updateStationData(member, credit, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Error update station data.' });
            }
            return res.status(201).json({ message: 'Station data updated successfully.', result });
        });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})


router.route('/deletestationdata').delete((req, res) => {
    try {
        const { ip } = req.body;
        dboperation.deleteStationData(ip, (err, result) => {
            if (err) {
                console.error('Error delete station data:', err);
                return res.status(500).json({ error: 'Error deleting station data.' });
            }
            return res.status(201).json({ message: 'Station data deleting successfully.', result });
        });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})

router.route('/deletestationdataall').delete((req, res) => {
    try {
        const { ip } = req.body;
        dboperation.deleteStationDataAll((err, result) => {
            if (err) {
                console.error('Error delete station data:', err);
                return res.status(500).json({ error: 'Error deleting station data all.' });
            }
            return res.status(201).json({ message: 'Station data deleting all successfully.', result });
        });
    } catch (error) {
        console.error('An unexpected error occurred:', error);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
})
//LOGIN USER 
router.route('/login').post(async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await accountModel.findOne({ username });
        if (!user || user.password !== password) {
            return res.json({status: false, message: 'Authentication Failed' });
        }
        res.status(200).json({ status: true, message: "Login successful" });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
})

// Account registration
router.route('/register').post(async (req, res) => {
    try {
        const {username, password} = req.body;
        
        // Check if the username or username_en already exists
        const existingUser = await accountModel.findOne({ username });
        if (existingUser) {
          return res.status(409).json({ message: 'Username already exists'});
        }
        
        // Create a new user if no duplicates found
        const user = new accountModel({ username, password });
        await user.save();
        res.status(201).json({ message: 'Account registered successfully'});
      } catch (error) {
        // Handle specific errors if needed
        console.error(error);
        res.status(500).json({ message: 'Registration failed' });
      }
})


module.exports = router;