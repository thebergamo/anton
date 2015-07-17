var expect = require('chai').expect;
var Promise = require('bluebird');
var Anton = require('../lib/anton');
var Postback = require('../lib/postback');

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

		it('should initialize an empty job object', function(){
			expect(anton).to.have.property('jobs');
			expect(anton.jobs).to.be.an('object');
			expect(anton.jobs).to.be.empty;
		});


		it('should initialize an empty postack object', function(){
			expect(anton).to.have.property('postback');
			expect(anton.jobs).to.be.an('object');
			expect(anton.jobs).to.be.empty;
		});
	});

	describe('#initialize()', function(){
		before(function(){
			return anton.initialize();
		});

		it('should jobs are loaded', function(){
			expect(anton.jobs).to.not.be.empty;
		});

		it('should postback are instanciated', function(){
			expect(anton).to.have.property('postback');
			expect(anton.postback).to.be.an.instanceof(Postback);
		});
	});


	describe('#createJob', function(){
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
				expect(error.message).to.be.eql('Job type: coffee.job is unavailable');
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
				anton.createJob('email.job')
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
				anton.jobs['email.job'].removeAllListeners();
				anton.jobs['email.job'].on('failed', function(job, err){
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
				anton.jobs['email.job'].removeAllListeners();
				anton.jobs['email.job'].on('failed', function(job, err){
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
				anton.jobs['email.job'].removeAllListeners();
				anton.jobs['email.job'].on('completed', function(job){
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
						sendgrid_api_key: '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'
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


});
