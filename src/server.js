var express = require('express');
var path = require('path');

var app = express();

app.use(express.static(path.join(__dirname, '../dist')));

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});


const port = process.env.PORT || 5300;

app.listen(port, () => console.log(`Listening on port ${port}`));
