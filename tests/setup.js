jest.setTimeout(40000); // for ending EACH test

require ('../models/User');

const keys = require('../config/keys');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(keys.mongoURI, { useMongoClient: true });