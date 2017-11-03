var express = require('express')
var translate = require('./translate');

var app = express();
var port = 8080

app.get('/translate', function (req, res) {

    var from = req.query.f || 'auto';
    var to = req.query.t;
    var text = req.query.c;
    var engine = req.query.e || 'auto';

    translate(text, {from: from, to: to, engine: engine}).then(function (result) {
        res.json({code:200,data:result});
    }).catch(function (err) {
        console.error(err);
        res.json(err);
    });
});

var server = app.listen(port, function () {
    console.log('listening on port %d', port);
})