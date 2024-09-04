const express = require('express')
const body_parser = require('body-parser')
const cors = require('cors')
const app = express(); 
const router = express.Router();
const http = require('http').createServer(app);  // Use the same http instance for express and socket.io
const io = require('socket.io')(http);
const path =require('path');

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser.urlencoded({ extended: false }))
app.use(body_parser.json())
app.use(cors())
const routerAPI = require('./api')
app.use('/api', routerAPI)
//USE MONGODB DATABASE
const config = require('./mongodb/mongo_config')
config.connectDB();
const rankingRoutes = require('./mongodb/mongo_operation');
app.use('/api', rankingRoutes);

const port = process.env.PORT || 8096;
http.listen(port, () => { 
    console.log('app running at port: ' + port);
});

//USE SOCKET IO
const socketHandler = require('./socket/socket_handler');
socketHandler.handleSocketIO(io);

// RUN WEB
const compression = require('compression');
app.use(compression());
const oneDay = 86400000; // 24 hours in milliseconds
app.use(express.static(path.join(__dirname, 'public-flutter'), { maxAge: oneDay }));
// app.use(express.static(path.join(__dirname, 'public-flutter')));
router.get('/', (request, response) => {
    response.sendFile(path.join(__dirname, 'public-flutter', 'index.html'));
});

