const express = require('express');



var app = express();
app.use(express.json());//to receive json body
app.post('/test', (req, res) =>{
  console.log('I was reached');
  console.log(req.body);

  res.send('ok');
});

app.listen(3003, () => {
  console.log('Test server is up and running');
});
