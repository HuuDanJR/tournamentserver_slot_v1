const express = require('express');
const router = express.Router();
const rankingModel = require('./model/ranking.js');
const roundModel = require('./model/round.js');
const displayModel = require('./model/display.js');
const displayModelRealTop = require('./model/display_realtop.js');
const RankingRound = require('./model/ranking_round.js')
const  rankingRealtimeModel =  require('./model/rankings_realtime.js')
const path = require('path');
const fs = require('fs');
const Excel = require('exceljs');
const mongoose = require('mongoose');
const randongString = require('randomstring');
const functions = require('../function/generate.js')



const xlsx = require('xlsx');
const chokidar = require('chokidar'); // Import the chokidar package
var multer = require('multer');
const client = require('../redis/redis_config.js');


router.route('/list_ranking').get(async (req, res) => {
  //list raking with redis cache
  try {
    // Check if data is available in cache
    client.get('list_ranking', async (err, cachedData) => {
      if (err) throw err;
      if (cachedData) {
        // Cache hit: Return cached data
        res.status(200).json(JSON.parse(cachedData));
      } else {
        // Cache miss: Retrieve data from database
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
          }
        ]);

        if (data == null || data.length === 0) {
          res.status(404).json({
            status: false,
            message: 'No rankings found',
            totalResult: null,
            data: data,
          });
        } else {
          // Store data in cache
          client.setEx('list_ranking', 3600, JSON.stringify({
            status: true,
            message: 'List rankings retrieved successfully (duplicates removed) and ordered by point and customer_number',
            totalResult: data.length,
            data: data,
          }));

          // Return data to client
          res.status(200).json({
            status: true,
            message: 'List rankings retrieved successfully (duplicates removed) and ordered by point and customer_number',
            totalResult: data.length,
            data: data,
          });
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving rankings',
      error: err.message,
    });
  }
});

//list display
router.route('/list_display').get(async (req, res) => {
  try {
    const data = await displayModel.find();
    if (data == null || data.length === 0) {
      res.status(404).json({
        status: false,
        message: 'No displays found',
        totalResult: null,
        data: data,
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'List displays retrieved successfully',
        totalResult: data.length,
        data: data,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving displays',
      error: err.message,
    });
  }
});
//list display
router.route('/list_display_realtop').get(async (req, res) => {
  try {
    const data = await displayModelRealTop.find();
    if (data == null || data.length === 0) {
      res.status(404).json({
        status: false,
        message: 'No displays real/top found',
        totalResult: null,
        data: data,
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'List displays real/top retrieved successfully',
        totalResult: data.length,
        data: data,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving displays',
      error: err.message,
    });
  }
});

// Create a display realtop
router.route('/create_display_realtop').post(async (req, res) => {
  try {
    const {id, name, enable, content } = req.body;
    // Create a new display instance
    const newDisplay = new displayModelRealTop({id, name, enable, content });
    // Save the new display to the database
    await newDisplay.save();
    res.status(201).json({
      status: true,
      message: 'Display real/top created successfully',
      data: newDisplay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while creating the display',
      error: err.message,
    });
  }
});
// Create a display
router.route('/create_display').post(async (req, res) => {
  try {
    const {id, name, enable, content } = req.body;
    // Create a new display instance
    const newDisplay = new displayModel({id, name, enable, content });
    // Save the new display to the database
    await newDisplay.save();
    res.status(201).json({
      status: true,
      message: 'Display created successfully',
      data: newDisplay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while creating the display',
      error: err.message,
    });
  }
});

// Update a display by its _id
router.route('/update_display/:id').put(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, enable, content } = req.body;
    // Find the display by _id and update its fields
    const updatedDisplay = await displayModel.findByIdAndUpdate(id, { name, enable, content }, { new: true });
    if (!updatedDisplay) {
      return res.status(404).json({
        status: false,
        message: 'Display not found',
        data: null,
      });
    }
    res.status(200).json({
      status: true,
      message: 'Display updated successfully',
      data: updatedDisplay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the display',
      error: err.message,
    });
  }
});
// Update a display realtop by its _id
router.route('/update_display_realtop/:id').put(async (req, res) => {
  try {
    const { id } = req.params;
    const { name, enable, content } = req.body;
    // Find the display by _id and update its fields
    const updatedDisplay = await displayModelRealTop.findByIdAndUpdate(id, { name, enable, content }, { new: true });
    if (!updatedDisplay) {
      return res.status(404).json({
        status: false,
        message: 'Display real/top not found',
        data: null,
      });
    }
    res.status(200).json({
      status: true,
      message: 'Display real/top updated successfully',
      data: updatedDisplay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the display real/top',
      error: err.message,
    });
  }
});

