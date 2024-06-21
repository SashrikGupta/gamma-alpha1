const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const photoFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed!'));
  }
};

const videoFilter = (req, file, cb) => {
  const fileTypes = /mp4|mov|avi/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only videos are allowed!'));
  }
};

const uploadPhoto = multer({
  storage: storage,
  fileFilter: photoFilter
});

const uploadVideo = multer({
  storage: storage,
  fileFilter: videoFilter
});

module.exports = {
  uploadPhoto,
  uploadVideo
};
