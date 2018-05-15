var request = require('request');
var expect = require('chai').expect;

describe('server', function() {
  it('should respond to GET requests for /classes/messages with a 200 status code', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });
  });

  it('should send back parsable stringified JSON', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      expect(JSON.parse.bind(this, body)).to.not.throw();
      done();
    });
  });

  it('should send back an object', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      done();
    });
  });

  it('should send an object containing a `results` array', function(done) {
    request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
      var parsedBody = JSON.parse(body);
      expect(parsedBody).to.be.an('object');
      expect(parsedBody.results).to.be.an('array');
      done();
    });
  });

  it('should accept POST requests to /classes/messages', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        text: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
      expect(response.statusCode).to.equal(201);
      done();
    });
  });

  it('should respond with messages that were previously posted', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jono',
        text: 'Do my bidding!'}
    };

    request(requestParams, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:
      request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
        var messages = JSON.parse(body).results;
        // console.log(JSON.parse(body));
        expect(messages[0].username).to.equal('Jono');
        expect(messages[0].text).to.equal('Do my bidding!');
        done();
      });
    });
  });

  it('Should 404 when asked for a nonexistent endpoint', function(done) {
    request('http://127.0.0.1:3000/arglebargle', function(error, response, body) {
      expect(response.statusCode).to.equal(404);
      done();
    });
  });

  it('should respond to OPTIONS requests for /classes/messages with a 200 status code', function(done) {
    var requestParams = {method: 'OPTIONS',
      uri: 'http://127.0.0.1:3000/classes/messages',
    }; 
    
    request(requestParams, function(error, response, body) {
      expect(response.statusCode).to.equal(200);
      done();
    });   
  });

  it('should delete message if it is found on the server and return 200 status code', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Mac',
        text: 'Read documentation!'}
    };

    request(requestParams, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:
      var deleteParams = {method: 'DELETE',
        uri: 'http://127.0.0.1:3000/classes/messages',
        json: {
          username: 'Mac',
          text: 'Read documentation!'
        }
      };

      request(deleteParams, function(error, response, body) {
        // console.log(response);
        expect(response.statusCode).to.equal(200);
        done();
      });
    });
  });

  it('should return 204 status code if delete request message is not found on the server', function(done) {
    var requestParams = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jon',
        text: 'Read documentation!'}
    };

    request(requestParams, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:
      var deleteParams = {method: 'DELETE',
        uri: 'http://127.0.0.1:3000/classes/messages',
        json: {
          username: 'Mac',
          text: 'Read documentation!'
        }
      };

      request(deleteParams, function(error, response, body) {
        // console.log(response);
        expect(response.statusCode).to.equal(204);
        done();
      });
    });
  });

  it('should be able to store duplicate messages on the server', function(done) {
    var requestParams1 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jon',
        text: 'Read documentation!',
        timestamp: '3:40PM'}
    };

    var requestParams2 = {method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/messages',
      json: {
        username: 'Jon',
        text: 'Read documentation!',
        timestamp: '3:41PM'}
    };
    
    request(requestParams1, function(error, response, body) {
      // Now if we request the log, that message we posted should be there:

      request(requestParams2, function(error, response, body) {
        // console.log(response);
        request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
          var messages = JSON.parse(body).results;
          console.log(JSON.stringify(messages));
          expect(messages[0].username).to.equal(messages[1].username);
          expect(messages[0].text).to.equal(messages[1].text);
          done();
        });
      });
    });
  });
});
