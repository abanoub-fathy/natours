exports.setResCookie = (req, res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
    ),
  });
};
