module.exports = function(Queue){
	email = Queue('email');

	email.process(function(job, done){
		var mustache = require('mustache');
		var sendgrid = require('sendgrid')(job.data.credentials.sendgrid_api_key);

		job.progress('Running');
		
		var to = job.data['to'] || [];
		if(!to || to.length == 0){
			throw new TypeError('You must sent least one email to delivery');
		}

		var from = job.data['from'] || 'no-reply@antonproj.com';
		var subject = job.data['subject'] || "";
		var template = job.data['template'];
		var data = job.data['data'];

		if(!template || template.length == 0){
			throw new TypeError('You must sent email template');
		}

		mustache.parse(template);
		var rendered = mustache.render(template, data);
		
		console.log(rendered);

		var myEmail = new sendgrid.Email({
			to: to,
			from: from,
			subject: subject,
			text: rendered
		});

		sendgrid.send(myEmail, function(err, json){
			if(err){
				throw err;	
			}

			job.data.results = { returnable: json };
			job.progress('Done');
			done();
		});

	});

	return email;
};
