// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Import Device Models
var {Device} = require('./master_device');

const protocolSchema = new Schema({
  
  device_id: { 
    // type: Schema.Types.ObjectId,
    type: Schema.Types.Mixed, 
    ref: 'Device' 
  },
  sensor: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 500
  },
  protocol: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },
  
});

const Protocol = mongoose.model('Protocol', protocolSchema, 'nms_m_protocol');

exports.protocolSchema = protocolSchema ;
exports.Protocol = Protocol ;
