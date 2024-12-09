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



// Function to find the latest jackpot drop and emit it to the client
async function findLatestJackpotDropSocket(name, io) {
  try {
    // Find the latest jackpot drop by sorting in descending order of creation date
    const latestJackpotDrop = await JackpotDrop.findOne().sort({ createdAt: -1 });

    if (!latestJackpotDrop) {
      return { status: false, message: "No jackpot drops found" };
    }

    // Emit the latest jackpot drop to the specified event name
    io.emit(name, [latestJackpotDrop]);
  } catch (error) {
    console.error(`Error fetching the latest jackpot drop: ${error.message}`);
    throw new Error(`Error fetching the latest jackpot drop: ${error.message}`);
  }
}


module.exports = {
  createJackpotDrop: createJackpotDrop,
  findAllJackpotDrops: findAllJackpotDrops,
  findLatestJackpotDropSocket:findLatestJackpotDropSocket,
};
