var express = require("express");
var multipart = require('connect-multiparty');
var fs = require('fs');
var im = require('imagemagick');

var multipartMiddleware = multipart();
var app = express();
var flag = fs.readFileSync('flag.png');

app.use(express.static('public'));

app.post('/upload', multipartMiddleware, function(req, res) {
  fs.readFile(req.files.image.path, function(err, data) {
    var imageName = req.files.image.name;
    /// If there's an error
    if (!imageName) {
      console.log("There was an error");
      res.redirect("/");
      res.end();
    } else {
      var newPath = __dirname + "/uploads/full_" + imageName;
      var thumbPath = __dirname + "/uploads/thumb_" + imageName;
      fs.writeFile(newPath, data, function(err) {
        im.resize({
          srcPath: newPath,
          dstPath: thumbPath,
          width: 200
        }, function(err, stdout, stderr) {
          if (err) {
            throw err;
          }
          console.log('resized image to fit within 200x200px');
        });
        res.redirect("/uploads/full_" + imageName);
      });
    }
  });
});

app.get('/uploads/:file', function(req, res) {
  var file = req.params.file;
  var img = fs.readFileSync(__dirname + "/uploads/" + file);
  res.writeHead(200, {'Content-Type': 'image/jpg'});
  res.end(img, 'binary');
});

app.listen(8080);
