import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Brand } from '../models/brand.model';
import { AngularFire, FirebaseListObservable} from 'angularfire2';

@Injectable()
export class BrandService{
  public brands$: Observable<any>;

  constructor(private af:AngularFire) {
    this.brands$ = af.database.list('/brands').map( brandsData => {
      const arrBrands: Array<Brand> = [];
      brandsData.forEach( singleBrand => arrBrands.push(new Brand(singleBrand)));
      return arrBrands;
    })
  }
}