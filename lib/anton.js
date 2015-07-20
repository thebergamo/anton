var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Queue = require('bull');
var Promise = require('bluebird');
var Postback = require('./postback');

var Anton = function(){
	this.jobs = {};	
	this.postback = {};
};

Anton.prototype.loadJobs = function(){
	var self = this;
	var isLoadable = function(name){
		return /\.(js|coffee|ls)$/.test(name);
	};
	var root = path.resolve(__dirname, '..', 'jobs');
	var files = fs.readdirSync(root);
	
	files.forEach(function(file){
		var fullPath = path.join(root, file);
		var stat = fs.lstatSync(fullPath);

		if(stat.isFile() && isLoadable(file)){
			var job = path.basename(file, path.extname(file));
			var jobFn = require(fullPath);
			self.jobs[job] = jobFn(Queue); 
		}
	});

};

Anton.prototype.initialize = function(){
	this.loadJobs();
	this.postback = new Postback();
};

Anton.prototype.createJob = function(type, data){
	return Promise
	.bind(this)
	.then(function(){
		if(_.isEmpty(type)){
			throw new TypeError('Job cannot be empty!');
		}
		if(!this.jobs[type]){
			throw new ReferenceError('Job type: '+type+' is unavailable');
		}

		if(_.isEmpty(data)){
			throw new TypeError('Data cannot be empty!');
		}

		this.jobs[type].on('completed', function(job){
			console.log('done', job.jobId);
			data['postback']['results'] = job.data.results;
			this.postback.done(data['postback']);
		});

		this.jobs[type].on('failed', function(job, error){
			console.log('failed', job.jobId);
			console.log(error.stack);
			job.isCompleted();
			data['postback']['raw'] = job.data;
			this.postback.done(error, data['postback']);
		});

		return this.jobs[type].add(data);
	});
};

Anton.prototype.deleteJob = function(type, id){
	return this.jobs[type].getJob(id)
	.bind(this)
	.then(function(job){
		if(!job){
			console.log(job);
			throw new TypeError('Job not found.')
		}

		return job.remove();
	});
};

Anton.prototype.clearJobs = function(queueId){
	if(!queueId){
		throw new TypeError('You must set an Queue for clear jobs');
	}

	return this.jobs[queueId].clean(5000)
	.bind(this)
	.then(function(jobs){
		return jobs;
	});

};

global.Anton = Anton;
module.exports = Anton;
