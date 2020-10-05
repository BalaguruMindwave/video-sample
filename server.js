const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const request = require("request");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname + "/index.htm"));
});

app.get("/video", function (req, res) {
  var fileUrl = "https://alderplay.blob.core.windows.net/alderplay/play3.mp4";

  var range = req.headers.range;
  var positions, start, end, total, chunksize;

  // HEAD request for file metadata
  request(
    {
      url: fileUrl,
      method: "HEAD",
    },
    function (error, response, body) {
      setResponseHeaders(response.headers);
      pipeToResponse();
    }
  );

  function setResponseHeaders(headers) {
    positions = range.replace(/bytes=/, "").split("-");
    start = parseInt(positions[0], 10);
    total = headers["content-length"];
    end = positions[1] ? parseInt(positions[1], 10) : total - 1;
    chunksize = end - start + 1;

    res.writeHead(206, {
      "Content-Range": "bytes " + start + "-" + end + "/" + total,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    });
  }

  function pipeToResponse() {
    var options = {
      url: fileUrl,
      headers: {
        range: "bytes=" + start + "-" + end,
        connection: "keep-alive",
      },
    };

    request(options).pipe(res);
  }
});
app.listen(4009, function () {
  console.log("Listening on port 4009!");
});
