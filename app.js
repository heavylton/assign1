const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const vehicleRoutes = require('./api/routes/vehicles');
const rentRoutes = require('./api/routes/renting');

mongoose.connect('mongodb+srv://mencseroliver:' + process.env.MONGO_PW + '@vehicle-assignment.6sthr.mongodb.net/?retryWrites=true&w=majority&appName=vehicle-assignment');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
        return res.status(200).json({});
    }
    next();
})

//routes
app.use('/vehicles', vehicleRoutes);
app.use('/renting', rentRoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;