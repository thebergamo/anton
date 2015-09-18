var Promise = require('bluebird');
var Postback = function(anton){
	this.anton = anton;
};

Postback.prototype.done = function(error, data){
	var Senders = this.anton.transports;
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
