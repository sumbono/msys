// var url     = require('url');
var { UserWeb }  = require('../models/user_web');
const bcrypt = require('bcrypt');

/* Simple version, without validation or sanitation */
exports.user_web_test = async function (req, res) {
    res.send('Greetings from the "User Web" test controller!');
};

/* POST user_web data */
/* the example of body format: name = ..... ; password = ..... */
exports.user_web_create = async function (req, res) {

    let user_web = await UserWeb.findOne({ name: req.body.name || req.query.name });
    if (user_web) {
        return res.status(400).send(`User name: ${user_web.name} already registered.`);
        console.log(`User name: ${user_web.name} already registered.`);
    }

    user_web = new UserWeb({ 
        name: req.body.name || req.query.name,
        password: req.body.password || req.query.password
    });
    
    const salt = await bcrypt.genSalt(10);
    user_web.password = await bcrypt.hash(user_web.password, salt);
    await user_web.save();
    
    res.status(200).send( `User name: ${user_web.name} saved.` );
    console.log(`User name: ${user_web.name} saved.`);

};

/* GET user_web by name */
exports.user_web_name = async function (req, res) {

    let user_web = await UserWeb.findOne({ name: req.body.name || req.query.name });
    if (!user_web) return res.status(404).send(`The User ${ req.body.name || req.query.name } was not found. Register it first!`);
    console.log(`User name: ${user_web.name} was not found.`);
    
    res.status(200).send( user_web.name );
    console.log(`User name: ${user_web.name} found.`);

};

/* AUTHENTICATION User Login */
exports.user_web_auth = async function (req, res) {
    
    let user_web = await UserWeb.findOne({ name: req.body.name || req.query.name });
    if (!user_web) {
        return res.status(400).send('Invalid name or password.');
        console.log(`User name: ${user_web.name} was not found.`);
    }
  
    const validPassword = await bcrypt.compare(req.body.password || req.query.password, user_web.password);
    if (!validPassword) {
        return res.status(400).send('Invalid password.');
        console.log(`Invalid password for user name: ${user_web.name}.`);
    }
    
    res.status(200).send( user_web.name );
    console.log(`Valid password for user name: ${user_web.name}.`);

  };