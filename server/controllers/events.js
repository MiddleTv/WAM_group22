var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var Event = require('../models/Event');
var Reminder = require('../models/Reminder');

// Create a new event
router.post('/', async function(req, res, next) {
    if(req.body.title || req.body.description || req.body.startDate ||  req.body.endDate
        || req.body.importanceLevel ){
            var event = new Event(req.body);
            try{
                var savedEvent = await event.save();
                res.status(201).json({"event" : savedEvent});
            } catch (err){
                return next(err);
            }
    } else {
        res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
    }
    
});


// Return list of all events
router.get('/', async function(req, res, next) {
    try{
        var events = await Event.find();

        if (events.length === 0)
            res.status(200).json({"events": [], "message" : 'There are no Events registered'});
        else {
            res.status(200).json({"events": events});
        }
    } catch (err) {
        return next(err);
    }
});

/*
// Return list of all events (Sorting included)
router.get('/', function(req, res, next) {
    var sortOrd = req.query.order;
    var sortTit = req.query.event.title;
    var sortDesc = req.query.event.description;
    var sortStart = req.query.event.startDate;
    var sortEnd = req.query.event.endDate;

    let obj = {}

    if(sortTit)
        if(sortTit >= '1')
    
    obj['title'] = req.query.event.title == '1' ? 1:-1

    if(sorting != null) {
      Event
       .find({})
       .sort(obj) 
       .exec(function(err, events) {
          if(err){
              res.status(404).send({
                  message: err,
                  data: []
              });
          } else {
              res.status(200).send({
                  message: 'OK sorted',
                  data: events
              });
          }
      });
    } else {
        Event.find(function(err, events) {
            if (err) { 
                return next(err); 
            } else if (events.length === 0)
                res.status(200).json({"message" : 'There are no Events registered'});
            else {
                res.status(200).json({'events': events});
            }
        });
    }
});
*/

// Return a event with a given ID
router.get('/:eventId', function(req, res, next) {
    var id = req.params.eventId;
    Event.findById(id, function(err, event) {
        if (err) { return next(err); }
        if (event === null) {
            return res.status(404).json({'message': 'Event not found'});
        }
        res.status(200).json(event);
    });
});


// Update a whole event with a given ID
router.put('/:eventId', function(req, res, next) {
    var id = req.params.eventId;
    Event.findById(id, function(err, event) {
        if (err) { return next(err); }
        if (event == null) {
            return res.status(404).json({"message": "Event not found"});
        }

        if(req.body.title || req.body.description || req.body.startDate ||  req.body.endDate
            || req.body.importanceLevel ){

            event.title = req.body.title;
            event.description = req.body.description;
            event.importanceLevel = req.body.importanceLevel;
            event.startDate = req.body.startDate;
            event.endDate = req.body.endDate;
            //event.hasReminder = req.body.hasReminder;

            event.save();
            res.status(200).json({"event" : event}); // json({"message" : 'Event successfully updated (put)', event});
        } else {
            res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
        }
        
    });
});


//Patch a event with a given ID
router.patch('/:eventId', function(req, res, next) {
    var id = req.params.eventId;
    Event.findById(id, function(err, event) {
        if (err) { return next(err); }
        if (event == null) {
            return res.status(404).json({"message": "Event is not found"});
        }

        if(req.body.title || req.body.description || req.body.startDate || 
            req.body.endDate || req.body.importanceLevel ) {

            event.title = (req.body.title || event.title);
            event.description = (req.body.description || event.description);
            event.importanceLevel = (req.body.importanceLevel || event.importanceLevel);
            event.startDate = (req.body.startDate || event.startDate);
            event.endDate = (req.body.endDate || event.endDate);
            //event.hasReminder = (req.body.hasReminder || event.hasReminder);
    
            event.save();
            res.status(200).json({"event" : event}); // json({"message" : 'Event successfully updated (patch)', event});
        } else {
            res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
        }
        
    });
});


//Delete a event with a given ID
router.delete('/:eventId', function(req, res, next) {
    var id = req.params.eventId;
    Event.findOneAndDelete({_id: id}, function(err, event) {
        if (err) { return next(err); }
        if (event === null) {
            return res.status(404).json({'message': 'Event is not found'});
        } else {
            Reminder.findOneAndRemove({reminderFor : id}, function(err, foundReminders){
                if (err) { return next(err); }
            });
        }
        
        res.status(200).json({"message" : 'Success'});
    });
});


// Delete all events
router.delete('/', function(req, res, next) {
    var removable = 1; //to limit the display of a no event msg after removals
    
    Event.find(function(err, events) {
        if (err) { 
            return next(err); 
        } else if (events.length === 0 && removable){
            res.status(204).json({"message" : 'There are no Events to be deleted'});
        } else {
            removable = 0;

            for(var i = 0; i < events.length; i++ ){
                Reminder.findOneAndRemove({reminderFor : events[i]._id}, function(err, foundReminder){
                    if (err) { return next(err); }
                });

                Event.findByIdAndRemove({_id : events[i]._id}, function(err, event){
                    if (err) { return next(err); }
                });
            }
            res.status(200).json({"message" :'Success'});
        }
    });
});


