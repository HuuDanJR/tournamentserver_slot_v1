const mongoose = require('mongoose')
const username = "LeHuuDan99";
const password = "3lyIxDXEzwCtzw2i";
const database = "PromotionVegas";
const host_imge = 'http://localhost:8090/files/'
const URL = `mongodb+srv://${username}:${password}@clustervegas.ym3zd.mongodb.net/${database}?retryWrites=true&w=majority`;
const DB_OPTIONS = {
useNewUrlParser: true,
useUnifiedTopology: true,
};