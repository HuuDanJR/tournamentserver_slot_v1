const express = require('express');
const router = express.Router();
const Stream  =  require('./model/stream.js')
const { v4: uuidv4 } = require('uuid');


router.route('/all_stream').get(async (req, res) => {
  try {
    const stream = await Stream.find({  });
    if (!stream) {
      return res.status(404).json({message:"Cannot find any stream ",data:stream,status:false});
    }
    res.json({status:true,message:"Find stream all",data:stream,});
  
  } catch (error) {
    res.status(500).json({ message: 'Error creating time', error });
  }
});

router.route('/create_stream').post(async (req, res) => {
  const {name,  url,  active } = req.body;
  try {
    const newStream = new Stream({
      id: uuidv4(), // Generate a unique ID
      name,
      url,
      active,
    });
    await newStream.save();
    res.status(201).json(newStream);
  } catch (error) {
    res.status(500).json({ message: 'Error creating time', error });
  }
});

// //export router for use
module.exports = router;