router.route('/update_display/:name').put(async (req, res) => {
  try {
    const { name } = req.params;
    const { enable, content } = req.body;
    // Find the display by name and update its fields
    const updatedDisplay = await displayModel.findOneAndUpdate({ name }, { enable, content }, { new: true });
    if (!updatedDisplay) {
      return res.status(404).json({
        status: false,
        message: 'Display not found',
        data: null,
      });
    }
    res.status(200).json({
      status: true,
      message: 'Display updated successfully',
      data: updatedDisplay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the display',
      error: err.message,
    });
  }
});

router.route('/list_ranking_normal').get(async (req, res) => {
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
      }
    ]);

    if (data == null || data.length === 0) {
      res.status(404).json({
        status: false,
        message: 'No rankings found',
        totalResult: null,
        data: data,
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'List rankings retrieved successfully (duplicates removed) and ordered by point and customer_number',
        totalResult: data.length,
        data: data,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving rankings',
      error: err.message,
    });
  }
});


// Define the route to list rounds
router.get('/list_round', async (req, res) => {
  try {
    const data = await roundModel.aggregate([
      {
        $group: {
          _id: { name: '$name', number: '$id' },
          data: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: '$data'
        }
      },
      {
        $lookup: {
          from: 'ranking_rounds',
          localField: 'rankings',
          foreignField: '_id',
          as: 'rankings'
        }
      },
      {
        $addFields: {
          'rankings._id': '$_id'
        }
      },
      {
        $unwind: '$rankings'
      },
      {
        $sort: { 'rankings.point': -1 }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          createdAt: { $first: '$createdAt' },
          rankings: { $push: '$rankings' }
        }
      },
      {
        $sort: { 'createdAt': -1 }
      }
    ]);

    if (!data || data.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No rounds found',
        totalResult: null,
        data: data,
      });
    }

    res.status(200).json({
      status: true,
      message: 'List rounds retrieved successfully (duplicates removed) and ordered by name and id',
      totalResult: data.length,
      data: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving rounds',
      error: err.message,
    });
  }
});


router.route('/create_round').post(async (req, res) => {
  try {
    const topRankings = await rankingModel.aggregate([
      {
        $group: {
          _id: { name: '$customer_name', number: '$customer_number' },
          data: { $first: '$$ROOT' },
        },
      }, {
        $replaceRoot: {
          newRoot: '$data',
        },
      }, {
        $sort: { point: -1, customer_number: -1 }
      },
      {
        $limit: 10 // Limit to 10 items
      }
    ]);
    const savedRankingIds = [];
    // console.log(topRankings);
    for (const rank of topRankings) {
      // Create a new instance of RankingRound model
      const newRanking = new RankingRound({
        customer_name: rank.customer_name,
        customer_number: rank.customer_number,
        point: rank.point,
      });

      // Save the ranking to the database
      const savedRanking = await newRanking.save();


      // Push the ID of the saved ranking to the array
      savedRankingIds.push(savedRanking._id);
    }
    const newRound = new roundModel({
      id: randongString.generate(),
      name: `Round_${randongString.generate(5)}`,
      rankings: savedRankingIds,
    });
    // Save the new round record to the database
    const savedRound = await newRound.save();
    await savedRound.populate('rankings');


    res.status(201).json({
      status: true,
      message: 'Round record added successfully!',
      data: savedRound,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while create rounds',
      error: err.message,
    });
  }
});

router.route("/delete_ranking_all").delete(async (req, res) => {
  try {

  } catch (error) {
    console.log(error)
  }
})