// Create a new reminder
router.post('/:eventId/reminders', function(req, res, next) {
    var id = req.params.eventId;

    Event.findById(id, function(err, event) {
        if (err) { return next(err); }
        if (event === null) {
            return res.status(404).json({'message': 'The Event is not registered'});
        }
        if(req.body.topic || req.body.remindBefore || req.body.importanceLevel){
            var newReminder = new Reminder({
                //_id: new mongoose.Types.ObjectId(),
                topic: req.body.topic,
                targerMoment: event.startDate,
                remindBefore: req.body.remindBefore,
                reminderFor: id,
                importanceLevel: req.body.importanceLevel
            });
            
            newReminder.save(function(err,addedReminder){
                if (err) { return next(err)};
                res.status(201).json({"reminder" : newReminder});
            })

        } else {
            res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
        } 
    });
});
    
        
// Return list of all reminders of a event
router.get('/:eventId/reminders', function(req, res, next) {
    var id = req.params.eventId;

    Event.findById(id, function(err, event) {
        if (err) { return next(err); }
        if (event === null) {
            return res.status(404).json({'message': 'The Event is not registered'});
        } else { /*if (event.reminders.length === null)
            return res.status(204).json({'message': 'The Event has yet not a registered Reminder'}); */
            Reminder.find({reminderFor : id}, function(err, foundReminders) {
                if (err) { return next(err); }
                if(foundReminders)
                    res.status(200).json({"reminders": foundReminders});
                else 
                    res.status(204).json({"message": "there are no reminders"});
            })
        
        }
    });
});


// Return a specific reminder of a event
router.get('/:eventId/reminders/:reminderId', function(req, res, next) {
    var evtId = req.params.eventId;
    var remId = req.params.reminderId;

    Event.findById(evtId, function(err, event) {
        if (err) { return next(err); }
        if (event === null) {
            return res.status(404).json({'message': 'The Event is not registered'});
        }
        Reminder.findById({_id : remId}, function(err2, foundReminder) {
            if (err2) { return next(err2); }
            if (foundReminder === null) {
                return res.status(404).json({'message': 'Reminder is not registered for the Event'});
            }
            res.status(200).json({"reminder": foundReminder});
        });
    });
});


// Update part of specific reminder of a event
router.patch('/:eventId/reminders/:reminderId', function(req, res, next) {
    var evtId = req.params.eventId;
    var remId = req.params.reminderId;

    Event.findById(evtId, function(err, foundEvent) {
        if (err) { return next(err); }
        if (foundEvent === null) {
            return res.status(404).json({'message': 'The Event is not registered'});
        }
        Reminder.findById({_id : remId}, function(err2, foundReminder) {
            if (err2) { return next(err2); }
            if (foundReminder === null) {
                return res.status(404).json({'message': 'Reminder is not registered for the Event'});
            }

            if(req.body.topic || req.body.targetMoment || req.body.remindBefore || req.body.importanceLevel){

                foundReminder.topic = (req.body.topic || foundReminder.topic);
                foundReminder.targetMoment = (req.body.targetMoment || foundReminder.targetMoment);
                foundReminder.remindBefore = (req.body.remindBefore || foundReminder.remindBefore);
                foundReminder.importanceLevel = (req.body.importanceLevel || foundReminder.importanceLevel);

                foundReminder.save();
                foundEvent.save();
                res.status(200).json({"reminder" : foundReminder}); // json({"message" : 'Reminder detail successfully updated (patch)', "updated reminder" : foundReminder});
                
            } else {
                res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
            }

        });
    });
});


// Update whole of specific reminder of a event
router.put('/:eventId/reminders/:reminderId', function(req, res, next) {
    var evtId = req.params.eventId;
    var remId = req.params.reminderId;

    Event.findById(evtId, function(err, foundEvent) {
        if (err) { return next(err); }
        if (foundEvent === null) {
            return res.status(404).json({'message': 'The Event is not registered'});
        }
        Reminder.findById({_id : remId}, function(err2, foundReminder) {
            if (err2) { return next(err2); }
            if (foundReminder === null) {
                return res.status(404).json({'message': 'Reminder is not registered for the Event'});
            }

            if(req.body.topic || req.body.targetMoment || req.body.remindBefore || req.body.importanceLevel){

                foundReminder.topic = req.body.topic;
                foundReminder.targetMoment = req.body.targetMoment;
                foundReminder.remindBefore = req.body.remindBefore;
                foundReminder.importanceLevel = req.body.importanceLevel
                
                foundReminder.save();
                foundEvent.save();
                res.status(200).json({"reminder" : foundReminder}); // json({"message" : 'Reminder detail successfully updated (put)', "updated reminder" : foundReminder});
                
            } else {
                res.status(400).json({"message":'The request data does not have valid keys or is empty.'});
            }

        });
    });
});


// Delete a specific reminder of a event
router.delete('/:eventId/reminders/:reminderId', function(req, res, next) {
    var evtId = req.params.eventId;
    var remId = req.params.reminderId;

    Event.findById(evtId, function(err, event) {
        if (err) { return next(err); }
        if (event === null) {
            return res.status(404).json({'message': 'The Event is not registered'});
        }
        Reminder.findByIdAndRemove({_id : remId}, function(err2, removedReminder) {
            if (err2) { return next(err2); }
            if (removedReminder === null) {
                return res.status(404).json({'message': 'Reminder is not registered for the Event'});
            }
            res.status(200).json({"reminder" : removedReminder});
        });
    });
});


// Delete all reminders of a event
router.delete('/:eventId/reminders', function(req, res, next) {
    var evtId = req.params.eventId;

    var removable = 1; //to limit the display of a no event msg after removals

    Event.findById(evtId, function(err, event) {
        if (err) {
            return next(err); 
        } else if (event.length === 0 && removable) {
            return res.status(404).json({'message': 'Event is not found'});
        } else {
            removable = 0;
            
            Reminder.deleteMany({reminderFor : evtId}, function(err2, removedReminder) {
                if (err2) { return next(err2); }
                if(removedReminder)
                    res.status(200).json({"message" : 'All Reminders are removed'});
                else
                    return res.status(204).json({'message': 'There are no Reminders to remove'});
                
            });
        }
    });
});

module.exports = router;
