var http = require("http"),
    https = require("https"),
    fs = require("fs"),
    url = require('url'),
    host_ip = process.argv[2];

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var pk = fs.readFileSync('./privatekey.pem');
var pc = fs.readFileSync('./certificate.pem');
var httpsServerOptions = {
 key: pk, cert: pc
};

https.createServer(httpsServerOptions, function(request, response) {
  var internalRequestHeaders = request.headers;
  delete internalRequestHeaders['host'];
  var internalRequestOptions = {
    host: host_ip,
    path: request.url,
    port: '443',
    headers: internalRequestHeaders,
    method: request.method,

  };
  var requestBody = '';
  request.on('data', function(chunk) {
    requestBody += chunk;
  });
  request.on('end', function() {
    console.log(internalRequestOptions);
    var internalRequest = https.request(internalRequestOptions,function(internalResponse) {
      var str = '';
      internalResponse.on('data', function (chunk) {
        str += chunk;
      });
      internalResponse.on('end', function () {
        response.writeHead(internalResponse.statusCode, "so how's it goin?", internalResponse.headers);
        for (var property in internalResponse.headers) {
          console.log("Response header: " + property +", value: " + internalResponse.headers[property]);
        }
        response.write(str, "utf8");
        response.end();
        console.log("Response Body: " + str);
      });
    });

    if ( requestBody != "") {
      internalRequest.write(requestBody,"utf8");
      console.log("Request Body: " + requestBody);
    }
    internalRequest.end();
    
  });
}).listen(443);
