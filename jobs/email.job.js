var _ = require('lodash');
var Promise = require('bluebird');
var SendgridMustacher = require('sendgrid-mustacher');

module.exports = function(Queue){
	var email = Queue('email');

	email.process(function(job, done){
		return Promise
		.bind(this)
		.then(function(){
		
			if(_.isEmpty(job.data.credentials) || _.isEmpty(job.data.credentials.sendgrid_api_key)){
				throw new TypeError('Sendgrid credentials cannot be empty!');
			}

			if(_.isEmpty(job.data['email'])){
				throw new TypeError('Email data cannot be empty!');
			}

			var sendgrid = new SendgridMustacher(job.data.credentials.sendgrid_api_key);
			var raw = job.data['email'];
			var data = raw['data'];
			job.progress('Running');

			return sendgrid.sendBatch(raw, data);
		})
		.catch(function(err){
			job.progress('Error');
			return done(err);
		})
		.then(function(json){
			job.data.results = { returnable: json, jobId: job.jobId };
			job.progress('Done');
			return done();
		});
	});

	return email;
};
