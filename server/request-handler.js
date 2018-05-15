/*************************************************************

You should implement your request handler function in this file.

requestHandler is already getting passed to http.createServer()
in basic-server.js, but it won't work as is.

You'll have to figure out a way to export this function from
this file and include it in basic-server.js so that it actually works.

*Hint* Check out the node module documentation at http://nodejs.org/api/modules.html.

**************************************************************/

var storageObj = {};

var defaultCorsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept',
  'access-control-max-age': 10 // Seconds.
};

var requestHandler = function(request, response) {

  console.log('Serving request type ' + request.method + ' for url ' + request.url);
  // console.log('request ------------------------------>', request);

  // The outgoing status.
  var statusCode;
  var outputObj = {results: []};
  
  var headers = defaultCorsHeaders;
  headers['Content-Type'] = 'application/json';
  console.log(request.url);
  if (request.method === 'GET' && request.url.startsWith('/classes/messages')) {
    statusCode = 200;
    outputObj.results = Object.keys(storageObj).map( (obj) => JSON.parse(obj) );
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify(outputObj));

  } else if (request.method === 'POST' && request.url.startsWith('/classes/messages')) {
    statusCode = 201;
    var dataArray = [];
    request.on('data', (data) => {
      dataArray.push(data); 
    }).on('end', () => {
      dataArray = Buffer.concat(dataArray).toString();
      storageObj[dataArray] = dataArray;
      response.writeHead(statusCode, headers);
      console.log('testing this ----------------------->', JSON.stringify(storageObj));
      response.end(JSON.stringify('Message sent'));
    }).on('error', (err) => console.error(err) );

  } else if (request.method === 'OPTIONS') {
    // HANDLE OPTIONS METHOD STUFF HERE!
    statusCode = 200;
    response.writeHead(statusCode, headers);
    response.end(JSON.stringify({status: 'OK'}));
  } else if (request.method === 'DELETE' && request.url.startsWith('/classes/messages')) {
    var dataArray = [];
    statusCode = 202;
    request.on('data', (data) => {
      dataArray.push(data); 
    }).on('end', () => {
      dataArray = Buffer.concat(dataArray).toString();
      if (storageObj[dataArray]) {
        statusCode = 200;
        delete storageObj[dataArray];
        console.log(JSON.stringify(storageObj));
      } else {
        statusCode = 204;
      }
      response.writeHead(statusCode, headers);
      response.end(JSON.stringify('Message deleted'));
    }).on('error', (err) => console.error(err) );
  } else if (request.method === 'PUT' && request.url.startsWith('/classes/messages')) {
    statusCode = 201;
    var dataArray = [];
    request.on('data', (data) => {
      dataArray.push(data); 
    }).on('end', () => {
      dataArray = Buffer.concat(dataArray).toString();
      storageObj[dataArray] = dataArray;
      response.writeHead(statusCode, headers);
      console.log('testing this ----------------------->', JSON.stringify(storageObj));
      response.end(JSON.stringify('Message sent'));
    }).on('error', (err) => console.error(err) );
  } else {
    statusCode = 404;
    response.writeHead(statusCode, headers);
    response.end();
  }
};

module.exports.requestHandler = requestHandler;
