var _ = require('lodash');
var Promise = require('bluebird');
var SendgridMustacher = require('sendgrid-mustacher');

module.exports = function(Queue){
	var email = Queue('email');

	email.process(function(job, done){
		var sendgrid = new SendgridMustacher(job.data.credentials.sendgrid_api_key);
		var raw = job.data['email'];
		var data = raw['data'];
		console.log(raw);
		job.progress('Running');

		return Promise
		.bind(this)
		.then(function(){
			return sendgrid.sendBatch(raw, data);
		})
		.then(function(json){
			job.data.results = { returnable: json};
			job.progress('Done');
		})
		.finally(done);
	});

	return email;
};