//create round with input will be a list ranking
router.route('/create_round_input').post(async (req, res) => {
  const { rankings } = req.body;
  try {
    const newRound = new roundModel({
      id: randongString.generate(),
      name: `Round_${randongString.generate(5)}`,
      rankings: rankings,
    });
    // Save the new round record to the database
    const savedRound = await newRound.save();


    res.status(201).json({
      status: true,
      message: 'Round record added successfully!',
      data: savedRound,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while create rounds',
      error: err.message,
    });
  }
});



router.route("/delete_ranking_all").delete(async (req, res) => {
  try {

  } catch (error) {
    console.log(error)
  }
})


// DELETE route to delete a round by its _id
router.delete('/delete_round/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRound = await roundModel.findByIdAndDelete(id);
    if (!deletedRound) {
      return res.status(404).json({
        status: false,
        message: 'Round not found'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Round deleted successfully',
      data: deletedRound
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the round',
      error: err.message
    });
  }
});


//delete ranking by its id 
router.route('/delete_ranking_id/:id').delete(async (req, res) => {
  try {
    const { id } = req.params;
    const rankingToDelete = await rankingModel.findById(id);
    if (!rankingToDelete) {
      return res.status(404).json({
        status: false,
        message: 'Ranking record not found',
      });
    }
    await rankingToDelete.deleteOne();
    res.status(200).json({
      status: true,
      message: 'Ranking record deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the ranking record',
      error: error.message,
    });
  }
});

//delete ranking 
router.route('/delete_ranking').delete(async (req, res) => {
  try {
    // Get the customer_name and customer_number from the request parameters
    const { customer_name, customer_number } = req.body;

    // Find the ranking record to delete
    const rankingToDelete = await rankingModel.findOne({
      customer_name: customer_name,
      customer_number: customer_number
    });

    // Check if the record exists
    if (!rankingToDelete) {
      return res.status(404).json({
        status: false,
        message: 'Ranking record not found',
      });
    }

    // Delete the ranking record
    await rankingToDelete.deleteOne();

    res.status(200).json({
      status: true,
      message: 'Ranking record deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the ranking record',
      error: error.message,
    });
  }
});


router.route('/update_ranking').put(async (req, res) => {
  try {
    // Get the data from the request body
    const { customer_name, customer_number, point } = req.body;

    // Find the ranking record to update by 'customer_name' and 'customer_number'
    const updatedRanking = await rankingModel.findOneAndUpdate(
      { customer_number },
      { $set: { point, } },
      { new: true } // Return the updated record
    );

    if (!updatedRanking) {
      return res.status(404).json({
        status: false,
        message: 'Ranking record not found',
      });
    }

    res.status(200).json({
      status: true,
      message: 'Ranking record updated successfully',
      data: updatedRanking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the ranking record',
      error: error.message,
    });
  }
});

router.route('/update_ranking_id').put(async (req, res) => {
  try {
    // Get the data from the request body
    const { _id, customer_name, customer_number, point } = req.body;

    // Find the ranking record to check if it can be updated
    const rankingToCheck = await rankingModel.findById(_id);

    if (!rankingToCheck) {
      return res.status(404).json({
        status: false,
        message: 'Ranking record not found',
      });
    }
    console.log(rankingToCheck);
    // Check if the edit field is true before updating
    const updatedRanking = await rankingModel.findByIdAndUpdate(
      _id,
      { $set: { customer_name, customer_number, point } },
      { new: true } // Return the updated record
    );

    res.status(200).json({
      status: true,
      message: 'Ranking record updated successfully',
      data: updatedRanking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the ranking record',
      error: error.message,
    });
  }
});



router.route('/add_ranking').post(async (req, res) => {
  try {
    // Get the data from the request body
    const { customer_name, customer_number, point, id } = req.body;

    // Create a new ranking record
    const newRanking = new rankingModel({
      customer_name: customer_name,
      customer_number: customer_number,
      point: point,
      id: id
    });

    // Save the new ranking record to the database
    const savedRanking = await newRanking.save();

    res.status(201).json({
      status: true,
      message: 'Ranking record added successfully',
      data: savedRanking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while adding the ranking record',
      error: error.message,
    });
  }
});


