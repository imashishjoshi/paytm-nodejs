# paytm-nodejs
A Nodejs wrapper for Paytm Payment Gateway Integration

## Installation

```bash
$ npm install paytm-nodejs --save
```

## Usage

### For Creating Paytm Payment

```js
const paytm = require('paytm-nodejs')

const config = {
	MID : '###############', // Get this from Paytm console
	KEY : '###############', // Get this from Paytm console
	ENV : 'dev', // 'dev' for development, 'prod' for production
	CHANNEL_ID : 'WAP',
	INDUSTRY : 'Retail',  
	WEBSITE : 'Default',
	CALLBACK_URL : 'localhost:8080/paytm/webhook',  // webhook url for verifying payment
}

// your create payment controller function
exports.pay = function(req,res){ 

	let data = {
		TXN_AMOUNT : req.body.amount, // request amount
		ORDER_ID : 'ORDER_123456', // any unique order id 
		CUST_ID : 'CUST_123456' // any unique customer id		
	}

	// create Paytm Payment
	paytm.createPayment(config,data,function(err,data){
		if(err){
			// handle err
		}

		//success will return

		/*{ 
			MID: '###################',
			WEBSITE: 'DEFAULT',
			CHANNEL_ID: 'WAP',
			ORDER_ID: '#########',
			CUST_ID: '#########',
			TXN_AMOUNT: '##',
			CALLBACK_URL: 'localhost:8080/paytm/webhook',
			INDUSTRY_TYPE_ID: 'Retail',
			url: 'https://securegw-stage.paytm.in/order/process',
			checksum: '####################################' 
		}*/

		//store the url and checksum
		let url = data.url;
		let checksum = data.checksum;

		// delete it from data object
		delete data.url;
		delete data.checksum;

		/* Prepare HTML Form and Submit to Paytm */
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.write('<html>');
		res.write('<head>');
		res.write('<title>Merchant Checkout Page</title>');
		res.write('</head>');
		res.write('<body>');
		res.write('<center><h1>Please do not refresh this page...</h1></center>');
		res.write('<form method="post" action="' + url + '" name="paytm_form">');
		for(var x in data){
			res.write('<input type="hidden" name="' + x + '" value="' + data[x] + '">');
		}
		res.write('<input type="hidden" name="CHECKSUMHASH" value="' + checksum + '">');
		res.write('</form>');
		res.write('<script type="text/javascript">');
		res.write('document.paytm_form.submit();');
		res.write('</script>');
		res.write('</body>');
		res.write('</html>');
		res.end();
	});
}
```

### For Validating Paytm Payment

```js
const paytm = require('paytm-nodejs')

const config = {
	MID : '###############', // Get this from Paytm console
	KEY : '###############', // Get this from Paytm console
	ENV : 'dev', // 'dev' for development, 'prod' for production
	CHANNEL_ID : 'WAP',
	INDUSTRY : 'Retail',  
	WEBSITE : 'Default',
	CALLBACK_URL : 'localhost:8080/paytm/webhook',  // webhook url for verifying payment
}

// Webhook controller function
exports.webhook = function(req,res){ 

	paytm.validate(config,req.body,function(err,data){
		if(err){
			// handle err
		}

		if(data.status == 'verified'){
			// mark payment done in your db
		}
	})

}
```

### For Getting Order Status

```js
const paytm = require('paytm-nodejs')

const config = {
	MID : '###############', // Get this from Paytm console
	KEY : '###############', // Get this from Paytm console
	ENV : 'dev', // 'dev' for development, 'prod' for production
	CHANNEL_ID : 'WAP',
	INDUSTRY : 'Retail',  
	WEBSITE : 'Default',
	CALLBACK_URL : 'localhost:8080/paytm/webhook',  // webhook url for verifying payment
}


paytm.status(config,'your_order_id',function(err,data){
	if(err){
	// handle err
	}

	// data will contain order details
});

```


## Licence

MIT

