var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../models/User');

// Create a new user
router.post('/', function(req, res, next) {
    if(req.body.username || req.body.username || req.body.type){
        var user = new User(req.body);
        user.save(function(err) {
            if (err) { return next(err); }
            res.status(201).json(user);
        });
    } else {
        res.json('The request data does not have valid keys or is empty');
    }
});

// Return list of all users
router.get('/', function(req, res, next) {
    User.find(function(err, users) {
        if (err) { 
            return next(err); 
        } else if (users.length === 0)
            res.json('There are no Users registered');
        else {
            res.json({'users': users});
        }
    });
});

// Return a user with a given ID
router.get('/:userId', function(req, res, next) {
    var id = req.params.userId;
    User.findById(id, function(err, user) {
        if (err) { return next(err); }
        if (user === null) {
            return res.status(404).json({'message': 'User is not found'});
        }
        res.status(201).json(user);
    });
});

// Update a whole user with a given ID
router.put('/:userId', function(req, res, next) {
    var id = req.params.userId;
    User.findById(id, function(err, user) {
        if (err) { return next(err); }
        if (user === null) {
            return res.status(404).json({"message": "User is not found"});
        }

        if(req.body.username || req.body.password || req.body.type){

            user.username = req.body.username;
            user.password = req.body.password;
            user.type = req.body.type;

            user.save();
            res.json(user);
        } else {
            res.json('The request data does not have valid keys or is empty');
        }
    });
});

//Patch a user with a given ID
router.patch('/:userId', function(req, res, next) {
    var id = req.params.userId;
    User.findById(id, function(err, user) {
        if (err) { return next(err); }
        if (user === null) {
            return res.status(404).json({"message": "User is not found"});
        }

        if(req.body.username || req.body.password || req.body.type){
            
            user.username = (req.body.username || user.username);
            user.password = (req.body.password || user.password);
            user.type = (req.body.type || user.type);
            
            user.save();
            res.json(user);
        } else {
            res.json('The request data does not have valid keys or is empty');
        }
    });
});

//Delete a user with a given ID
router.delete('/:userId', function(req, res, next) {
    var id = req.params.userId;
    User.findOneAndDelete({_id: id}, function(err, user) {
        if (err) { return next(err); }
        if (user === null) {
            return res.status(404).json({'message': 'User is not found'});
        }
        res.json(user);
    });
});

// Delete all users
router.delete('/', function(req, res, next) {
    var removable = 1; //to limit the display of a no user msg after removals
    
    User.find(function(err, users) {
        if (err) { 
            return next(err); 
        } else if (users.length === 0 && removable){
            res.json('There are no Users to be deleted');
        } else {
            removable = 0;

            for(var i = 0; i < users.length; i++ ){
                User.findByIdAndRemove({_id : users[i].id}, function(err, user){
                    if (err) { return next(err); }
                });
            }
            res.json('All Users are removed');
        }
    });
});

module.exports = router;