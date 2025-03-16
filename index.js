const express = require('express');
const mongoose = require('mongoose');
const reviewRouter = require('./routes/reviews');

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost:27017/gaspricefinder', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.json());
app.use(reviewRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
