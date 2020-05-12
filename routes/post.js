const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary');
const multerStorageCloudinary = require('multer-storage-cloudinary');
const Post = require('./../models/post');
const routeGuard = require('./../middleware/route-guard');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = multerStorageCloudinary({
  cloudinary,
  folder: 'lab-file-upload-folder-post'
});

const uploader = multer({ storage });

const postRouter = new express.Router();

postRouter.get('/create', routeGuard, (req, res, next) => {
  res.render('post/create');
});

postRouter.post('/create', routeGuard, uploader.single('picture'), (req, res, next) => {
    // console.log('endpoint reached')
  const message = req.body.message;
  const picture = req.file.url;
  const userId = req.user._id;
  Post.create({
    message,
    picture,
    creator: userId
  })
    .then(post => {
      res.redirect('/');
    })
    .catch(error => {
      next(error);
    });
});

postRouter.get('/', (req, res, next) => {
  Post.find()
    .sort({ creationDate: -1 })
    .populate('creator')
    .then(posts => {
      console.log('post', posts);
      res.render('/', { posts });
    })
    .catch(error => {
      next(error);
    });
});

module.exports = postRouter;