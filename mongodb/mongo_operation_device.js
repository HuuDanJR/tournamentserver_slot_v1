const express = require('express');
const router = express.Router();
const deviceModel = require('./model/device.js');
// Home endpoint
router.get('/home', (req, res) => {
  res.status(200).json({ message: "Welcome to the Device API" });
});

//list display
router.route('/list_device').get(async (req, res) => {
  try {
    const data = await deviceModel.find();
    if (data == null || data.length === 0) {
      res.status(404).json({
        status: false,
        message: 'No device found',
        totalResult: null,
        data: data,
      });
    } else {
      res.status(200).json({
        status: true,
        message: 'List device retrieved successfully',
        totalResult: data.length,
        data: data,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while retrieving devices',
      error: err.message,
    });
  }
});


// Create a new member
router.route('/create_device').post(async (req, res) => {
  try {
    const { deviceId, deviceName, deviceInfo } = req.body;

    // Check if a device with the same deviceId already exists
    const existingDevice = await deviceModel.findOne({ deviceId });

    if (existingDevice) {
      return res.status(400).json({
        status: false,
        message: 'Device already exists',
        data: existingDevice, // Optionally return the existing device
      });
    }

    // Create a new device if not found
    const newDevice = new deviceModel({ deviceId, deviceName, deviceInfo });

    // Save the new device to the database
    await newDevice.save();

    res.status(201).json({
      status: true,
      message: 'Device created successfully',
      data: newDevice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while creating the device',
      error: err.message,
    });
  }
});

// Update a display by its _id
router.route('/update_device/:id').put(async (req, res) => {
  try {
    const { id } = req.params;
    const { deviceId, deviceName,deviceInfo } = req.body;
    // Find the display by _id and update its fields
    const updatedDisplay = await deviceModel.findByIdAndUpdate(id, { deviceId, deviceName,deviceInfo }, { new: true });
    if (!updatedDisplay) {
      return res.status(404).json({
        status: false,
        message: 'Device not found',
        data: null,
      });
    }
    res.status(200).json({
      status: true,
      message: 'Device updated successfully',
      data: updatedDisplay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while updating the Device',
      error: err.message,
    });
  }
});

// DELETE route to delete a round by its _id
router.delete('/delete_device/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRound = await deviceModel.findByIdAndDelete(id);
    if (!deletedRound) {
      return res.status(404).json({
        status: false,
        message: 'Device not found'
      });
    }
    res.status(200).json({
      status: true,
      message: 'Device deleted successfully',
      data: deletedRound
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: 'An error occurred while deleting the device',
      error: err.message
    });
  }
});


//export router for use
module.exports = router;
