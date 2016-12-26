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
          // set project to currently rendering 
          this.projectService.setProjectProperty(project.data.id, `status/rendering`, true);

          // queue render job
          this.projectService.updateProject(project, {
            files: {
              'baseDir': project.data.id
            }
          })
          .then(project => this.jobService.queue('ffmpeg-queue', project.data.id, 'lowres'))
          .then(this.projectService.removeProjectProperty(project.data.id, 'status/downscaled'))
          .then(this.projectService.removeProjectProperty(project.data.id, 'status/render'))
          .then(resolve)
        break;

        case 'storing':
          // is the project currently being uploaded to S3? 
          resolve(project);
        break;

        case 'downscaled':
          // salt link to trigger angular change detection
          const lowResUrl = resolver.storageUrl('lowres', project.data.id) + `?${Date.now()}${Math.floor(Math.random() * 1000000000)}`;
          this.projectService.removeProjectProperty(project.data.id, 'status/rendering')

          // remove statuses
          const arrProms = [];

          arrProms.push(this.projectService.removeProjectProperty(project.data.id, 'status/downScaleProgress'));
          arrProms.push(this.projectService.removeProjectProperty(project.data.id, 'status/storing'));
          arrProms.push(this.projectService.setProjectProperty(project.data.id, 'clip/lowResUrl', lowResUrl));

          Promise.all(arrProms).then(arrResults => resolve(project), this.errorHandler);

          
          resolve(project);
        break;

        case 'thumb': 
          const thumbUrl = resolver.storageUrl('thumb', project.data.id);
          this.projectService.setProjectProperty(project.data.id, 'clip/thumbUrl', thumbUrl)
            .then(resolve);
        break;
        
        case 'subtitles':
          // additional hooks for the subtitles event go here
          resolve(project);
        break;

        case 'templater':
        break; 

        case 'rendering':
          // is the project currently being rendered? 
          resolve(project);
        break;

        case 'render':
          // is there a render file available for this project? 
          const renderUrl = resolver.storageUrl('render', project.data.id);
          this.projectService.removeProjectProperty(project.data.id, 'status/storing')
          this.projectService.removeProjectProperty(project.data.id, 'status/rendering')
        
          // send email 
          this.projectService.removeProjectProperty(project.data.id, 'status/stitchingProgress')
            .then( status => this.projectService.setProjectProperty(project.data.id, 'clip/renderUrl', renderUrl))
            .then( status => this.projectService.getEmailByProject(project))
            .then( address => this.emailService.notify(address, type, project.data.id))
            .catch(this.errorHandler.bind(this))
            .then( info => resolve(project));
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