 'use strict';

 /**
 * Module dependencies
 */
 const request= require('request'),
 checksum_lib = require('./lib/checksum');


/**
 * Create Payment
 */
 exports.createPayment = (config,obj,callback) => {

 	let paytmParams = {
 		"MID" : config.mid,
 		"WEBSITE" : obj.WEBSITE || 'DEFAULT',
 		"CHANNEL_ID" : obj.CHANNEL_ID || 'WAP',
 		"ORDER_ID" : obj.ORDER_ID || 'ORDER_'  + new Date().getTime(),
 		"CUST_ID" : obj.CUST_ID || 'CUST_'  + new Date().getTime(),
 		"TXN_AMOUNT" : obj.TXN_AMOUNT.toString(),
 		"CALLBACK_URL" : obj.CALLBACK_URL,
 		"INDUSTRY_TYPE_ID": obj.INDUSTRY || 'Retail',
 	};


 	checksum_lib.genchecksum(paytmParams, config.key, (err, checksum)=>{

 		if(err)
 			return callback(err);

 		if(config.env == 'prod'){
 			paytmParams.url = 'https://securegw.paytm.in/order/process'
 		}else{
 			paytmParams.url = 'https://securegw-stage.paytm.in/order/process'
 		}

 		paytmParams.checksum = checksum;

 		callback(null,paytmParams);
 	});
 };

/**
 * Validate Webhook Post Data
 */
 exports.validate = (config,data,callback) =>{
 	let paytmChecksum = "";

 	let paytmParams = {};
 	for(let key in data){
 		if(key == "CHECKSUMHASH") {
 			paytmChecksum = data[key];
 		} else {
 			paytmParams[key] = data[key];
 		}
 	}

 	let isValidChecksum = checksum_lib.verifychecksum(paytmParams, config.key, paytmChecksum);

 	if(isValidChecksum) {
 		callback(null, { status : 'verified'})
 	}else{
 		callback('Checksum Mismatched');
 	}
 };


/**
 * Check Order Payment Status
 */
 exports.status = (config,data,callback) => {

 	checksum_lib.genchecksum({ 'MID' : config.mid, 'ORDERID' : data },config.key, (err, checksum) =>{

 		let post_data = {
 			MID:config.mid,
 			ORDERID:data,
 			CHECKSUMHASH: checksum
 		};

 		let url = '';

 		if(config.env == 'prod'){
 			url = 'https://securegw.paytm.in/order/status'
 		}else{
 			url = 'https://securegw-stage.paytm.in/order/status'
 		}

 		request.post({
 			url: url,
 			body: post_data,
 			json: true
 		}, (err , response, body) =>{
 			if(err)	return callback(err);
 			
 			callback(null,body);
 			
 		});
 	});

 };