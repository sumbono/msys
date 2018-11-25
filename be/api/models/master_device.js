// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const deviceSchema = new Schema({

  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  icon_major: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1000
  },
  icon_critical: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1000
  },
  icon_normal: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 1000
  },
  last_updated: { 
    type: Date, 
    default: Date.now 
  },

});

const Device = mongoose.model('Device', deviceSchema, 'nms_m_device');

// function validate(device) {
//   const schema = {
//     name: Joi.string().min(3).required()
//   };

//   return Joi.validate(device, schema);
// }

exports.deviceSchema = deviceSchema ;
exports.Device = Device ; 
// exports.validate = validate;