import * as resolver from '../../common/services/resolver.service';

export class Project {
  public data;
  private logger;

  constructor(project:any, logger: any) { 
    this.data = project;
    this.logger = logger;
  }

  overlaysReady() {
    // check if all assets have been rendered, resolve job if they have 
    let overlays = this.getAnnotations('overlay'); 
    let overlaysDone = true;

    for(let key in overlays) {
      if(overlays.hasOwnProperty(key)) {
        overlaysDone = overlaysDone && (overlays[key]['render-status'] === 'done');
      }
    }

    return overlaysDone;
  }

  getAnnotations(type:string){
    let collection = {};

    if(this.data.hasOwnProperty('annotations') && this.data.annotations !== null && this.data.annotations !== undefined){
      let annotations = this.data.annotations;
      Object.keys(annotations).forEach( key =>{
        let obj = annotations[key];
        if( obj['data']['type'] === type) collection[key] = obj;
      });
    }
    
    return Object.keys(collection).length === 0 ? false : collection;
  }

  hasOverlays() {
    return this.hasAnnotations('overlay');
  }

  hasAnnotations(type:string) {
    let hasAnnotations = false;

    if(this.data.hasOwnProperty("annotations")) {
      const annotations = this.getAnnotations(type);
      hasAnnotations = (Object.keys(annotations).length  !== 0 && typeof annotations === 'object');
    } 

    return hasAnnotations;
  }

  parseOverlays() {
    // titles exist. 
    const overlays = this.getAnnotations('overlay');
    const arrKeys = Object.keys(overlays);
    const arrReturn = [];

    if(arrKeys.length !== 0 && overlays.constructor === Object) {
      // has proper data type
      arrKeys.forEach((key) => {
        const overlay = overlays[key];
        arrReturn.push(overlay['data']);
      });
    }

    return arrReturn;
  }

  overlayArray() {  
    // returns overlay in a format suitable for the stitching operation
    const overlays = this.getAnnotations('overlay');
    const keys = Object.keys(overlays); 
    let arrReturn = [];

    for(let key of keys) {
      if(overlays.hasOwnProperty(key) && overlays[key] !== null && overlays[key] !== undefined ){
        const overlay = overlays[key];

        const pushObject = {
          type: overlay['type'],
          filePath: resolver.getFilePathByType('overlay', this.data.id, key),
          start: overlay['start'],
          end: overlay['end']
        };

        if(overlay.hasOwnProperty('scale')) pushObject['scale'] = overlay['scale'];
        if(overlay.hasOwnProperty('width')) pushObject['width'] = overlay['width'];
        if(overlay.hasOwnProperty('height')) pushObject['height'] = overlay['height'];

        arrReturn.push(pushObject);
      }
    }

    return arrReturn;
  }

  getOutro(){
    const annotations = this.getAnnotations('outro');
    const arrKeys = Object.keys(annotations);
    const annotationId = arrKeys[0];
    const outro = annotations[annotationId];
    const data = outro['data'];
    
    return {
      type: 'outro',
      filePath: resolver.getFilePathByType('outro', '', data['name']),
      start: Number(this.data.clip.movieLength) - Number(data.transitionDuration),
      duration: data.duration,
      transitionDuration: data.transitionDuration
    };
    
  }
}