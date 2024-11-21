const JackpotDrop = require("./model/jackpot_drop.js");

const createJackpotDrop = async (jackpotData) => {
  const {name, value, status, count,machineId } = jackpotData;
  try {
    const newJackpot =  JackpotDrop({
      name,
      value,
      machineId,
      count,
      status,
    });
  
    console.log('createJackpotDrop',jackpotData);
    await newJackpot.save();
    return { status: true, message: "Jackpot drop created successfully", data: newJackpot };
  } catch (error) {
    throw new Error(`Error creating new jackpot drop: ${error.message}`);
  }
};


const findAllJackpotDrops = async () => {
  try {
    const jackpotDrops = await JackpotDrop.find({});
    if (!jackpotDrops || jackpotDrops.length === 0) {
      return { status: false, message: "Cannot find any jackpot drops", data: jackpotDrops };
    }
    return { status: true, message: "Find all jackpot drops", data: jackpotDrops };
  } catch (error) {
    throw new Error(`Error fetching jackpot drops: ${error.message}`);
  }
};

module.exports = {
  createJackpotDrop: createJackpotDrop,
  findAllJackpotDrops: findAllJackpotDrops,
};
