exports.setResCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' ? true : false,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    ),
  });
};
