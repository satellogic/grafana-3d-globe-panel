const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
let czml = '';
fs.readFile(path.resolve(__dirname, 'simple.czml'), 'utf8', (err, data) => {
  if (err) throw err; // we'll not consider error handling for now
  czml = data;
});

const palette = [
  [0, 0, 255], // blue
  [0, 255, 0], // green
  [0, 255, 255], // cyan
  [255, 0, 0], // red
  [255, 0, 255], // magenta
  [255, 255, 0], // yellow
  [255, 255, 255], // white
  [155, 96, 59], // brown
  [255, 149, 119], // tan
  [34, 139, 34], // forest
  [127, 255, 212], // aqua
  [250, 128, 114], // salmon
  [128, 0, 128], // purple
  [255, 163, 0], // orange
  [183, 183, 183], // grey
];
let colorIdx = 0;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/czml', (req, res) => {
  res.header('Content-Type', 'application/json');
  res.send(
    czml.replace(
      /<<START>>/g,
      (
        new Date(parseInt(req.query.from, 10))
      ).toISOString().split('T')[0]
    ).replace(
      /<<END>>/g,
      (
        new Date(parseInt(req.query.to, 10))
      ).toISOString().split('T')[0]
    ).replace(
      '"rgba": [0, 255, 0, 255]',
      // eslint-disable-next-line no-plusplus
      `"rgba": [${palette[colorIdx++ % palette.length].join(', ')}, 255]`
    )
  );
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on ${port}`);
});
