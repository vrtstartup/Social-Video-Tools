export class Styles {
  private fireBase;
  private logger;

  constructor(fireBase:any, logger: any) { 
    this.fireBase = fireBase;
    this.logger = logger;
  }

  getAll() {
    return new Promise((resolve, reject) => {
      this.fireBase.database.ref('styles').once('value')
        .then(snapshot => resolve(snapshot.val()), err => this.logger.error(err));
    });
  }
}