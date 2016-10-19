require('ts-node/register');
var firebase = require('firebase');
var path = require('path');
var fs = require('fs');
firebase.initializeApp({
    serviceAccount: path.resolve(__dirname + "/config/firebase/key.json"),
    databaseURL: 'https://socialvideotool.firebaseio.com',
});
var db = firebase.database();
var mockfile = path.join(__dirname, 'mock/project.json');
var project = JSON.parse(fs.readFileSync(mockfile, 'utf8'));
var refProjects = db.ref('projects');
refProjects.push(project);
var refProcess = db.ref('to-process');
refProcess.on('value', function (snapshot) {
    var docs = snapshot.val();
    if (docs) {
        for (first in docs)
            break;
        var objProject = docs[first];
        var refProject = db.ref("projects/" + objProject.projectId);
        console.log(objProject.projectId);
        refProject.on('value', function (snapshot) {
            console.log(snapshot.val());
        });
    }
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});
//# sourceMappingURL=worker.js.map