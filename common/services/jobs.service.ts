import { db } from '../../common/services/firebase.service';
import { logger } from '../config/winston';

export class Jobs {
  public refFfmpegQueue: any;

  constructor() { 
    this.refFfmpegQueue = db.ref('ffmpeg-queue');
  }

  resolveJob(queue:string, key: string) {
    // get reference 
    logger.verbose('successfully processed job...');
    return db.ref(`${queue}`).child(key).remove();
  }

  getFirst(property:string, operation: string) {
    // #todo implement logic for picking the proper job
    // get the first job from the queue stack
    const refProperty = db.ref(property);

    return new Promise((resolve, reject) => {
      refProperty.once('value', (snapshot) => {
        const jobs = snapshot.val(); // list of jobs

        if(jobs !== null && jobs.constructor === Object && Object.keys(jobs).length !== 0) {
          // loop over jobs
          const arrKeys = Object.keys(jobs);
          for (let i=0 ; i < arrKeys.length ; i++ ) {
            const key = arrKeys[i];
            const job = jobs[key];

            if(job.status === 'open' && job.operation === operation){
              job.id = key;
              resolve(job);
              break;
            }
          }
        }

        reject(false); // no more available jobs
      });
    });
  }

  queue(queue, projectId, operation) {
    // set a project up for processing in the firebase queue

    // has firebase been initialized? 
    const refFfmpegQueue = db.ref(`${queue}/${projectId}`);

    return refFfmpegQueue.update({
      "operation": operation,
      "status": "open"
    });
  }

  resolve(queue:string, key: string) {
    // get reference 
    logger.verbose('successfully processed job...');
    return db.ref(`${queue}`).child(key).remove();
  }

  kill(key, err) {
    logger.error(err);
    // make sure that faulty, error-throwing jobs dont get stuck in an execution loop
    const refErrors = db.ref('errors');

    return db.ref("ffmpeg-queue").child(key).once('value', snapshot => {
      const valOld = snapshot.val();
      const keyOld = snapshot.key;

      refErrors.child(keyOld).push({
        status: 'error',
        error: {
          message: err.message ? err.message : 'none',
          type: err.type ? err.type : 'none',
          arguments: err.arguments ? err.arguments : 'none',
          stack: err.stack ? err.stack : 'none'
        },
        timestamp: Date().toLocaleString()
      });
    }).then(data => {
       db.ref("ffmpeg-queue").child(key).remove();
    });
  }

  listenQueue(handler) {
    this.refFfmpegQueue.on('child_added', (snapshot) => {
      // this runs whenever a new job is created in the queue.
      // logger.verbose('got new queue data'); //#todo feedback
      const jobs = snapshot.val();
      handler(jobs);
    }, (errorObject) => {
      logger.error(`The read failed: ${errorObject.code}`);
    });
  }

  checkQueue(handler) {
    // check wether or not any jobs have been added to queue whilst processing was happening
    this.refFfmpegQueue.once('value', (snapshot) => {
      const jobs = snapshot.val();

      handler(jobs);
    }, (errorObject) => {
      logger.error(`The read failed: ${errorObject.code}`);
    });
  }

  setInProgress(job) {
    // busyProcessing = true;

    // #todo do I have to wrap this in a promise? 
    return new Promise((resolve, reject) => {
      this.refFfmpegQueue.child(job.id)
        .update({ 'status': 'in progress' })
        .then(resolve(job),reject);
    })
  }

  updateFfmpegQueue(job:any, value: Object) {
    // Update the firebase entry property for a given project
    return new Promise((resolve, reject) => {
      const ref = db.ref(`ffmpeg-queue/${job.id}`);
      ref.update(value)
        .then(resolve(job), reject);
    });
  }
}