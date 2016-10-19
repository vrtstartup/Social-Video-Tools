import * from 'fs';

export class Project { 
    projectId: string; 
    userId: string;
    name: string;
    projectPath: string;

    clip: {
      lowResUrl: string,
      highResUrl: string,
      fileName: string,
    }

    constructor (project: any) {
        const source = JSON.parse(project);

        this.projectId = source.projectId;
        this.userId = source.userId;
        this.name = source.name;
        this.projectPath = source.projectPath;

        this.clip.lowResUrl = source.clip.lowResUrl;
        this.clip.highResUrl = source.clip.highResUrl;
        this.clip.fileName = source.clip.fileName;
    }

    test() {
      console.log(this.projectId);
    }
} 