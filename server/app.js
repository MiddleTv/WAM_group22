var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var cors = require('cors');
var history = require('connect-history-api-fallback');

require('dotenv/config');

mongoose.set('useFindAndModify', false);    //needed to avoid warning

var camelsController = require('./controllers/camels');
var tasksController = require('./controllers/tasks');
var notesController = require('./controllers/notes');
var usersController = require('./controllers/users');
var calendarsController = require('./controllers/calendars');
var remindersController = require('./controllers/reminders');
var eventsController = require('./controllers/events');
var queuesController = require('./controllers/queues');

// Variables
var mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/animalsDevelopmentDB';
    //MONGODB_URI is in an env file that has the entire database address with database name animalProductionDB, own username and password
var port = process.env.PORT || 3001;

var uriTxt = mongoURI.charAt(10);
var providedURI;

if(uriTxt === 'l')  //part of 'mongodb://localhost'
    providedURI = 'with local MongoDB URI';

if(uriTxt === 'v')  //part of 'mongodb+srv'
    providedURI = 'with remote DB URI';

// Connect to MongoDB 
mongoose.connect(mongoURI, { useNewUrlParser: true , useUnifiedTopology: true } ,function(err) {
    if (err) {
        console.error(`Failed to connect ` + providedURI);
        console.error(err.stack);
        process.exit(1);
    }
    console.log(`Connected ` + providedURI);
});

// Create Express app
var app = express();

// Parse requests of content-type 'application/json'
app.use(bodyParser.json());
// HTTP request logger
app.use(morgan('dev'));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options('*', cors());
app.use(cors());

// Define routes
app.get('/api', function(req, res) {
    res.json({'message': 'Welcome to your DIT341 backend ExpressJS project!'});
});

app.use('/api/camels', camelsController);
app.use('/api/tasks', tasksController);
app.use('/api/notes', notesController);
app.use('/api/users', usersController);
app.use('/api/calendars', calendarsController);
app.use('/api/reminders', remindersController);
app.use('/api/events', eventsController);
app.use('/api/queues', queuesController);

// Catch all non-error handler for api (i.e., 404 Not Found)
app.use('/api/*', function (req, res) {
    res.status(404).json({ 'message': 'Not Found' });
});

// Configuration for serving frontend in production mode
// Support Vuejs HTML 5 history mode
app.use(history());
// Serve static assets
var root = path.normalize(__dirname + '/..');
var client = path.join(root, 'client', 'dist');
app.use(express.static(client));

// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get('env');
// eslint-disable-next-line no-unused-vars
app.use(function(err, req, res, next) {
    console.error(err.stack);
    var err_res = {
        'message': err.message,
        'error': {}
    };
    if (env === 'development') {
        err_res['error'] = err;
    }
    res.status(err.status || 500);
    res.json(err_res);
});

app.listen(port, function(err) {
    if (err) throw err;
    console.log(`Express server listening on port ${port}, in ${env} mode`);
    console.log(`Backend: http://localhost:${port}/api/`);
    console.log(`Frontend (production): http://localhost:8080/`);
});

module.exports = app;
