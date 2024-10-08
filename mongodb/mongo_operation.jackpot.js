const express = require('express');
const router = express.Router();
const Jackpot  =  require('./model/jackpot.js')
const { v4: uuidv4 } = require('uuid');


router.route('/all_jackpot').get(async (req, res) => {
  try {
    const jackpot = await Jackpot.find({ });
    if (!jackpot) {
      return res.status(404).json({message:"Cannot find any jackpot ",data:jackpot,status:false});
    }
    res.json({status:true,message:"Find jackpot all",data:jackpot,});
  
  } catch (error) {
     res.status(500).json({ message: 'Error creating jackpot', error });
  }
});



router.route('/create_jackpot').post(async (req, res) => {
  const {name, initValue, startValue, endValue,hitValue,machineId } = req.body;
  try {
    const newJackpot = new Jackpot({
      id: uuidv4(), // Generate a unique ID
      name,
      initValue,
      startValue,
      endValue,
      hitValue,
      machineId
    });
    await newJackpot.save();
    res.status(201).json(newJackpot);
  } catch (error) {
    res.status(500).json({ message: 'Error creating new jackpot', error });
  }
});




router.route('/delete_time/:id').delete(async (req, res) => {
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
