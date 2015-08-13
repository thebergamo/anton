var _ = require('lodash');
var SendgridMustacher = require('sendgrid-mustacher');

module.exports = function(data){
	var sendgrid = new SendgridMustacher(process.env.SENDGRID_API_KEY);
	
	var raw = {
		subject: '[antonproj] Status of your job',
		from: 'noreply@antonproj.com',
		text: 'Your job#{{jobId}} status: success: {{success}} / failed: {{failed}} {{#msg}} {{.}} {{/msg}}',
		html: '<html><body>Your job#{{jobId}} status: success: {{success}} / failed: {{failed}} {{#msg}} {{.}} {{/msg}}</body></html>'
	};

	var emailData = _.map(data.to, function(email){
		var success = _.sum(_.filter(data.results.returnable, 'message', 'success'), function(){ return 1; });
		var failed = _.sum(_.filter(data.results.returnable, 'message', 'error'), function(){ return 1; });
		var msg;

		if(failed !== 0) {
			msg = _.flatten(_.pluck(_.where(data.results.returnable, {message: 'error'}), 'errors'));
		}

		return {
			to: email,
			success: success,
			failed: failed,
			msg: msg,
			jobId: data.results.jobId
		};
	});

	return sendgrid.sendBatch(raw, emailData);
};
