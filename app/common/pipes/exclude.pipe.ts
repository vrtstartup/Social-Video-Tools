import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'exclude'})
export class ExcludePipe implements PipeTransform {
  transform(value, args:string) : any {
    
    let returnObj = {}

    for(let i in value){
        if (value[i]['data']['type'] && value[i]['data']['type'] !== args){
          returnObj[i] = value[i];
        } 
    }
    
    return returnObj;
  }
}