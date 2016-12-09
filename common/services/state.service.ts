import { Projects } from '../../common/services/projects.service';
import { Jobs } from '../../common/services/jobs.service';
import { Project } from '../../common/classes/project';
import { Email } from '../../common/services/email.service';
import * as resolver from '../../common/services/resolver.service';
import { logger } from '../config/winston';

export class State {
  private projectService; 
  private jobService;
  private emailService;

  constructor() { 
    this.projectService = new Projects();
    this.jobService = new Jobs();
    this.emailService = new Email();
  }

  /*
  * Exposes the updateState() function which sets a status property on 
  * a project record. Additional status hooks can be registered per status 
  * in the internal handleStateChange() function
  */
  public updateState(project: Project, type:string, value:any) {
    return new Promise((resolve, reject) => {
        this.projectService.setProjectProperty(project.data.id, `status/${type}`, value) // update project status 
          .then( data => this.handleSateChange(project, type, value)) // handle state specific stuff
          .then(resolve);
    });
  }

  private handleSateChange(project: Project, type:string, value: any){ 
    return new Promise((resolve, reject) => {
      switch (type) {
        case 'uploaded':
          const proms = [];

          proms.push(resolver.makeProjectDirectories(project.data.id));
          proms.push(this.projectService.updateProject(project, {
            files: {
              'baseDir': project.data.id
            }
          }));

          Promise.all(proms).then(arrData => {
            const project = arrData[1];

            this.jobService.queue('ffmpeg-queue', project.data.id, 'lowres')
               .then(this.updateState(project, 'downscaled', false))
          });
        break;

        case 'downscaled':
          // salt link to trigger angular change detection
          const lowResUrl = resolver.storageUrl('lowres', project.data.id) + `?${Date.now()}${Math.floor(Math.random() * 1000000000)}`;

          // additional hooks for the downscaled event go here
          this.projectService.removeProjectProperty(project.data.id, 'status/downScaleProgress')
            .then(status => resolve(project), this.errorHandler);

          if(value) this.projectService.setProjectProperty(project.data.id, 'clip/lowResUrl', lowResUrl);
        break;

        case 'subtitles':
          // additional hooks for the subtitles event go here
          resolve(project);
        break;

        case 'templater':
        break; 

        case 'render':
        const renderUrl = resolver.storageUrl('render', project.data.id);

          // send email 
          this.projectService.removeProjectProperty(project.data.id, 'status/stitchingProgress')
            .then( status => this.projectService.setProjectProperty(project.data.id, 'clip/renderUrl', renderUrl))
            .then( status => this.projectService.getEmailByProject(project))
            .then( address =>  this.emailService.notify(address, type, project.data.id))
            .then( info => resolve(project))
            .catch(this.errorHandler.bind(this));
        break;

        case 'archive':
          // send to s3 bucket 
          // remove local files 
        break;
        
        default:
          logger.warn('handling unknown status change!');
          break;
        
      }
    });
  }

  private errorHandler(err) { logger.error(err) };
}