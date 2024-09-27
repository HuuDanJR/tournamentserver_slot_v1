const express = require('express');
const router = express.Router();
const Time  =  require('./model/time.js')
const { v4: uuidv4 } = require('uuid');





router.route('/create_time').post(async (req, res) => {
  const {  minutes, seconds,status, active } = req.body;
  try {
    const newTime = new Time({
      id: uuidv4(), // Generate a unique ID
      minutes,
      seconds,
      status,
      active,
    });
    await newTime.save();
    res.status(201).json(newTime);
  } catch (error) {
    res.status(500).json({ message: 'Error creating time', error });
  }
});

router.route('/find_time/:id').get(async (req, res) => {
  const time = await Time.findOne({ id: req.params.id });
  res.json(time);
});

//FIND TIME ACTIVE  & FIRST
router.route('/find_time_first').get(async (req, res) => {
  try {
    let time = await Time.findOne({ active: true }).sort({ createdAt: -1 }).exec();
    if (!time) {
      time = await Time.findOne({ active: false }).sort({ createdAt: -1 }).exec();
    }
    if (time) {
      res.status(200).json([time]);
    } else {
      res.status(404).json({ message: 'No time records found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching time record', error });
  }
});


//ALL TIME 
router.route('/find_time_all').get(async (req, res) => {
  try {
    const allTimes = await Time.find();  // Fetch all records from the collection
    res.status(200).json(allTimes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all times', error });
  }
});


router.route('/update_time').put(async (req, res) => {
  const { id, ...updateData } = req.body;
  try {
    if (!id) {
      return res.status(400).json({ message: 'ID is required in the request body.' });
    }
    const updatedTime = await Time.findOneAndUpdate({ id }, updateData, { new: true });

    if (!updatedTime) {
      return res.status(404).json({ message: `Time with id "${id}" not found.` });
    }
    res.json(updatedTime);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating time', error });
  }
});


//update time latest
router.route('/update_time_latest').put(async (req, res) => {
  const { ...updateData } = req.body; // remove `id` from destructuring since we're getting it from the database
  try {
    // Fetch the active or inactive time record
    let time = await Time.findOne({ active: true }).sort({ createdAt: -1 }).exec();
    if (!time) {
      time = await Time.findOne({ active: false }).sort({ createdAt: -1 }).exec();
    }

    // If no time is found, respond with a 404
    if (!time) {
      return res.status(404).json({ message: 'No time records found to update.' ,status :0});
    }

    // Update the time record using the fetched id
    const updatedTime = await Time.findOneAndUpdate({ id: time.id }, updateData, { new: true });

    if (!updatedTime) {
      return res.status(404).json({ message: `Time with id "${time.id}" not found.` });
    }

    res.status(200).json({
      message: 'Update Successful.' ,status :1,data:updateData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating time', error });
  }
});


router.route('/delete_time/:id').delete(async (req, res) => {
  try {
    const deletedTime = await Time.findOneAndDelete({ id: req.params.id });

    if (!deletedTime) {
      return res.status(404).json({ message: `Time with id "${req.params.id}" not found` });
    }

    res.status(200).json({ message: `Time with id "${req.params.id}" was successfully deleted.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting time', error });
  }
});




// //export router for use
module.exports = router;
