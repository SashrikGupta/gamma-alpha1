const express = require('express');
const router = express.Router();
const cloudinary = require('../utils/cloudinary');
const { uploadPhoto, uploadVideo } = require('../middleware/multer');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const cliProgress = require('cli-progress');

// Photo upload endpoint
router.post('/upload/image', uploadPhoto.single('photo'), function (req, res) {
  cloudinary.uploader.upload(req.file.path, function (err, result) {
    if (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: 'Error uploading photo'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Photo uploaded successfully!',
      data: result
    });
  });
});

// Video upload endpoint
router.post('/upload/video', uploadVideo.single('video'), function (req, res) {
  // Path to the uploaded video file
  const videoPath = req.file.path;

  // Compressed video output path
  const compressedVideoPath = 'compressed-video.mp4';

  // Create a new progress bar instance
  const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

  // Start the progress bar
  progressBar.start(100, 0);

  // Compress the video using FFmpeg
  ffmpeg(videoPath)
    .videoCodec('libx264') // Video codec for compression
    .audioCodec('aac') // Audio codec
    .outputOptions('-crf 28') // Constant Rate Factor (CRF) for video quality (adjust as needed)
    .on('progress', (progress) => {
      // Update the progress bar
      if (progress.percent) {
        progressBar.update(progress.percent);
      }
    })
    .on('error', (err) => {
      console.error('Error compressing video:', err);
      progressBar.stop();
      return res.status(500).json({
        success: false,
        message: 'Error compressing video'
      });
    })
    .on('end', () => {
      console.log('Compression complete');
      progressBar.update(100);
      progressBar.stop();

      // Upload the compressed video to Cloudinary
      cloudinary.uploader.upload(compressedVideoPath, { resource_type: 'video' }, function (uploadErr, result) {
        if (uploadErr) {
          console.error('Error uploading video to Cloudinary:', uploadErr);
          return res.status(500).json({
            success: false,
            message: 'Error uploading video to Cloudinary'
          });
        }

        // Delete the temporary compressed video file
        fs.unlink(compressedVideoPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error('Error deleting compressed video file:', unlinkErr);
          }
        });

        res.status(200).json({
          success: true,
          message: 'Video uploaded and compressed successfully!',
          data: result
        });
      });
    })
    .save(compressedVideoPath);
});

module.exports = router;
