/*eslint-env mocha */

var expect = require('chai').expect;
var Postback = require('../lib/postback');

var postback = new Postback();

describe('Postback module', function(){
	describe('#constructor()', function(){
		it('should be a function', function(){
			expect(Postback).to.be.a('function');
		});
	});

	describe('#instance()', function(){
		it('should be an object', function(){
			expect(postback).to.be.an('object');
		});
	
		it('should have a function done', function(){
			expect(postback.done).to.be.an('function');
		});
	});

	describe('#done()', function(){
		describe('should throw an error when data is empty', function(){
			var error;
			before(function(){
				postback.done()
				.catch(function(err){
					error = err;
				});
			});

			it('should return be an error', function(){
				expect(error).to.be.instanceof(Error);
			});

			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Postback data cannot be empty');
			});
		});

		describe('should throw an error when data is an empty array', function(){
			var error;
			before(function(){
				postback.done([])
				.catch(function(err){
					error = err;
				});
			});

			it('should return be an error', function(){
				expect(error).to.be.instanceof(Error);
			});

			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Postback data cannot be empty');
			});
		});

		describe('should throw an error when data is an empty object', function(){
			var error;
			before(function(){
				postback.done({})
				.catch(function(err){
					error = err;
				});
			});

			it('should return be an error', function(){
				expect(error).to.be.instanceof(Error);
			});

			it('should error have the correct message', function(){
				expect(error.message).to.be.eql('Postback data cannot be empty');
			});
		});

		describe('should return a json with status', function(){
			var json;
			before(function(){
				var data = {
					results: {
						returnable: [{ message: 'success'}],
						jobId: 1
					},
					to: ['marcos@thedon.com.br'],
					type: 'email'
				};

				return postback.done(data)
				.then(function(ret){
					json = ret;
				});
			});

			it('should json must be an array', function(){
				expect(json).to.be.an('array');
			});

			it('should json have the correct properties', function(){
				expect(json).to.have.length.least(1);
				expect(json[0]).to.have.property('message', 'success');
				expect(json[0]).to.have.property('email', 'marcos@thedon.com.br');
			});
		
		});
	});
	
});
