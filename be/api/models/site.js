// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Import Region & Province Models
var {Region} = require( './master_region' );
var {Province} = require( './master_province' );

const siteSchema = new Schema({

  // _id: Schema.Types.ObjectId,
  region_id: { 
    // type: Schema.Types.ObjectId,
    type: Schema.Types.Mixed, 
    ref: 'Region'
    // ref: Region 
  },
  province_id: { 
    // type: Schema.Types.ObjectId,
    type: Schema.Types.Mixed, 
    ref: 'Province'
    // ref: Province 
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  kst_name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 150
  },
  address: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 1000
  },
  latlng: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  },
  picture: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 500
  },
  // last_updated: { 
  //   type: String 
  // },
  last_updated: { 
    type: Date, 
    default: Date.now 
  },

});

const Site = mongoose.model('Site', siteSchema, 'nms_site');

// function validateRegion(region) {
//   const schema = {
//     name: Joi.string().min(3).required()
//   };

//   return Joi.validate(region, schema);
// }

exports.siteSchema = siteSchema ;
exports.Site = Site ; 
// exports.validate = validateRegion;