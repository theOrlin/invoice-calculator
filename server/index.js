const express = require('express');
const path = require('path');
const csv = require('csvtojson');
const multer = require('multer');

const upload = multer();

const app = express();

//The following commented-out lines are pertinent to the production build of the client
// app.use(express.static(path.join(__dirname, 'build')));

// app.get('/',function(req,res){
//   res.sendFile(__dirname, 'build', '/index.html');
// });

app.post('/upload', upload.single('csvfile'), function (req, res, next) {
  csv().fromString(req.file.buffer.toString()).then(function(jsonArrayObj) {
    res.status(201).send(jsonArrayObj);
  });
});

app.listen(3333, () => console.log('Server started on port 3333'));