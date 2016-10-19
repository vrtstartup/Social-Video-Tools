"use strict";
var Project = (function () {
    function Project(project) {
        var source = JSON.parse(project);
        this.projectId = source.projectId;
        this.userId = source.userId;
        this.name = source.name;
        this.projectPath = source.projectPath;
        this.clip.lowResUrl = source.clip.lowResUrl;
        this.clip.highResUrl = source.clip.highResUrl;
        this.clip.fileName = source.clip.fileName;
    }
    Project.prototype.test = function () {
        console.log(this.projectId);
    };
    return Project;
}());
exports.Project = Project;
//# sourceMappingURL=project.js.map