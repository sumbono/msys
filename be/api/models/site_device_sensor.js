// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Import Models
var { siteDevice } = require('./site_device');
var { Protocol } = require('./master_protocol');

const siteDeviceSensorSchema = new Schema({

  dev_id: {
    type: Number,
    required: true,
    ref: 'siteDevice'
  },
  protocol_id: {
    type: Schema.Types.Mixed, 
    ref: 'Protocol'
  },
  detail: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200
  },
  ipaddress: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  mac_address: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 30
  },
  description: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200
  },
  icon_major: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200
  },
  icon_critical: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200
  },
  icon_normal: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 200
  },
  // lastUpdated: { 
  //   type: Date, 
  //   default: Date.now 
  // },

});

const SiteDeviceSensor = mongoose.model('SiteDeviceSensor', siteDeviceSensorSchema , 'nms_site_device_sensor');

exports.SiteDeviceSensor = SiteDeviceSensor;
