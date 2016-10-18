const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.body);

    const dest = path.join(__dirname, '/../projects/', req.body.projectId);
    let stat = null;

    try {
      stat = fs.mkdirSync(dest);
    } catch (err) {
      fs.mkdirSync(dest);
    }

    if (stat && !stat.isDirectory()) {
      throw new Error(`Directory cannot be created because an inode of a different type exists at "${dest }"`);
    }

    cb(null, dest);
  },
});
const upload = multer({
  dest: path.join(__dirname, '/../projects'),
  storage,
});

const file = upload.fields([{ name: 'video' }]);

router.post('/', file, (req, res) => {
  res.json({
    success: true,
    file: req.files.video[0],
  });
});

module.exports = router;
