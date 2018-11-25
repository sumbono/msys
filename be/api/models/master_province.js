// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const provinceSchema = new Schema({

  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 500
  },
  // lastUpdated: { 
  //   type: Date, 
  //   default: Date.now 
  // },

});

const Province = mongoose.model('Province', provinceSchema, 'nms_m_province');

// function validate(province) {
//   const schema = {
//     name: Joi.string().min(5).required()
//   };

//   return Joi.validate(province, schema);
// }

exports.provinceSchema = provinceSchema ;
exports.Province = Province ; 
// exports.validate = validate;