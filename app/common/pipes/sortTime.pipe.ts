import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: "sortTime" })
export class SortTimePipe implements PipeTransform {

    transform(array: Array<string>, args: string): Array<string> {

        array.sort((a: any, b: any) => {
                if ( a[args] < b[args] ) 
                    return -1;
                if ( a[args] > b[args] ) 
                    return 1;
                return 0;
            }
        );

        return array;
    }
}