var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var Queue = require('bull');
var Promise = require('bluebird');
var Postback = require('./postback');

var Anton = function(){
	this.tasks = {};	
	this.transports = {};
	this.postback = new Postback(this);
};

Anton.prototype.loadTask = function(task) {
	if(_.isUndefined(task)) {
		throw new TypeError('A task must be sended.');
	}
	var queue = task(Queue);

	this.tasks[queue.name] = queue;	

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
		if(!this.tasks[type]){
			throw new ReferenceError('Task type: '+type+' is unavailable');
		}

		if(_.isEmpty(data)){
			throw new TypeError('Data cannot be empty!');
		}

		this.tasks[type].on('completed', function(job){
			data['postback']['results'] = job.data.results;
			this.postback.done(data['postback']);
		});

		this.tasks[type].on('failed', function(job, error){
			console.log('failed', job.jobId);
			console.log(error.stack);
			job.isCompleted();
			data['postback']['raw'] = job.data;
			this.postback.done(error, data['postback']);
		});

		return this.tasks[type].add(data);
	});
};

Anton.prototype.deleteJob = function(type, id){
	return this.tasks[type].getJob(id)
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

	return this.tasks[queueId].clean(5000)
	.bind(this)
	.then(function(jobs){
		return jobs;
	});
};

module.exports = Anton;
