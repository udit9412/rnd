var gAPI = require('../index').API;
var fs = require("fs"),
	util = require("util");

var scope = 'https://www.google.com/m8/feeds/'; //contacts


var express = require('express');
var app = express();
var port = 4000;
var page_cb_auth = '/authenticate';

var api = new gAPI(
	"806256586653-ahai347lpobu1gjio8sqf20bjq5c1dg6.apps.googleusercontent.com",
	"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",
	'http://localhost:' + port + '/authenticate');

app.get(page_cb_auth, function (req, res) {
	api.gdata.getAccessToken(
		{
			scope: scope,
			access_type: 'offline',
			approval_prompt: 'force'
		},
		req,
		res,
		function (err, _token) {
			if (err) {
				console.error('oh noes!', err);
				res.writeHead(500);
				res.end('error: ' + JSON.stringify(err));
			} else {
				token = _token;
				console.log('got token:', token);
				res.send(token);
			}
		});
});

app.listen(port);


