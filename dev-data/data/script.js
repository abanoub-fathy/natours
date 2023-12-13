// require env vars
require('dotenv').config();

const fs = require('fs');

const mongoose = require('mongoose');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

const DB_URL = process.env.DB_URL.replace(
  '<DB_PASSWORD>',
  process.env.DB_PASSWORD,
);
mongoose.connect(DB_URL, {}).then(async (connection) => {
  console.log('📅 connected to DB');
  let tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
  let users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
  let reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'),
  );

  // delete all models
  await Promise.all([
    Tour.deleteMany(),
    User.deleteMany(),
    Review.deleteMany(),
  ]);

  await Promise.all([
    Tour.create(tours),
    User.create(users, { validateBeforeSave: false }),
    Review.create(reviews),
  ]);

  console.log('tours should be created');
});
