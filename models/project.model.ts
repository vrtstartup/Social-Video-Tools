export class Project { 
    projectId: string; 
    userId: string;
    name: string;
    projectPath: string;

    clip: any;

    constructor (project?: any) {
      this.projectId = (typeof project === 'undefined') ? "null" : project.projectId;
      this.userId = (typeof project === 'undefined') ? "null" : project.userId;
      this.name = (typeof project === 'undefined') ? "null" : project.name;
      this.projectPath = (typeof project === 'undefined') ? "null" : project.projectPath;

      this.clip = {
        "lowResUrl": (typeof project === 'undefined') ? "null" : project.clip.lowResUrl,
        "highResUrl": (typeof project === 'undefined') ? "null" : project.clip.highResUrl,
        "fileName": (typeof project === 'undefined') ? "null" : project.clip.fileName,
        "lowResFileName": (typeof project === 'undefined') ? "null" : project.clip.lowResFileName,
      }
    }

    test() {
      console.log(this.projectId);
    }

    data() {
      /*
      * serialize properties and return a json object 
      * ready for storage in Firebase
      */

      return {
        "projectId": this.projectId,
        "userId": this.userId,
        "name": this.name,
        "baseDir": this.projectPath,
        "clip": {
          "lowResUrl": this.clip.lowResUrl,
          "highResUrl": this.clip.highResUrl,
          "fileName": this.clip.fileName,
        }
      };
    }
}

