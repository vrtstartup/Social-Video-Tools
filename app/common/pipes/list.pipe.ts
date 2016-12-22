import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'list'})
export class ListPipe implements PipeTransform {
    transform(input: any, args?: any[]): any[] {
        // create instance vars to store keys and final output
        let keyArr: any[] = Object.keys(input),
            dataArr = [];

        // loop through the object,
        // pushing input to the return array
        keyArr.forEach((key: any) => {
            // remove firebase stuff from object
            if( key != '$exists' && key != '$key'){
                const newVal = input[key];
                newVal['key'] = key;
                
                dataArr.push(newVal);
            }
        });
        
        // return the resulting array
        return dataArr;
    }
}