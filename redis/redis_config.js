// const redis = require('redis');
// const client = redis.createClient({
//     password: '',
//     host: 'redis-11073.c295.ap-southeast-1-1.ec2.cloud.redislabs.com',
//     port: 11073,
//     legacyMode: true
// });


// client.connect().then(() => {
//     console.log('Connected to Redis!');
// })
// // Listen for the 'ready' event to confirm that the connection is established
// client.on('ready', () => {
//     // console.log('Redis ready');
// });

// // Listen for the 'error' event to handle connection errors
// client.on('error', (err) => {
//     console.error('Error connecting to Redis:', err);
// });
// module.exports=client;