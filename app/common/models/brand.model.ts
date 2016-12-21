export class Brand {
  public data;
  public key;

  constructor(brand: Object){
    this.key = brand['$key'];
    delete brand['$key'];
    delete brand['$exists'];
    this.data = brand;
  }

  // additional methods go here
}