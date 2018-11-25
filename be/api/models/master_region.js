// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const regionSchema = new Schema({

  // _id: Schema.Types.ObjectId,
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 25
  },
  // lastUpdated: { 
  //   type: Date, 
  //   default: Date.now 
  // },

});

const Region = mongoose.model('Region', regionSchema, 'nms_m_region');

// function validateRegion(region) {
//   const schema = {
//     name: Joi.string().min(3).required()
//   };

//   return Joi.validate(region, schema);
// }

exports.regionSchema = regionSchema;
exports.Region = Region; 
// exports.validateRegion = validateRegion;