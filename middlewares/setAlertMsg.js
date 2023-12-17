const setAlertMsg = (req, res, next) => {
  const { alert } = req.query;
  if (alert === 'booking') {
    res.locals.alertMsg =
      'Your booking has been confirmed!. Please check your email';
  }

  next();
};

module.exports = setAlertMsg;
