import { db } from './firebase.service';

export class Templates {
  private logger;

  constructor(logger: any) { 
    this.logger = logger;
  }

  getAll() {
    return new Promise((resolve, reject) => {
      db.ref('templates').once('value')
        .then(snapshot => resolve(snapshot.val()), err => this.logger.error(err));
    });
  }
}