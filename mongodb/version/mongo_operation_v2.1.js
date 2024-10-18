// rankingUtils.js

const rankingModel = require('../model/ranking')
const addNewRankings = async (newCredits, members, ips) => {
//REMOVE DUPLICATE 
const pipeline = [
    {
      $group: {
        _id: { customer_name: '$customer_name' },
        uniqueIds: { $addToSet: '$_id' },
        count: { $sum: 1 }
      }
    },
    {
      $match: {
        count: { $gt: 1 }
      }
    }
  ];
  
  const duplicateRecords = await rankingModel.aggregate(pipeline);
  if (duplicateRecords.length > 0) {
    for (const record of duplicateRecords) {
      const [firstId, ...otherIds] = record.uniqueIds;
      await rankingModel.deleteMany({ _id: { $in: otherIds } });
    }
  }

    const items = await rankingModel.find({}).sort({ point: -1 }).limit(10).exec();
    if (items && items.length > 0) {
        // console.log(`have items ${items.length}`);
        if (items.length < 10) {
            // console.log(`items left ${10-items.length}`);
        }
        for (let i = 0; i < members.length; i++) {
            if (members[i] === items[i].customer_name) {
                // console.log(`equal ${members[i]} ${ips[i]}`,);
            } else {
                // console.log('not equal');
                const filter = {
                    customer_name: members[i],
                    customer_number: ips[i],
                };
                try {
                    const existingRanking = await rankingModel.findOne(filter);
                    if (existingRanking) {
                        // Document with the same 'customer_name' and 'customer_number' exists, update it
                        existingRanking.point = newCredits[i];
                        await existingRanking.save();
                    } else {
                        // Document doesn't exist, create a new one
                        const newRanking = new rankingModel({
                            customer_name: members[i],
                            customer_number: ips[i],
                            point: newCredits[i],
                            id: generateRandom6DigitNumber(6),
                        });
                        await newRanking.save();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        }
    }
    else {
        console.log('no item')
        for (let i = 0; i < newCredits.length; i++) {
            const newRanking = new rankingModel({
                customer_name: members[i],
                customer_number: ips[i],
                point: newCredits[i],
                id: generateRandom6DigitNumber(6)
            });
            newRanking.save();
        }
    }
};


const updateRankings = async (newCredits, members, ips) => {
    addNewRankings(newCredits, members, ips);


    const items = await rankingModel.find({}).sort({ point: -1 }).limit(10).exec();
    for (let i = 0; i < items.length; i++) {

        const filter = {
            customer_name: members[i],
            customer_number: ips[i],
          };
          try {
            const existingRanking = await rankingModel.findOne(filter);

            if (existingRanking) {
              // Document with the same 'customer_name' and 'customer_number' exists, update it
              existingRanking.point = newCredits[i];
            //   existingRanking.customer_number =ips[i] ;
            //   existingRanking.customer_name =members[i];
              await existingRanking.save();
            } else {
              // Document doesn't exist, create a new one
              const newRanking = new rankingModel({
                customer_name: members[i],
                customer_number: ips[i],
                point: newCredits[i],
                id: generateRandom6DigitNumber(6),
              });
              await newRanking.save();
            }
          } catch (err) {
            console.error(err);
          }
    }
};







module.exports = { updateRankings, addNewRankings };



function generateRandom6DigitNumber() {
    const min = 100000; // Minimum 6-digit number
    const max = 999999; // Maximum 6-digit number

    return Math.floor(Math.random() * (max - min + 1)) + min;
}