// API to delete all records
router.route('/delete_ranking_all_create_default').delete(async (req, res) => {
  try {
    // Delete all records in the 'ranking' collection
    const deleteResult = await rankingModel.deleteMany({});

    if (deleteResult.deletedCount > 0) {
      // Create default ranking records
      const defaultRankings = [
        { customer_name: 'PL 01', customer_number: '01', point: 1 },
        { customer_name: 'PL 02', customer_number: '02', point: 1 },
        { customer_name: 'PL 03', customer_number: '03', point: 1 },
        { customer_name: 'PL 04', customer_number: '04', point: 1 },
        { customer_name: 'PL 05', customer_number: '05', point: 1 },
        { customer_name: 'PL 06', customer_number: '06', point: 1 },
        { customer_name: 'PL 07', customer_number: '07', point: 1 },
        { customer_name: 'PL 08', customer_number: '08', point: 1 },
        { customer_name: 'PL 09', customer_number: '09', point: 1 },
        { customer_name: 'PL 10', customer_number: '10', point: 1 },
      ];

      const newRankings = await rankingModel.create(defaultRankings);

      res.status(200).json({
        status: true,
        message: `Deleted ${deleteResult.deletedCount} ranking records and added default rankings successfully`,
        data: newRankings,
      });
    } else {
      res.status(404).json({
        status: false,
        message: 'No ranking records found to delete',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting ranking records and adding default rankings',
      error: error.message,
    });
  }
});



// //IMPORT EXCEL
const excelFilePath = path.join(__dirname, 'public', 'template_file.xlsx');
const watcher = chokidar.watch(excelFilePath);
const workbook = xlsx.readFile(excelFilePath);
const sheet_name_list = workbook.SheetNames;
watcher.on('change', async () => {
  console.log('Excel file has been changed. Reloading data...');
  // Read and process the updated Excel file
  const workbook = xlsx.readFile(excelFilePath);
  const sheet_name_list = workbook.SheetNames;
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  // Update your data with the new content
  console.log('Data has been reloaded.');
});

router.route('/process_excel').post(async (req, res) => {
  const { fileName } = req.body; // Get the file name from the request body
  let excelFilePath = path.join(__dirname, 'public', `${fileName}.xlsx`);
  let workbook = xlsx.readFile(excelFilePath);
  let sheet_name_list = workbook.SheetNames;
  if (!fileName) {
    return res.status(400).json({ message: 'File name is required' });
  }
  let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);
  let count = 0; // Initialize a count variable
  for (const row of data) {
    const newDocument = new rankingModel({
      customer_name: row.name,
      customer_number: row.number,
      point: parseFloat(row.point),
      id: 0
    });
    console.log('new record:', newDocument);
    try {
      await newDocument.save();
      count++; // Increment the count for each successful import
    } catch (err) {
      console.error(`Error saving data: ${err}`);
    }
  }
  res.status(200).json({ message: 'Data imported successfully', count: count });
})


//Upload excel
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public'); // Specify the destination folder (e.g., "public")
  },
  filename: function (req, file, cb) {
    const extname = path.extname(file.originalname);
    const randomString = generateRandomString(6); // Generate a 6-character random string
    const newFileName = `template_file_${randomString}${extname}`;
    cb(null, newFileName); // Use the new file name
  }
});

const upload = multer({ storage: storage });
router.route('/upload_excel').post(upload.single('fileName'), async (req, res) => {
  const fileName = req.file ? req.file.filename : null;

  if (!fileName) {
    return res.status(400).json({ message: 'File name is required' });
  }
  // Handle the uploaded file, e.g., process it or save it to a specific location
  res.send({ message: 'Excel file uploaded successfully.', fileName: fileName });
});


// Function to generate a random string of a specified length
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

