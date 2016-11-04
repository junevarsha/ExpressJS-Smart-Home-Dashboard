var express = require('express'),
mongoose = require('mongoose'),
bodyParser = require('body-parser'),
port = 4000,
router = express.Router(),
app = express(),
schema = mongoose.Schema;
app.use(bodyParser());
mongoose.connect('mongodb://localhost:27017/newSensor');

var ObjectId =  require('mongodb').ObjectId;

//Creating a mongoose schema
var userSchema = mongoose.Schema({
    _id: {type: String, required:true},
    name: String,
    created_at :{type:Date, default:Date.now},
    sensors: [{
        sensor_name: {type: String, required:true},
        measurements: [{value:{type:String}, time:{type : Date, default : Date.now }}],
        u_id: {type: String}
    }] 
});

// GET

//Creating a mongoose model for the schema
var User = mongoose.model('User', userSchema);
//GET and POST to mongodb
router.route('/')
.get(function (req, res) {
    res.send("Welcome to Express JS App");
    });
 
router.route('/sensors')
.get(function (req, res) {
        User.find(function(err, newSensor) {
            if (err)
                res.send(err);
            res.send(newSensor);
        });
    });

router.route('/sensors/:_id')
.get(function (req, res) {
        User.findOne({_id : req.params._id} ,function(err, newSensor) {
            if (err)
                res.send(err);
            res.send(newSensor);
        });
    });

router.route('/recent_sensors/')
.get(function (req, res) {
    User.find().sort({$natural: -1}).limit(5).find(function(err, newSensor){
        if(err)
            res.send(err);
        res.send(newSensor);
    });
    });


// STEP - 1
// POST : Creating a new user with _id, name and empty sensor array.
// INPUT : _id and name
router.route('/sensors/')
.post(function (req, res) {
console.log("Posting user id and user name")
var user = new User();
user._id = req.body._id;
user.name = req.body.name;
//save the info
user.save(function(err) {
if (err)
  res.send(err);
res.send({message: "User Info created"});
 });
});

// STEP - 2
// PUT : Update sensors array with sensor name and empty measurments array
// INPUT : _id and sensor_name
router.route('/sensors/:_id/')
.put(function (req, res) {
console.log("inside put sensor update")
User.findOneAndUpdate({_id:req.params._id, sensors: {$nin: [{sensor_name:req.body.sensor_name}]}}, {$push: {"sensors":{sensor_name :req.body.sensor_name, measurements:[], u_id:req.params._id } } },{upsert:true,new:true},function(err, newSensor) {
if (err)
    res.send(err);
res.send(newSensor)
});
});

// STEP - 3
// PUT : Update timestamp and value in the measurements array
// INPUT : _id, sensor_name and value
router.route('/sensors/:_id/:sensor_name/')
.put(function (req, res) {
console.log("inside put of mesh")
User.findOneAndUpdate({_id:req.params._id, "sensors.sensor_name":req.params.sensor_name}, {$push: {"sensors.$.measurements": { value:req.body.value } } },function(err, newSensor) {
if (err)
    res.send(err);
res.send(newSensor)
});
});

// STEP - 4
// PUT : Update name
// INPUT : _id and name
router.route('/update_name/:_id/')
.put(function (req, res) {
User.findOneAndUpdate({_id:req.param._id}, {$set: {name: req.body.name} },function(err, newSensor) {
if (err)
    res.send(err);
res.send(newSensor)
});
});

// DELETE
router.route('/sensors/:_id')
.delete(function (req, res) {
        User.remove({_id : req.params._id} ,function(err, newSensor) {
            if (err)
                res.send(err);
            res.send({message: 'Successfully deleted'});
        });
    });

app.use('/',router);
app.listen(port); 