var http = require('http');
const cron = require('node-cron');
const dboperation_socketio = require('./socket_operation');
const { truncate } = require('fs');
const apiSettings = {
    topRakingLimit: 10,
    realtimeLimit: 9,
    init:false
};




// function initializeOperations(io) {
//     if (!isOperationsExecuted) {
//         dboperation_socketio.findDataSocketFullRedis('eventFromServer', io, true);
//         dboperation_socketio.findListRankingSocketRedis('eventFromServerMongo', io, true);
//         cronJob = cron.schedule('*/7 * * * * *', () => {
//             dboperation_socketio.findDataSocketFullRedis('eventFromServer', io, false);
//             dboperation_socketio.findListRankingSocketRedis('eventFromServerMongo', io, false);
//         });
//         isOperationsExecuted = true;
//     }
// }
function handleSocketIO(io) {
    apiSettings.init=false;
    io.off('connection',(socket)=>{
        console.log('off connection')
    });
    io.on('connection', (socket) => {
            console.log('A user connected', socket.id);
            dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
            // dboperation_socketio.findListRankingSocket('eventFromServerMongo', io, false, apiSettings.topRakingLimit);
            dboperation_socketio.findListDisplaySocket('eventFromServerToggle', io);
    
    
            const cronJob = cron.schedule('*/5 * * * * *', () => {
                dboperation_socketio.findDataSocketFull('eventFromServer', io, true, apiSettings.realtimeLimit);
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
            
    
            socket.on('disconnect', () => {
                console.log('A user disconnected');
                cronJob.stop();
                apiSettings.init=false;
            });
        });
}
function handleSocketIOTopRanking(io) {
        // io.on('connection', (socket) => {
        //     console.log('A user top rank connected', socket.id);
        //     socket.on('eventFromClient2_force', (data) => {
        //         apiSettings.init=true;
        //         dboperation_socketio.findListRankingSocket('eventFromServerMongo', io, true, apiSettings.topRakingLimit);
        //     });
           
    
        //     socket.on('disconnect', () => {
        //         console.log('A user disconnected');
        //         cronJob.stop();
        //         io.emit('eventFromServerMongo', {});
        //     });
        // });
}


module.exports = { 
        // initializeOperations,
        handleSocketIO ,
        handleSocketIOTopRanking
};

