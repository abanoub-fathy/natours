const setUserIdInReq = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};

module.exports = setUserIdInReq;
