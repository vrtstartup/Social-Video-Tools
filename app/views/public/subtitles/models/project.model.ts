import { ListPipe } from '../../../../common/pipes/list.pipe';
import { SortByPropPipe } from '../../../../common/pipes/sortByProp.pipe';

export class Project {

    public data;

    constructor(project:any) {
        delete project['$key'];
        delete project['$exists'];
        this.data = project;
    }
    
    getAnnotations() {
        return this.data.annotations;
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

    setSelectedAnno(key) {
        return this.data['annotations'][`${key}`];
    }

    updateSelectedAnno(key, obj){
        // update project | if key doesn't exists, its created this way
        this.data['annotations'][`${key}`] = obj;
    }

    private getLastObject(obj) {
        return obj[Object.keys(obj)[Object.keys(obj).length - 1]];
    }

    private makeid() {
        return `-ANNO${Math.random().toString(22).substr(2, 15).toUpperCase()}`;
    }
    
}