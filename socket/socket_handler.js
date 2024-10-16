const cron = require('node-cron');
const dboperation_socketio = require('./socket_operation');
//setting using mysqloperation
const dboperation_mysql = require('../mysql/mysql_operation');
//time api using mongodb operation
const dboperation_time = require('../mongodb/mongo_operation.time');
//time function
const dboperation_time_function = require('../mongodb/mongo_function.time');
//jackpot function
const dboperation_jackpot_function = require('../mongodb/mongo_function.jackpot');
const apiSettings = {
    topRakingLimit: 10,
    realtimeLimit: 9,
    init:false
};



let jackpotSettings = {
    returnValue: 100,  // Default value
    oldValue: 100,     // Default value
    defaultThreshold: 130,
    limit: 150,
    percent: 0.05,
    throttleInterval: 10000 // 10 seconds interval between each run
}


function handleSocketIO(io) {
    apiSettings.init=false;
    io.off('connection',(socket)=>{
        console.log('off connection')
    });
    io.on('connection', (socket) => {
            console.log('A user connected', socket.id);
            dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
            dboperation_socketio.findListDisplaySocket('eventFromServerToggle', io);

            const cronJob = cron.schedule('*/5 * * * * *', () => {
                dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
            });

            const cronJob2 = cron.schedule('*/7 * * * * *', () => {
                dboperation_jackpot_function.findJackpotNumberSocket('eventJackpotNumber',io,false,jackpotSettings);
            });

            socket.on('eventFromClient2_force', (data) => {
                dboperation_socketio.findListRankingSocket('eventFromServerMongo', io, true, apiSettings.topRakingLimit);
            });
            
            socket.on('eventFromClient_force', (data) => {
                dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
            });
    
            socket.on('changeLimitTopRanking', (newLimit) => {
                console.log(`Received new limit TOPRANKING from UI: ${newLimit}`);
                apiSettings.topRakingLimit = newLimit;
                console.log(`Updated findListRankingSocketLimit to: ${apiSettings.topRakingLimit}`);
            });
            socket.on('changeLimitRealTimeRanking', (newLimit) => {
                console.log(`Received new limit REALTIME from UI: ${newLimit}`);
                apiSettings.realtimeLimit = newLimit;
                console.log(`Updated changeLimitRealTimeRanking to: ${apiSettings.realtimeLimit}`);
            });
    
            socket.on('eventFromClientDelete', (data) => {
                const stationIdToDelete = data.stationId;
                dboperation_socketio.deleteStationDataSocketWName('eventFromServer', io, stationIdToDelete);
                dboperation_socketio.findStationDataSocketWName('eventFromServer', io);
            });
            socket.on('eventFromClientAdd', (data) => {
                const { machine, member, bet, credit, connect, status, aft, lastupdate } = data;
                dboperation_socketio.addStationDataSocketWName('eventFromServer', io, machine, member, bet, credit, connect, status, aft, lastupdate);
                dboperation_socketio.findStationDataSocketWName('eventFromServer', io);
            });
    
    
            //TOGGLE EVENT FROM CLIENT 
            socket.on('emitToggleDisplay', (data) => {
                dboperation_socketio.findListDisplaySocket('eventFromServerToggle', io);
            });
            //TOGGLE EVENT FROM CLIENT 
            socket.on('emitToggleDisplayRealTop', (data) => {
                dboperation_socketio.findListDisplayRealTopSocket('eventFromServerToggle', io);
            });



            // Handle getting settings from the database
            socket.on('emitSetting', async () => {
                console.log('getSetting acess');
                dboperation_mysql.findSettingSocket('eventSetting',io);
            });
            
            //emitTime Socket
            socket.on('emitTime', async () => {
                console.log('emitTime acess');
                dboperation_time_function.findTimeFirstSocket('eventTime',io);
            });

            //updateTime Socket
            socket.on('updateTime', async (updateData) => {
                console.log('Update Time access without ID');
                dboperation_time_function.updateTimeByIdSocket('eventTime', io, updateData);
            });


            //jackpot socket from mongodb
            socket.on('emitJackpot', async () => {
                console.log('jackpot acess');
                dboperation_jackpot_function.findJackpotPriceSocket('eventJackpot',io);
            });
            

            //jackot socket from mysql 
            socket.on('emitJackpotNumber', async () => {
                console.log('jackpot acess number');
                dboperation_jackpot_function.findJackpotNumberSocket('eventJackpotNumber',io,false,jackpotSettings);
            });

            //jackot socket from mysql 
            socket.on('emitJackpotNumberInitial', async () => {
                console.log('jackpot acess number initial');
                dboperation_jackpot_function.findJackpotNumberSocket('eventJackpotNumber',io,true,jackpotSettings);
            });
            // Listen for 'updateJackpotSettings' from Flutter
            socket.on('updateJackpotSetting', (newSettings) => {
                console.log('Received new jackpot settings from Flutter:', newSettings);
                // Update the current jackpot settings with the new ones received from Flutter
                jackpotSettings = {
                    ...jackpotSettings,  // Spread operator to maintain the structure and overwrite specific fields
                    ...newSettings       // Overwriting only the provided new settings
                };
                console.log('Updated jackpot settings:', jackpotSettings);
                // Optionally, emit an event back to Flutter or other clients to confirm the update
                io.emit('jackpotSettingsUpdated', jackpotSettings);
            });
    
            socket.on('disconnect', () => {
                console.log('A user disconnected');
                cronJob.stop();
                cronJob2.stop();
                apiSettings.init=false;
            });
        });
}

module.exports = {
    handleSocketIO,
    jackpotSettings,
};

