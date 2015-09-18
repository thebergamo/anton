module.exports = require('./lib/anton');
module.exports.sample = { 
	'jobs': { 
		'email': require('./jobs/email.job') 
	}, 
	'transport': {
		'email': require('./transporter/email') 
	}
};
