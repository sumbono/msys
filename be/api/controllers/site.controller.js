// Import Models
var { Site }  = require('../models/site');
var { Region } = require('../models/master_region');
var { Province } = require('../models/master_province');

/* Simple version, without validation or sanitation */
exports.site_test = async function (req, res) {
    res.send('Greetings from the "Site" test controller!');
};

/* POST site data */
/* the example of body format: name = SQUASH */
exports.site_create = async function (req, res) {

    let last_updated = new Date(Date.now()).toLocaleString();

    // const { error } = validate(req.body); 
    // if (error) return res.status(400).send(error.details[0].message);
    
    // GET region_id from Region:
    let region_name = req.body.region;
    let province_name = req.body.province;

    // GET region_id from Region:
    Region.find({ name: region_name }, async (err, region) => {

        if(err){
            console.log("not connected to Region collection.");
          }else {
            let reg_id = region[0];
            if (!reg_id) {
                res.status(404).send(`The ${region_name} was not found on Region collection. Register this Region first!`);
            } else {
                console.log(`get data ${region_name} from Region collection.`);
                console.log(region[0]._id );

                // GET province_id from Province:
                Province.find({ name: province_name }, async (err, province) => {
                    if(err){
                        console.log("not connected to Province collection.");
                    }else {
                        let prov_id = province[0];
                        if (!prov_id) {
                            res.status(404).send(`The ${province_name} was not found on Province collection. Register this Province first!`);
                        } else {
                            console.log(`get data ${province_name} from Province collection.`);
                            console.log(province[0]._id );

                            let site = new Site({ 
                                region_id: region[0],
                                province_id: province[0],
                                name: req.body.name,
                                kst_name: req.body.kst_name,
                                address: req.body.address,
                                latlng: req.body.latlng,
                                picture: req.body.picture,
                                last_updated: last_updated, 
                            });
                            site = await site.save();
                            res.send(site);
                            console.log(`Site name: ${req.body.name} in Region: ${region[0].name} & Province: ${province[0].name} was created.`);
                        
                            // site = await site.save( function(error) {
                            //     if (!error) {
                            //         Site.find({ name: req.body.name })
                            //             .populate('Region')
                            //             .populate('Province')
                            //             .exec(function(error, posts) {
                            //                 console.log(JSON.stringify(posts, null, "\t"));
                            //                 res.send(posts);
                            //             })
                            //     }
                            // });
                        }

                    }

                });
            }

          }
    });

};

/* GET all site */
exports.site_all = async function (req, res) {

    let site = await Site.find();
    if (!site) return res.status(404).send('The site was not created.');
    console.log(`Site information was sent.`);
    
    res.send(site);

};

/* GET site by name */
exports.site_name = async function (req, res) {
    let sitename = req.query.name || req.body.name ;

    // let site = await Site.find();
    Site.find({ name: sitename })
        .populate('Region')
        .populate('Province')
        .exec(function(error, posts) {
            // console.log(JSON.stringify(posts, null, "\t"));
            if (error) {
                return res.status(404).send('The site was not created.');
            }else {
                res.send(posts);
                console.log(`Site ${ sitename } information was sent.`);
            }
        })
    
    // res.send(site);

};