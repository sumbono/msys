// const Joi = require('joi');
const mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Import Site, master Protocol Models
var { Site } = require('./site');
var { DeviceCategory } = require('./master_device_category');
var { Device } = require('./master_device');
var { Protocol } = require('./master_protocol');

const siteDeviceSchema = new Schema({

  dev_id: {
   type: Number
  },
  site_id: { 
    // type: Schema.Types.ObjectId,
    type: Schema.Types.Mixed, 
    ref: 'Site' 
  },
  device_category_id: { 
    // type: Schema.Types.ObjectId,
    type: Schema.Types.Mixed, 
    ref: 'DeviceCategory' 
  },
  device_id: { 
    // type: Schema.Types.ObjectId,
    type: Schema.Types.Mixed, 
    ref: 'Device' 
  },
  protocol_id: {
    // type: Schema.Types.ObjectId,
    type: Schema.Types.Mixed, 
    ref: 'Protocol'
  },
  unit: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 20
  },
  icon_major: {
  type: String
  },
  icon_critical: {
  type: String
  },
  icon_normal: {
  type: String
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  },

});

const SiteDevice = mongoose.model('SiteDevice', siteDeviceSchema, 'nms_site_device');

exports.SiteDevice = SiteDevice ;
