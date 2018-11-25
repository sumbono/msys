// var insertBatt  = require('../db_config/insertBatt');

// Parsing Data Format: 18;H1=103.71&H2=241.81&H3=321.66&H4=577.234&H5=3079FA;20180704080031

module.exports.parseData = function (data) {
    
    // var minutes = 1000 * 60;
    // var hours = minutes * 60;
    // var days = hours * 24;
    // var years = days * 365;
    var d = new Date(Date.now());

    var timestamp = d.getTime(); //in milisecond.

    // let timestamp = t/1000; //in second.
    
    // var now = new Date(t);

    let dateNow = new Date(Date.now()).toLocaleString();
    // console.log(timestamp);
    
    let Arr = data.split(';');
    console.log(Arr);
    let oneArr = Arr[1].charAt(0);
    let devID = parseInt(Arr[0]);
    
    if (oneArr == "[") {
        console.log('This is Battery Data');

        let keyV = JSON.parse(Arr[1]);
  
        let ObjData = {
            dev_id: devID,
            data: keyV,
            type: "Battery",
            deliveredOn: Arr[2],
            createdOn: dateNow,
            timestamp: timestamp
        };
        
        console.log('========================================');
        console.log('dev_ID: ', devID);
        console.log('data parsed.');
        console.log('========================================');
        
        if ( typeof ObjData.deliveredOn == "undefined" ) {
            return console.error('data sliced.');  
        }else{
            // insertBatt.insertBatt(ObjData);            
             return ObjData;
        }
    } else if (devID === 0) {  
        console.log('This is Status Link');
        let w = Arr[1].split(/[=&]/);
    
        let keyArr =[];
        keyArr[0] = w[0];
        for ( var j=2; j<= w.length-2; j+=2) {
            keyArr.push(w[j]);
        }

        let valArr = [];
        valArr[0] =  w[1];
        for (j=3; j<= w.length; j+=2) {
                valArr.push( w[j] );
        }

        let keyVal = {};
        for (var i=0; i < keyArr.length; i++) {
            keyVal[keyArr[i]] = valArr[i];
        }

        keyVal['createdOn'] = timestamp;
        keyVal['dev_id'] = devID;

        console.log(`data with devID ${devID} parsed.`);
        
        return keyVal;
    }

    console.log('This is not Battery Data');
    
    let w = Arr[1].split(/[=&]/);
    
    let keyArr =[];
    keyArr[0] = w[0];
    for ( var k=2; k<= w.length-2; k+=2) {
        keyArr.push(w[k]);
    }

    let valArr = [];
    valArr[0] = parseFloat( w[1] );
    for (var l=3; l<= w.length; l+=2) {
            valArr.push( parseFloat( w[l] ) );
    }

    let keyVal = {};
    for (var m=0; m < keyArr.length; m++) {
        keyVal[keyArr[m]] = valArr[m];
    }

    // console.log(keyVal);
    // console.log(typeof keyVal);
  
    let Obj = {
        dev_id: devID,
        data: keyVal,
        deliveredOn: Arr[2],
        createdOn: dateNow,
        timestamp: timestamp
    };

    console.log(`data with devID ${devID} parsed.`);
    
    return Obj;
}
