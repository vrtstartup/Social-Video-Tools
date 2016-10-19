"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var angularfire2_1 = require('angularfire2');
var videoUpload_1 = require('../../../../common/services/videoUpload');
var http_1 = require('@angular/http');
require('rxjs/Rx');
require('./subtitles.component.scss');
var SubtitlesComponent = (function () {
    function SubtitlesComponent(http, service, af) {
        this.http = http;
        this.service = service;
        this.toProcess = af.database.list('/to-process');
        this.projectId = this.makeid();
        this.service.progress$.subscribe(function (data) {
            console.log("progress = " + data);
        });
    }
    SubtitlesComponent.prototype.ngOnInit = function () {
        console.log('init');
    };
    SubtitlesComponent.prototype.upload = function ($event) {
        var _this = this;
        this.uploadFile = $event.target;
        this.service.makeFileRequest('http://localhost:8080/upload', this.uploadFile.files[0], this.projectId)
            .subscribe(function (data) {
            console.log(data);
            _this.queue(_this.projectId);
        });
        this.projectId = this.makeid();
    };
    SubtitlesComponent.prototype.queue = function (id) {
        this.toProcess.push({ projectId: id });
    };
    SubtitlesComponent.prototype.makeid = function () {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 16; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    SubtitlesComponent = __decorate([
        core_1.Component({
            providers: [videoUpload_1.UploadService],
            selector: 'subtitles-component',
            templateUrl: 'subtitles.component.html',
        }), 
        __metadata('design:paramtypes', [http_1.Http, videoUpload_1.UploadService, angularfire2_1.AngularFire])
    ], SubtitlesComponent);
    return SubtitlesComponent;
}());
exports.SubtitlesComponent = SubtitlesComponent;
//# sourceMappingURL=subtitles.component.js.map