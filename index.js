const express = require('express');
const app = express();
require('dotenv').config();
require('./start/start')(app);
require('./config/db')(app);