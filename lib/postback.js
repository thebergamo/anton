var Promise = require('bluebird');
var Senders = require('./../transporter');
var Postback = function(){};

Postback.prototype.done = function(error, data){
	return new Promise(function(resolve){
		if(!(error instanceof Error)){
			data = error;
			error = null;
		}

		if(!data || data.length == 0 || Object.keys(data).length === 0){
			throw new Error('Postback data cannot be empty');
		}

		return resolve(Senders[data.type](data))
	});
};


module.exports = Postback;
