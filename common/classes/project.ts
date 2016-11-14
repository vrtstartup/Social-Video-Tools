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
    let annotations = this.data.annotations;
    let collection = {};

    Object.keys(annotations).forEach( key =>{
      let obj = annotations[key];
      if( obj.type === type) collection[key] = obj;
    });

    return collection;
  }

  hasTitles() {
    // check wether or not this project containes titles
    let noTitles = false;

    if(this.data.hasOwnProperty("annotations")) {
      const annotations = this.getAnnotations('overlay');
      noTitles = (Object.keys(annotations).length  !== 0 && annotations === Object);
    } 

    return !noTitles;
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

  entry( overlay, template ) {
    // annotate template data with overlay data
    for(let field in overlay) {
      if(overlay.hasOwnProperty(field)) template[field] = overlay[field];
    }

    return (<any>Object).assign({}, template);
  }
}