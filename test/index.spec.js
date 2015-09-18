/*eslint-env mocha */

var expect = require('chai').expect;
var Anton = require('../lib/anton');
var Postback = require('../lib/postback');
var emailJob = require('../jobs/email.job');

// Create a new instance of Anton
var anton = new Anton();

describe('Anton module', function(){
	describe('#constructor()', function(){
		it('should be a function', function(){
			expect(Anton).to.be.a('function');
		});
	});

	describe('#instance()', function(){
		it('should be an object', function(){
			expect(anton).to.be.an('object');
		});

		it('should initialize an empty tasks object', function(){
			expect(anton).to.have.property('tasks');
			expect(anton.tasks).to.be.an('object');
			expect(anton.tasks).to.be.empty;
		});


		it('should initialize an empty postack object', function(){
			expect(anton).to.have.property('postback');
			expect(anton.postback).to.be.an('object');
		});
	});

	describe('#createJob()', function(){
		describe('should throw an ReferenceError if the job is not available', function(){
			var error;
			before(function(done){
				anton.createJob('coffee.job', {})
				.catch(function(err){
					error = err;
				})
				.finally(done);
			});

			it('should error is an Reference error', function(){
				expect(error).to.be.instanceof(ReferenceError);
			});
			
			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Task type: coffee.job is unavailable');
			});
		});

		describe('should throw an TypeError if the job is empty', function(){
			var error;
			before(function(done){
				anton.createJob()
				.catch(function(err){
					error = err;
				})
				.finally(done);
			});

			it('should error is an TypeError', function(){
				expect(error).to.be.instanceof(TypeError);
			});
			
			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Job cannot be empty!');
			});
		});
		
		describe('should throw an TypeError if the data is undefined', function(){
			var error;
			before(function(done){
				anton
				.loadTask(emailJob)
				.createJob('email.job')
				.catch(function(err){
					error = err;
				})
				.finally(done);
			});

			it('should error is an TypeError', function(){
				expect(error).to.be.instanceof(TypeError);
			});
			
			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Data cannot be empty!');
			});
		});

		describe('should throw an TypeError if the data is empty', function(){
			var error;
			before(function(done){
				anton.createJob('email.job', {})
				.catch(function(err){
					error = err;
				})
				.finally(done);
			});

			it('should error is an TypeError', function(){
				expect(error).to.be.instanceof(TypeError);
			});
			
			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Data cannot be empty!');
			});
		});

		describe('should job failed when no credentials are sent', function(){
			var error;
			before(function(done){
				anton.clearJobs('email.job');
				anton.tasks['email.job'].removeAllListeners();
				anton.tasks['email.job'].on('failed', function(job, err){
					error = err;
					return done();
				});
				anton.createJob('email.job', {email: {}});
				
			});

			it('should error is an Type error', function(){
				expect(error).to.be.instanceof(TypeError);
			});
			
			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Sendgrid credentials cannot be empty!');
			});
		});

		describe('should job failed when no email data are sent', function(){
			var error;
			before(function(done){
				anton.clearJobs('email.job');
				anton.tasks['email.job'].removeAllListeners();
				anton.tasks['email.job'].on('failed', function(job, err){
					error = err;
					return done();
				});
				anton.createJob('email.job', {credentials: { sendgrid_api_key: '11'}});
				
			});

			it('should error is an Type error', function(){
				expect(error).to.be.instanceof(TypeError);
			});
			
			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Email data cannot be empty!');
			});
		});

		describe('should job are completed', function(){
			var result;
			before(function(done){
				anton.clearJobs('email.job');
				anton.tasks['email.job'].removeAllListeners();
				anton.tasks['email.job'].on('completed', function(job){
					result = job.data.results;	
					return done();
				});	

				anton.createJob('email.job', {
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
			});	

			it('should results are an object', function(){
				expect(result).to.be.an('object');
			});

			it('should result have the correct response', function(){
				expect(result).to.have.property('returnable');
				expect(result.returnable).to.be.an('array');
				expect(result.returnable).to.have.length.least(1);
				expect(result.returnable[0]).to.have.property('message');
				expect(result.returnable[0].message).to.be.eql('success');
				expect(result.returnable[0]).to.have.property('email');
				expect(result.returnable[0].email).to.be.eql('marcos@thedon.com.br');
			});
		});
	});

	describe('#deleteJob()', function(){
		describe('when a job not found', function(){
			var error;
			before(function(){
				return anton.deleteJob('email.job', 12)
				.catch(function(err){
					error = err;
				});
			})


			it('should error is an Type error', function(){
				expect(error).to.be.instanceof(TypeError);
			});
			
			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Job not found.');
			});
		});

		describe('when a job are deleted', function(){
			var id, retId;
			before(function(done){
				anton.clearJobs('email.job');
				anton.tasks['email.job'].removeAllListeners();
				anton.tasks['email.job'].on('removed', function(job){
					retId = job.jobId;
					return done();
				});
				anton.createJob('email.job', {
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
				})
				.then(function(job){
					id = job.jobId;
					anton.deleteJob('email.job', id);
				});
			});

			it('should returned job have the same Id', function(){
				expect(retId).to.be.eql(id);
			});
		});
	});
});
