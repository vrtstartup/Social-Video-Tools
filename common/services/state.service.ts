import { Projects } from '../../common/services/projects.service';
import { Project } from '../../common/classes/project';
import { Email } from '../../common/services/email.service';

export class State {
  private fireBase; 
  private projectService; 
  private emailService;
  private logger;

  constructor(fireBase:any, logger?: any) { 
    this.fireBase = fireBase;
    this.projectService = new Projects(this.fireBase, logger);
    this.emailService = new Email(logger);
    this.logger = logger ? logger : null;
  }

  /*
  * Exposes the updateState() function which sets a status property on 
  * a project record. Additional status hooks can be registered per status 
  * in the internal handleStateChange() function
  */
  public updateState(project: Project, type:string, value:any) {
    return new Promise((resolve, reject) => {
        this.projectService.setProjectProperty(project.data.id, `status/${type}`, value) // update project status 
          .then( data => this.handleSateChange(project, type)) // handle state specific stuff
          .then(resolve);
    });
  }

  private handleSateChange(project: Project, type:string){ 
    return new Promise((resolve, reject) => {
      switch (type) {
        case 'uploaded':
        break;

        case 'downscaled':
          // additional hooks for the downscaled event go here
          this.projectService.removeProjectProperty(project.data.id, 'status/downScaleProgress')
            .then(status => resolve(project), this.errorHandler);
        break;

        case 'subtitles':
          // additional hooks for the subtitles event go here
          resolve(project);
        break;

        case 'templater':
        break; 

        case 'render':
          // send email 
          this.projectService.removeProjectProperty(project.data.id, 'status/stitchingProgress')
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
          this.logger.warn('handling unknown status change!');
          break;
        
      }
    });
  }

  private errorHandler(err) { this.logger.error(err) };
}