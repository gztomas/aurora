var express = require("express");
var multipart = require('connect-multiparty');
var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

var multipartMiddleware = multipart();
var app = express();

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
        gm(newPath)
          .size(function(err, size) {
            gm('transparent-flag.png')
              .size(function(err, flagSize) {
                this.resize(size.width * flagSize.height / size.height, size.height)
                  .write('resized-flag', function(err) {
                    gm(newPath)
                      .composite('resized-flag')
                      .write(thumbPath, function(err) {
                        if (err) {
                          throw err;
                        }
                        res.redirect("/uploads/thumb_" + imageName);
                      })
                  })
              })
          })
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
