const express = require('express');
const actionsRoutes = require('./routes/actions');
const cors = require('cors');


const app = express();

app.use(cors());

app.use('/', actionsRoutes);

app.listen(3001, () => {
  console.log("Server started on port 3001");
});