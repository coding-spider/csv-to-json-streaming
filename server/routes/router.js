var router = require('express').Router();
var fs = require('fs');
var path = require('path');
var https = require('https');

module.exports = (function() {

    router.get('/', function(req, res) {
        res.render('index');
    });

    router.get('/convert/csv/to/json', function(req, res, next) {
        if (req.query.q) {
            var keys = [];
            var file = req.query.q;
            var leftover = '';
            var leftOverKey = "";
            var firsttime = true;
            https.get(file, function(result) {

                if (result.statusCode != 200) {
                    res.send("Invalid link specified");
                }

                result.setEncoding('utf8');
                result.on('data', function(chunk) {
                    chunk = chunk + leftover;
                    if (firsttime) {
                        chunk = chunk + leftOverKey;
                        var data = chunk.split('\n');
                        if (data.length) {
                            keys = data[0].split(',');
                            for (var i = 1; i < data.length; i++)
                                chunk = data.join('\n')
                            firsttime = false;
                        } else {
                            leftOverKey = leftOverKey + chunk;
                        }

                    }
                    var csvData = chunk.split('\n');
                    leftover = csvData[csvData.length - 1];
                    for (var i = 1; i < csvData.length - 1; i++) {
                        var temp = {};
                        var splitDataArr = csvData[i].split(',')
                        var splitDataLength = csvData[i].split(',').length;
                        for (var j = 0; j < splitDataLength; j++)
                            temp[keys[j]] = splitDataArr[j];
                        res.write(JSON.stringify(temp));
                    }
                });

            });
        } else {
            res.send("Please specify csv link");
        }
    });

    return router;

})();
