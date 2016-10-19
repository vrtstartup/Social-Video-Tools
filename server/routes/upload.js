require('ts-node/register');
var express = require('express');
var multer = require('multer');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log(req.body);
        var dest = path.join(__dirname, '/../projects/', req.body.projectId);
        var stat = null;
        try {
            stat = fs.mkdirSync(dest);
        }
        catch (err) {
            fs.mkdirSync(dest);
        }
        if (stat && !stat.isDirectory()) {
            throw new Error("Directory cannot be created because an inode of a different type exists at \"" + dest + "\"");
        }
        cb(null, dest);
    },
});
var upload = multer({
    dest: path.join(__dirname, '/../projects'),
    storage: storage,
});
var file = upload.fields([{ name: 'video' }]);
router.post('/', file, function (req, res) {
    res.json({
        success: true,
        file: req.files.video[0],
    });
});
module.exports = router;
//# sourceMappingURL=upload.js.map