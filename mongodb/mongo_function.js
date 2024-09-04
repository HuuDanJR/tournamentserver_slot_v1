const mongoose = require('mongoose');
const rankingsRealTime = require('./model/rankings_realtime');
const randongString = require('randomstring')

async function saveListStationToMongo(data, roundNameUnique) {
  try {
      for (const station of data) {
          const { machine, member, credit, lastupdate } = station;
          
          const newRecord = new rankingsRealTime({
            customer_name: member,
            customer_number: machine,
            point: credit,
            createdAt: lastupdate,
            roundName: roundNameUnique
        });
        await newRecord.save();
      }

      console.log('Data saved to MongoDB successfully.');
      return { message: 'Data saved to MongoDB successfully.' };
  } catch (error) {
      console.error('Error while saving data to MongoDB:', error);
      throw error;
  }
}



module.exports = {
  saveListStationToMongo:saveListStationToMongo
}