const express = require('express');
const router = express.Router();
const Jackpot  =  require('./model/jackpot_drop.js')



router.route('/all_jackpot_drop').get(async (req, res) => {
  try {
    const jackpot = await Jackpot.find({}).sort({ createdAt: -1 });;
    if (!jackpot) {
      return res.status(404).json({message:"Cannot find any jackpot drop  ",data:jackpot,status:false});
    }
    res.json({status:true,message:"Find jackpot drop all",data:jackpot,});

  } catch (error) {
     res.status(500).json({ message: 'Error creating jackpot drop', error });
  }
});
router.route('/jackpot_drop_paging').get(async (req, res) => {
  try {
    const start = parseInt(req.query.start) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 5; // Default to 30 items per page
    const skip = (start - 1) * limit;
    const jackpot = await Jackpot.find({})
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(limit); // Limit the number of documents
    // Check if any jackpot data is found
    if (!jackpot || jackpot.length === 0) {
      return res.status(404).json({
        message: "No jackpot drops found for the requested page.",
        data: [],
        status: false,
      });
    }
    const totalCount = await Jackpot.countDocuments();
    res.json({
      status: true,
      message: `Find jackpot drop all ${totalCount}`,
      data: jackpot,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching jackpot drop",
      error: error.message,
    });
  }
});




router.route('/create_jackpot_drop').post(async (req, res) => {
  const {name, value, status, count,machineId } = req.body;
  try {
    const newJackpot =  Jackpot({
      name,
      value,
      machineId,
      count,
      status,
    });
    await newJackpot.save();
    res.status(201).json(newJackpot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating new jackpot drop', error });
  }
});

router.route('/delete_jackpot_drop/:id').delete(async (req, res) => {
  try {
    const deleteJackpot = await Jackpot.findOneAndDelete({ id: req.params.id });

    if (!deleteJackpot) {
      return res.status(404).json({ message: `Jackpot with id "${req.params.id}" not found` });
    }

    res.status(200).json({ message: `Jackpot with id "${req.params.id}" was successfully deleted.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting jackpot', error });
  }
});


//export router for use
module.exports = router;
