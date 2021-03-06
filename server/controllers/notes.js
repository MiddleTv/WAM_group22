var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Note = require('../models/Note');

// Create a new note
router.post('/', function(req, res, next) {
    if(req.body.topic || req.body.textContent){
        var note = new Note(req.body);
        note.lastUpdated = new Date();
        note.createdOn = new Date();
        note.save(function(err) {
            if (err) { return next(err); }
            res.status(201).json({"note" : note}); // json({"message" : 'Note is Successfully created'});
        });
    } else {
        res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
    }
});

// Return list of all notes
router.get('/', function(req, res, next) {
    Note.find(function(err, notes) {
        if (err) { 
            return next(err); 
        } else if (notes.length === 0)
            res.status(200).json({"notes": [], "message" : 'There are no Notes registered'});
        else {
            res.status(200).json({"notes": notes});
        }
    });
});

// Return a note with a given ID
router.get('/:noteId', function(req, res, next) {
    var id = req.params.noteId;
    Note.findById(id, function(err, note) {
        if (err) { return next(err); }
        if (note === null) {
            return res.status(404).json({'message': 'Note is not found'});
        }
        res.status(200).json(note);
    });
});

// Update a whole note with a given ID
router.put('/:noteId', function(req, res, next) {
    var id = req.params.noteId;
    Note.findById(id, function(err, note) {
        if (err) { return next(err); }
        if (note == null) {
            return res.status(404).json({"message": "Note is not found"});
        }

        if(req.body.topic || req.body.textContent){

            note.topic = req.body.topic
            note.textContent = req.body.textContent;

            note.lastUpdated = new Date();
            note.save();
            res.status(200).json({"note" : note}); // json({"message" : 'Note is successfully updated (put)', note});
        } else {
            res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
        }
    });
});


//Patch a note with a given ID
router.patch('/:noteId', function(req, res, next) {
    var id = req.params.noteId;
    Note.findById(id, function(err, note) {
        if (err) { return next(err); }
        if (note == null) {
            return res.status(404).json({"message": "Note is not found"});
        }

        if(req.body.topic || req.body.textContent){

            note.topic = (req.body.topic || note.topic);
            note.textContent = (req.body.textContent || note.textContent);
            
            note.lastUpdated = new Date();
            note.save();
            res.status(200).json({"note" : note}); // json({"message" : 'Note is successfully updated (patch)', note});
        } else {
            res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
        }
    });
});


//Delete a note with a given ID
router.delete('/:noteId', function(req, res, next) {
    var id = req.params.noteId;
    Note.findOneAndDelete({_id: id}, function(err, note) {
        if (err) { return next(err); }
        if (note === null) {
            return res.status(404).json({'message': 'Note is not found'});
        }
        res.status(200).json({"message" : 'Success'});
    });
});


// Delete all notes
router.delete('/', function(req, res, next) {
    var removable = 1; //to limit the display of a no note msg after removals
    
    Note.find(function(err, notes) {
        if (err) { 
            return next(err); 
        } else if (notes.length === 0 && removable){
            res.status(204).json({"message" :'There are no Notes to be deleted'});
        } else {
            removable = 0;

            for(var i = 0; i < notes.length; i++ ){
                Note.findByIdAndRemove({_id : notes[i]._id}, function(err, note){
                    if (err) { return next(err); }
                });
            }
            res.status(200).json({"message" : 'Success'});
        }
    });
});

/*
// Create a new item
router.post('/:noteId/items', function(req, res, next) {
    var id = req.params.noteId;

    Note.findById(id, function(err, note) {
        if (err) { return next(err); }
        if (note === null) {
            return res.status(404).json({'message': 'The Note is not registered'});
        }
        const newItem = new Item({
            _id: new mongoose.Types.ObjectId(),
            //fullName: req.body.fullName
          });

        newItem.save(function(err2, addedItem){
            if (err2) { return next(err2)};
            note.items.push(addedItem);
            note.save();
            res.status(201).json(note);
        });
    });
});
    
        
// Return list of all items of a note
router.get('/:noteId/items', function(req, res, next) {
    var id = req.params.noteId;

    Note.findById(id, function(err, note) {
        if (err) { return next(err); }
        if (note === null) {
            return res.status(404).json({'message': 'The Note is not registered'});
        } else if (note.items.length === 0)
            return res.status(201).json({'message': 'The Note has yet not a registered item'});
        res.status(201).json(note.items);
    });
});


// Return a specific item of a note
router.get('/:noteId/items/:itemId', function(req, res, next) {
    var notId = req.params.noteId;
    var itmId = req.params.itemId;

    Note.findById(notId, function(err, note) {
        if (err) { return next(err); }
        if (note === null) {
            return res.status(404).json({'message': 'The Note is not registered'});
        }
        Item.findById({_id : itmId}, function(err2, foundItem) {
            if (err2) { return next(err2); }
            if (foundItem === null) {
                return res.status(404).json({'message': 'Item is not registered for the Note'});
            }
            res.status(201).json(foundItem);
        });
    });
});


// Delete a specific item of a note
router.delete('/:noteId/items/:itemId', function(req, res, next) {
    var notId = req.params.noteId;
    var itmId = req.params.itemId;

    Note.findById(notId, function(err, note) {
        if (err) { return next(err); }
        if (note === null) {
            return res.status(404).json({'message': 'The note is not registered'});
        }
        Item.findById({_id : itmId}, function(err2, foundItem) {
            if (err2) { return next(err2); }
            if (foundItem === null) {
                return res.status(404).json({'message': 'Item is not registered for the Note'});
            }
            var updatedItems = [];
            
            for(var i = 0; i < note.items.length;i++){
                if(!(note.items[i] == itmId)){
                    updatedItems.push(note.items[i]);
                }    
            }

            note.items = updatedItems;
            note.save();
            res.status(201).json(note);
        });
    });
});


// Delete all items of a note
router.delete('/:noteId/items', function(req, res, next) {
    var notId = req.params.noteId;

    var removable = 1; //to limit the display of a no note msg after removals

    Note.findById(notId, function(err, note) {
        if (err) { 
            return next(err); 
        } else if (note.length === 0 && removable) {
            return res.status(404).json({'message': 'Note not found'});
        } else {
            removable = 0;
            if(note.items.length == 0)
                return res.status(204).json({'message': 'There are no items to remove'});
            else{
                note.items = [];
                note.save();
                res.status(200).json('All items are removed');
            }
        }
    });
});
*/
//appropriateData function()
module.exports = router;
