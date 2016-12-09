const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.get('/czml', (req, res) => {
  const readable = fs.createReadStream(
    path.resolve(__dirname, 'simple.czml')
  );
  res.header('Content-Type', 'application/json');
  readable.pipe(res);
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on ${port}`);
});
