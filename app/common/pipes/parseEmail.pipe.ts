import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'parseEmail'})
export class ParseEmailPipe implements PipeTransform {

    transform(input: string): string {
        // do stuff here
        let nameAr: Array<string> = input.split('.', 1);
        // return the parsed email
        let name: string = nameAr[0].charAt(0).toUpperCase() + nameAr[0].substr(1).toLowerCase() ;
        return name;
    }
}