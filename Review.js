const express = require('express');
const Review = require('../models/Review');

const router = express.Router();

router.post('/reviews', async (req, res) => {
  const review = new Review(req.body);
  try {
    await review.save();
    res.status(201).send(review);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get('/reviews/:stationId', async (req, res) => {
  try {
    const reviews = await Review.find({ stationId: req.params.stationId });
    res.status(200).send(reviews);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
