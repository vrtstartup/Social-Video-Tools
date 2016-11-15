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
        if( obj.type === type) collection[key] = obj;
      });
    }
    
    return collection;
  }

  hasOverlays() {
    return this.hasAnnotations('overlay');
  }

  hasAnnotations(type:string) {
    let noAnnotations = false;

    if(this.data.hasOwnProperty("annotations")) {
      const annotations = this.getAnnotations(type);
      noAnnotations = (Object.keys(annotations).length  === 0 && typeof annotations === 'object');
    } 

    return !noAnnotations;
  }

  parseOverlays( templates ) {
    // titles exist. 
    const overlays = this.getAnnotations('overlay');
    const arrKeys = Object.keys(overlays);
    const arrReturn = [];

    if(arrKeys.length !== 0 && overlays.constructor === Object) {
      // has proper data type
      arrKeys.forEach((key) => {
        const overlay = overlays[key];
        const template = templates[overlay.templateId];

        // append some extra data so the templater bot can update status
        overlay.titeId = key;
        overlay.projectId = this.data.id;

        arrReturn.push(this.entry(overlay, template));
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
        arrReturn.push({
          type: 'overlay',
          path: resolver.getFilePathByType('overlay', this.data.id, key),
          start: overlays[key]['start'],
          end: overlays[key]['end']
        })
      }
    }

    return arrReturn;
  }

  entry( overlay, template ) {
    // annotate template data with overlay data
    for(let field in overlay) {
      if(overlay.hasOwnProperty(field)) template[field] = overlay[field];
    }

    return (<any>Object).assign({}, template);
  }
}