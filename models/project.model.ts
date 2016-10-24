export class Project { 
    projectId: string; 
    userId: string;
    name: string;
    projectPath: string;

    clip: any;
    status: any;

    constructor (project?: any) {
      this.projectId = (typeof project === 'undefined') ? null : project.projectId;
      this.userId = (typeof project === 'undefined') ? null : project.userId;
      this.name = (typeof project === 'undefined') ? null : project.name;
      this.projectPath = (typeof project === 'undefined') ? null : project.projectPath;

      this.clip = {
        "lowResUrl": (typeof project === 'undefined') ? null : project.clip.lowResUrl,
        "highResUrl": (typeof project === 'undefined') ? null : project.clip.highResUrl,
        "fileName": (typeof project === 'undefined') ? null : project.clip.fileName,
        "lowResFileName": (typeof project === 'undefined') ? null : project.clip.lowResFileName,
      }

      this.status = {
        "uploaded": (typeof project === 'undefined') ? false : project.status.uploaded,
        "downscaled": (typeof project === 'undefined') ? false : project.status.downscaled,
      }
    }
}

