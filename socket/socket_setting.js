const { join } = require('path');
const connection = require('../mysql/mysql_dbconfig');
const rankingModel = require('../mongodb/model/ranking');
const mongofunctions = require('../mongodb/mongo_operation2');
const client = require('../redis/redis_config');
const displayModel  =require('../mongodb/model/display');
const displayModelRealTop  =require('../mongodb/model/display_realtop');

