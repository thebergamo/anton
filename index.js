module.exports = require('./lib/anton');
module.exports.sample = { 
	'tasks': { 
		'email': require('./tasks/email.job') 
	}, 
	'transport': {
		'email': require('./transporter/email') 
	}
};