router.route('/update_ranking').post(async (req, res) => {
  try {
    // Get the data from the request body
    const { customer_name, customer_number, point, id } = req.body;

    // Try to find a ranking record with the same 'customer_name' and 'customer_number'
    const existingRanking = await rankingModel.findOneAndUpdate(
      { customer_name, customer_number },
      {
        customer_name,
        customer_number,
        point,
        id,
      },
      { upsert: true, new: true } // Upsert (update or insert), and return the updated or new record
    );

    res.status(200).json({
      status: true,
      message: 'Ranking record added or updated successfully',
      data: existingRanking,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      message: 'An error occurred while adding or updating the ranking record',
      error: error.message,
    });
  }
});







router.route('/list_ranking_data').get(async (req, res) => {
  const { start = 0, limit = 20 } = req.query;
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
        $skip: parseInt(start) // Skip documents based on start parameter
      },
      {
        $limit: parseInt(limit) // Limit the number of documents returned
      }
    ]);

    if (data == null || data.length === 0) {
      res.status(404).json([]);
    } else {
      // Return data to client
      res.status(200).json(data);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json('An error occurred while retrieving rankings');
  }
});



//EXPORT FEEDBACK && DOWNLOAD AND EXPORT EXCEL
router.get('/export_round', async (req, res) => {
  try {
    const data = await roundModel.aggregate([
      {
        $group: {
          _id: { name: '$name', number: '$id' },
          data: { $first: '$$ROOT' }
        }
      },
      {
        $replaceRoot: {
          newRoot: '$data'
        }
      },
      {
        $lookup: {
          from: 'ranking_rounds',
          localField: 'rankings',
          foreignField: '_id',
          as: 'rankings'
        }
      },
      {
        $addFields: {
          'rankings._id': '$_id'
        }
      },
      {
        $unwind: '$rankings'
      },
      {
        $sort: { 'rankings.point': -1 }
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          createdAt: { $first: '$createdAt' },
          rankings: { $push: '$rankings' }
        }
      },
      {
        $sort: { 'createdAt': -1 }
      }
    ]);
    if (!data || data.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No rounds found',
        data: null,
      });
    }
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Sheet Of All Round');
    //   data.forEach((item, index) => {
    //     sheet.addRow([index + 1, item._id, item.name,item.createAt, item.rankings, ]);
    // });
    
    data.forEach((round, index) => {
      const { _id, name, createdAt, rankings } = round;
      const bigRow=sheet.addRow([index + 1]);
      bigRow.font = { size: 26, bold: true , }; 
      const headerRow=sheet.addRow(["###", "ROUND ID", "ROUND NAME", "CREATED AT",""]);
      headerRow.font = { size: 14, bold: false , color: { argb: 'FFFFFFFF' }}; 
      const titleRow = sheet.addRow([index + 1, index+1, name, createdAt]);
      titleRow.font = { size: 14, bold: false ,}; // Increase font size and make bold
      titleRow.alignment = { horizontal: 'left' }; 
      headerRow.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0000FF' } // Silver background color for header row
        };
      });

      // Add headers for rankings
      const subHeaderRow= sheet.addRow([ "RANKING ID", "CUSTOMER NAME", "CUSTOMER NUMBER", "POINT", "CREATED AT",]);
      subHeaderRow.font = { size: 14, bold: false , color: { argb: 'FFFFFFFF' }}; // Increase font size and make bold
      subHeaderRow.eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0070C0' } // Silver background color for subheader row
        };
    });
      // Add rows for each ranking
      rankings.forEach((ranking, idx) => {
        const { _id, customer_name, customer_number, createdAt, point } = ranking;
        const roundRow = sheet.addRow([ idx + 1, customer_name, customer_number,point, createdAt, ]);
        roundRow.alignment = { horizontal: 'left' }; 
      });
      // Add an empty row between rounds
      sheet.addRow([]);
    });
    // Adjust column widths to fit content
    sheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = maxLength < 10 ? 10 : maxLength;
    });
    const formattedTimestamp = functions.getFormattedTimestamp();
    const randomString = functions.generateRandomString(3);
    const excelFileName = `round_top_ranking_history_${formattedTimestamp}_${randomString}.xlsx`; // Generate a unique file name
    const excelFolderPath = 'public/excel'; // Replace with your desired folder path for saving the Excel file
    if (!fs.existsSync(excelFolderPath)) {
      fs.mkdirSync(excelFolderPath, { recursive: true });
    }
    const excelFilePath = path.join(excelFolderPath, excelFileName); // Use an absolute path for the file path
    workbook.xlsx.writeFile(excelFilePath)
      .then(() => {
        console.log(`Excel file was saved at: ${excelFilePath}`); // Log the file location
        res.send({ "status": true, "message": "Feedback Excel file generated and saved on server", "filePath": excelFileName });
      })
      .catch((err) => {
        console.error(err);
        res.send({ "status": false, "message": "Failed to generate feedback excel file", "filePath": null });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve & export feedback data',
      totalResult: null,
      data: null,
    });
  }
});
//EXPORT FEEDBACK && DOWNLOAD AND EXPORT EXCEL
router.get('/export_round_realtime', async (req, res) => {
  try {
    const data = await rankingRealtimeModel.aggregate([
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
    if (!data || data.length === 0) {
      return res.status(404).json({
        status: false,
        message: 'No rounds found',
        data: null,
      });
    }
    const workbook = new Excel.Workbook();
    const sheet = workbook.addWorksheet('Sheet Of All Round Real Time');
    //THESE CODE LEFT HERE
    let rowIndex = 2; // Start from row 2 to leave space for header row

    data.forEach((round, index) => {
      const { _id, createdAt, items } = round;

      // Add a header for each round
      const headerRow = sheet.addRow(["#",  "CUSTOMER NAME", "CUSTOMER NUMBER", "POINT", "CREATED AT"]);
      headerRow.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' }};
      headerRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF0000FF' } // Blue background color for header row
        };
      });

      items.forEach(item => {
        const { customer_name, customer_number, point, createdAt } = item;
        sheet.addRow([index + 1,  customer_name, customer_number, point, createdAt]);
        rowIndex++;
      });

      // Add an empty row between rounds
      sheet.addRow([]);
      rowIndex++;
    });

    // Set column widths
    sheet.getColumn(1).width = 10;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 20;
    sheet.getColumn(4).width = 20;
    sheet.getColumn(5).width = 20;
    //END HERE
    const formattedTimestamp = functions.getFormattedTimestamp();
    const randomString = functions.generateRandomString(3);
    const excelFileName = `round_realtime_ranking_history_${formattedTimestamp}_${randomString}.xlsx`; // Generate a unique file name
    const excelFolderPath = 'public/excel'; // Replace with your desired folder path for saving the Excel file
    if (!fs.existsSync(excelFolderPath)) {
      fs.mkdirSync(excelFolderPath, { recursive: true });
    }
    const excelFilePath = path.join(excelFolderPath, excelFileName); // Use an absolute path for the file path
    workbook.xlsx.writeFile(excelFilePath)
      .then(() => {
        console.log(`Excel file was saved at: ${excelFilePath}`); // Log the file location
        res.send({ "status": true, "message": "Round realtime Excel file generated and saved on server", "filePath": excelFileName });
      })
      .catch((err) => {
        console.error(err);
        res.send({ "status": false, "message": "Failed to generate Round realtime excel file", "filePath": null });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'Failed to retrieve & export Round realtime data',
      totalResult: null,
      data: null,
    });
  }
});



//DOWNLOAD FEEDBACK
router.get('/download_excel/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const excelFolderPath = 'public/excel'; // Replace with your folder path
  // Create the full path to the Excel file
  const excelFilePath = path.join(excelFolderPath, fileName);
  // Check if the file exists
  if (fs.existsSync(excelFilePath)) {
    // Set the response headers to specify the file type and attachment
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    // Create a read stream to send the file content to the response
    const fileStream = fs.createReadStream(excelFilePath);
    console.log(`Downloading file: ${fileName}`);
    fileStream.pipe(res);
    fileStream.on('end', () => {
      console.log(`Downloaded file: ${fileName}`);
    });
  } else {
    // If the file does not exist, send a 404 response
    console.log(`File not found: ${fileName}`);
    res.status(404).send('File not found');
  }
});












//export router for use
module.exports = router;