var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Queue = require('bull');
var Promise = require('bluebird');
var Postback = require('./postback');

var Anton = function(){
	this.jobs = {};	
	this.transports = {};
	this.postback = new Postback(this);
};

Anton.prototype.loadJob = function(job) {
	if(_.isUndefined(job)) {
		throw new TypeError('A job must be sended.');
	}
	var queue = job(Queue);

	this.jobs[queue.name] = queue;	

	return this;
}

Anton.prototype.loadTransport = function(type, transport) {
	if(_.isUndefined(type)){
		throw new TypeError('A type of transport must be sended.');
	}

	if(_.isUndefined(transport)){
		throw new TypeError('A transport must be sended.');
	}

	this.transports[type] = transport;
	return this;
}

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
	.catch(function(err){
		//TODO workarond;
	})
	.then(function(job){
		if(!job){
			throw new TypeError('Job not found.')
		}

		return job.remove();
	});
};

Anton.prototype.clearJobs = function(queueId){
	if(_.isUndefined(queueId)){
		throw new TypeError('You must set an Queue for clear jobs');
	}

	return this.jobs[queueId].clean(5000)
	.bind(this)
	.then(function(jobs){
		return jobs;
	});
};

module.exports = Anton;
