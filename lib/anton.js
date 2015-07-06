var fs = require('fs');
var path = require('path');
var Queue = require('bull');
var Promise = require('bluebird');
var Postback = require('./postback');

var Anton = function(){
	this.jobs = {};	
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
	if(!this.jobs[type]){
		throw new ReferenceError('Job type: '+type+' is unavailabe');
	}

	var self = this;

	this.jobs[type].add(data)
	.then(function(job){
		console.log(job.jobId);
	});

	this.jobs[type].on('completed', function(job){
		console.log('done', job.jobId);
		data['postback']['results'] = job.data.results;
		self.postback.done(data['postback'])
		.catch(function(err){
			console.log(err);	
		});
	});

	this.jobs[type].on('failed', function(job, error){
		console.log('failed', job.jobId);
		job.isCompleted();
		data['postback']['raw'] = job.data;
		self.postback.done(error, data['postback'])
		.catch(function(err){
			console.log(err);
		});
	});
};

Anton.prototype.deleteJob = function(type, id){
	this.jobs[type].getJob(id)
	.then(function(job){
		if(!job){
			return Promise.resolve();
		}

		return job.remove();
	})
	.finally(function(){
		this.postback.done();
	});
};

Anton.prototype.clearJobs = function(queueId){
	if(!queueId){
		throw new TypeError('You must set an Queue for clear jobs');
	}

	return this.jobs[queueId].clean(5000)
	.then(function(jobs){
		console.log(jobs);
	});

};

global.Anton = Anton;
module.exports = Anton;
