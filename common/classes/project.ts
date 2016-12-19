import * as resolver from '../../common/services/resolver.service';
import { fileConfig } from '../config/files';

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
        overlaysDone = overlaysDone && (overlays[key]['data']['bot']['render-status'] === 'done');
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
      arrKeys.forEach((key) => {
        const overlay = overlays[key];
        const obj = {};

        // append some variable props
        obj['"id"'] = `${key}---${this.generateId(16)}`; // add a random element so templater bot doesn't skip
        obj['"output"'] = `${key}`;

        // append templater bot fields
        const arrOverlayBotKeys = Object.keys(overlay['data']['bot']);
        arrOverlayBotKeys.forEach( key => obj[`"${key}"`] = overlay['data']['bot'][key] );

        // append layer information
        const arrLayerKeys = Object.keys(overlay['data']['layers']);
        arrLayerKeys.forEach( key => obj[`"${key}"`] = overlay['data']['layers'][key] ? '' : '{{off}}');

        // append text fields 
        const arrOverlayTextKeys = Object.keys(overlay['data']['text']);
        arrOverlayTextKeys.forEach( key => obj[`"${key}"`] = overlay['data']['text'][key]['text'] );

        // append afterjob vars
        obj['"projectId"'] = this.data.id;
        obj['"overlayId"'] = key;

        arrReturn.push(obj);
      });
    }

    return arrReturn;
  }

  overlayArray(type:string) {  
    // returns overlay in a format suitable for the stitching operation
    const overlays = this.getAnnotations(type);
    const keys = Object.keys(overlays); 
    let arrReturn = [];

    for(let key of keys) {
      if(overlays.hasOwnProperty(key) && overlays[key] !== null && overlays[key] !== undefined ){
        const overlay = overlays[key];
        const projectName = this.data.id;
        const filename = `${key}.${fileConfig.files.overlay.extension}`;
        const filePath = resolver.storageUrl(type, projectName, filename);

        const pushObject = {
          type: overlay['data']['type'],
          filePath: filePath, 
          start: overlay['start'],
          end: overlay['end']
        };

        if(overlay['data'].hasOwnProperty('scale')) pushObject['scale'] = overlay['data']['scale'];
        if(overlay['data'].hasOwnProperty('width')) pushObject['width'] = overlay['data']['width'];
        if(overlay['data'].hasOwnProperty('height')) pushObject['height'] = overlay['data']['height'];

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
      // filePath: resolver.getSharedFilePath('outro', data['name']),
      start: Number(this.data.clip.movieLength) - Number(data.transitionDuration),
      duration: data.duration,
      transitionDuration: data.transitionDuration
    };
  }

  generateId(length: number){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  } 
}