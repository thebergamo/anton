# anton2
[![Build Status](https://travis-ci.org/antonproject/anton.svg)](https://travis-ci.org/antonproject/anton) [![Coverage Status](https://coveralls.io/repos/antonproject/anton/badge.svg?branch=master)](https://coveralls.io/r/antonproject/anton?branch=master)

Anton is designed to help you to process hard jobs made easy =D

##Instalation

```javascript
npm install anton2
```

##How it works
Anton is a queue manager build on top of [bull](https://npmjs.com/bull) that simplify the way to process hard jobs. The lifecycle in Anton is:

- Register your tasks.
- Register your transporters.
- Create your jobs.
- Send postback 

After the bootstrap of Anton(loading tasks and transporters) you can create your jobs.
When the jobs is done, with errors or not, the postback is called and notify you about the result of the job.

##How to use

```javascript
var Anton = require('anton2');
var emailJob = Anton.sample.tasks.email; // Load a simple job that send emails in batch.
var transporter = Anton.sample.transport.email; // Load a simple transport for the postback information about the jobs finished. On this case send to your email.

var anton = new Anton();

//One time the jobs and transporters are loaded its loaded in memory every time.

anton
.loadTask(emailJob)
.loadTransporter(transporter)
.createJob('email.job', {
	email: {
		subject: 'Just a simple test',
		from: 'noreply@antonproj.org',
		text: 'Hello {{name}}',
		html: '<html><body>Hello {{name}}</body></html>',
		data: [{ 
			to: 'marcos@thedon.com.br', 
			name: 'Marcos'
		}]
	},
	credentials: {
		sendgrid_api_key: process.env.SENDGRID_API_KEY
	}
});

// you can listen for jobs in the queue.
anton.jobs['email.job'].on('completed', function(job){
	console.log(job.jobId, 'is complete');
});

anton.jobs['email.job'].on('failed', function(job, error){
	console.log(job.jobId, 'is failed', error);
});

```

##Public Methods

###loadTask(task) -> this
The task need be a function that will receive a Task object to create a new taskQueue. Redis connection information will be setted in the task function. See more in [this example](https://github.com/antonproject/anton/blob/master/task/email.job.js)

###loadTransporter(transporter) - this
The transporter need be a function that will receibe a data object with the information about the job results(data.results) and send to anywhere you must be! See more in [this example](https://github.com/antonproject/anton/blob/master/transporter/email.js)

###createJobs(type, data) -> Promise
Both type and data are required to create an job. The return is a promise with a job object where you can find the jobId.

###deleteJob(type, id) -> Promise
Both type and id are required to delete a job. The return will be a promise with the job object of the removed job.

###clearJobs(taskName) -> Promise
taskName is required to identify the right task and clear the jobs errored with least 5 seconds. The return will be a list with the removed jobs.

##Contribuing
All help is very welcomed! Just send a [Pull Requests](https://github.com/antonproject/anton/pulls) or open an [Issue](https://github.com/antonproject/anton/issues)
