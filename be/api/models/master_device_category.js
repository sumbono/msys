// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const deviceCategorySchema = new Schema({

  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 500
  },
  last_updated: { 
    type: Date, 
    default: Date.now 
  },

});

const DeviceCategory = mongoose.model('DeviceCategory', deviceCategorySchema, 'nms_m_device_category');

// function validate(device) {
//   const schema = {
//     name: Joi.string().min(3).required()
//   };

//   return Joi.validate(device, schema);
// }

exports.deviceCategorySchema = deviceCategorySchema ;
exports.DeviceCategory = DeviceCategory ; 
// exports.validate = validate;