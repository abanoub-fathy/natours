setReviewReqBody = (req, res, next) => {
  const tour = req.params.tourId;
  const user = req.user._id;

  req.body.tour = tour;
  req.body.user = user;
  next();
};

module.exports = setReviewReqBody;
