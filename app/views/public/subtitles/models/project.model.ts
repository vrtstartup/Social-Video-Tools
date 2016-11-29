import { ListPipe } from '../../../../common/pipes/list.pipe';
import { SortByPropPipe } from '../../../../common/pipes/sortByProp.pipe';

export class Project {

    public data;
    public key; 
    private possibleStatuses = [{
        label: 'uploaded',
        message: {
          text: 'Project has been uploaded'
        }
    },
    {
      label: 'downScaleProgress',
      message: {
        text: 'source video is being processed...'
      }
    },
    {
        label: 'downscaled',
        message: {
          text: 'source video has been processed'
        }
    },
    {
      label: 'subtitles',
      message: {
        text: 'subtitle file has been generated'
      }
    },
    {
      label: 'stitchingProgress',
      message: {
        text: 'composition is being rendered...'
      }
    },
    {
      label: 'render',
      message: {
        text: 'rendering complete'
      }
    }];

    public lastStatus: Object;

    constructor(project:any) {
        this.key = project['$key'];
        delete project['$key'];
        delete project['$exists'];
        this.data = project;

        this.getLastStatus();
    }
    
    getAnnotations() {
        return this.data.annotations;
    }

    getFirstAnnotationKey(){
      let returnVal;

      if(this.data.hasOwnProperty('annotations')){ // there's annotations available
        const arrKeys = Object.keys(this.data.annotations);
        returnVal = arrKeys[0];
      } else{
        returnVal = null;
      }

      return returnVal;
    }

    addAnnotation(template){
        // create annotation object if none
        if (!this.data['annotations']) {
            this.data['annotations'] = {};
        }

        let strtTm = 0;
        let spanTm = 4;

        // if min one annotation
        if (Object.keys(this.data['annotations']).length > 0) {
            // object to array => sort => get one with highest end-value
            let annoArray = new ListPipe().transform(this.data['annotations']);
            let annoSorted = new SortByPropPipe().transform(annoArray, 'end');
            let annoLastEndtime = annoSorted[annoSorted.length -1 ]['end'] 
            
            strtTm = annoLastEndtime;
            const leftTm = this.data['clip']['movieLength'] - strtTm;

            if (leftTm <= spanTm) {
                strtTm = this.data['clip']['movieLength'] - spanTm;
            }
        }

        let endTm = strtTm + spanTm;
        let newId = this.makeid();
        let newAnno = {
            key: newId,
            start: strtTm,
            end: endTm,
            data: template,
        };
        
        this.data['annotations'][newId] = newAnno;

        return newAnno
    }

    getAnnotation(key) {
        return this.data.hasOwnProperty('annotations') ? this.data['annotations'][`${key}`] : null;
    }

    updateSelectedAnno(key, obj){
        // update project | if key doesn't exists, its created this way
        this.data['annotations'][`${key}`] = obj;
    }

    getLastStatus(){
        for(let i=0; i<this.possibleStatuses.length; i++){
            const status = this.possibleStatuses[i];
            if(this.checkStatus(status)){
              if(status['label'] === 'stitchingProgress') status['message']['progress'] = this.data.status['stitchingProgress'];
              if(status['label'] === 'downScaleProgress') status['message']['progress'] = this.data.status['downScaleProgress'];
              this.lastStatus = status['message']
            }

        } 
    }

    isRendering(){
        return (this.data.hasOwnProperty('status') && this.data.status.hasOwnProperty('stitchingProgress') && this.data.status.hasOwnProperty('stitchingProgress') !== null)
    }

    private checkStatus(status: Object) { 
        return (this.data.hasOwnProperty('status') && this.data.status[status['label']]) ? true : false;
    }

    private getLastObject(obj) {
        return obj[Object.keys(obj)[Object.keys(obj).length - 1]];
    }

    private makeid() {
        return `-ANNO${Math.random().toString(22).substr(2, 15).toUpperCase()}`;
    }
    
}