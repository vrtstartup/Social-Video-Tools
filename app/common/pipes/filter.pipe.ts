import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'filter',
    pure: false
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], args: any[]): any {
        // filter items array, items which match and return true will be kept, false will be filtered out
        if(!items) return [];
        const arrKeys = Object.keys(args);
        const prop = arrKeys[0];
        const val = args[prop]; 

        // just filter on first args property
        return items.filter(item => item.brand.indexOf(val) !== -1 );
    }
}