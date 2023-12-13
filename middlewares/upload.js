const multer = require('multer');
const AppError = require('../errors/AppError');
const sharp = require('sharp');

const memoryStorage = multer.memoryStorage();

const fileFilters = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    return cb(new AppError(400, 'Please upload an image file'), false);
  }

  return cb(null, true);
};

exports.upload = multer({
  storage: memoryStorage,
  fileFilter: fileFilters,
});

exports.resizeImage = async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user._id}-${Date.now()}.jpeg`;

  // use sharp to resize image and use jpeg extension
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.resizeTourImages = async (req, res, next) => {
  if (req.files.imageCover) {
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  }

  if (req.files.images) {
    req.body.images = [];

    const promises = req.files.images.map(async (file, i) => {
      const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      req.body.images.push(fileName);

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${fileName}`);
    });

    await Promise.all(promises);
  }

  next();
};
