var Anton = require('./lib/anton');

var anton = new Anton();

anton.initialize();

console.log('creating a job');
anton.createJob('email.job', {email: 'marcos@thedon.com', postback: {type: 'email', data:['marcos@thedon.com', 'marcos@thedon.com.br']}});
anton.createJob('email.job', {email: 'mark@thedon.com.br', postback: {type: 'url', data:['http://example.com/postback']}});
//anton.clearJobs('email.job');
