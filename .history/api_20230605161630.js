var dboperation = require('./dboperation')
var express = require('express')
var body_parser = require('body-parser')
var cors = require('cors')
var app = express();
var router = express.Router();
var fs = require('fs');
var cmd = require('node-cmd');
var app = express();
var router = express.Router();
var path = require('path');
var soap = require('./soap');
const morgan = require('morgan');


// // Create a write stream (in append mode) for the log file
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log_api.txt'), { flags: 'a' });
app.use(morgan('common', { stream: accessLogStream }));

//SWAGGER
const swaggerUi = require("swagger-ui-express"),
    swaggerDocument = require("./swagger.json");

app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(body_parser.urlencoded({ extended: true }))
app.use(body_parser.json())
app.use(cors())
app.use('/api', router)

router.use((request, response, next) => {
    console.log('middleware!');
    next();
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
});




var port = process.env.PORT || 8090;
app.listen(port);
console.log('app running at port: ' + port);

//FRONT END VIEw
app.use('/ui', router)
app.use(express.static('web_new/web'));
app.use(express.static('web_new/web/assets'));
app.use(express.static('web_new/web-staff'));
app.use(express.static('web_new/web-staff/assets'));
router.get('/client', (request, response) => {
    response.sendFile(path.resolve('./web_new/web/index.html'));
})


//Customer date frame 
router.route('/dateframe_by_number').post((request, response, next) => {
    const { number } = request.body;
    // console.log(number)
    dboperation.getDateFrameByNumber(number, function (err, result) {
        if (err) {
            console.log(`error dateframe by number ${err}`)
            next(err);
        }
        response.json(result)
    }).catch(err => {
        next(err)
    })

})


