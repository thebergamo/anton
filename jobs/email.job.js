module.exports = function(Queue){
	email = Queue('email');

	email.process(function(job, done){
		if(job.data.email == 'marcos@thedon.com.br'){
			job.progress('Error');
			done(new TypeError('Holy shit!'));
		}

		job.progress('Email are sent');
		job.data.results = {
			returnable: 'All emails are sent'
		};

		setTimeout(done, 1000);
	});

	return email;
};
