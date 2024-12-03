const express = require('express');
const router = express.Router();
const memberModel = require('./model/member.js');
// Home endpoint
router.get('/home', (req, res) => {
  res.status(200).json({ message: "Welcome to the Members API" });
});

//list display
router.route('/list_member').get(async (req, res) => {
  try {
    const data = await memberModel.find();
    if (data == null || data.length === 0) {
      res.status(404).json({
        status: false,
        message: 'No member found',
        totalResult: null,
        data: data,
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'List Member retrieved successfully',
        totalResult: data.length,
        data: data,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving Members',
      error: err.message,
    });
  }
});


// Create a new member 
router.route('/create_member').post(async (req, res) => {
  try {
    const {name,number,ip,deviceId, deviceName,deviceInfo } = req.body;
    const newmember = new memberModel({name,number,ip, deviceId,deviceName,deviceInfo});
    // Save the new display to the database
    await newmember.save();
    res.status(201).json({
      status: true,
      message: 'Create new member successfully',
      data: newmember,
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
router.route('/update_member/:id').put(async (req, res) => {
  try {
    const { id } = req.params;
    const { name,number,ip,deviceId, deviceName,deviceInfo } = req.body;
    // Find the display by _id and update its fields
    const updatedDisplay = await memberModel.findByIdAndUpdate(id, { name,number,ip,deviceId, deviceName,deviceInfo }, { new: true });
    if (!updatedDisplay) {
      return res.status(404).json({
        status: false,
        message: 'Member not found',
        data: null,
      });
    }
    res.status(200).json({
      status: true,
      message: 'Member updated successfully',
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

// DELETE route to delete a round by its _id
router.delete('/delete_member/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRound = await memberModel.findByIdAndDelete(id);
    if (!deletedRound) {
      return res.status(404).json({
        status: false,
        message: 'Member not found'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Member deleted successfully',
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


//export router for use
module.exports = router;