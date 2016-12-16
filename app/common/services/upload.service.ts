import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class UploadService {
  progress$: any;
  progressObserver: any;
  progress: any;

  constructor () {
    this.progress$ = Observable.create(observer => {
      this.progressObserver = observer;
    }).share();
  }
  
  public getSignedRequest(file: File, projectId: string){
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', `api/upload/sign-s3?project-id=${encodeURIComponent(projectId)}&file-extension=${file.type}&file-type=source`);
      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve({
              file: file,
              response: response
            });
          }else{
            console.log('could not sign file request');
          }
        }
      };
      xhr.send();
    });
  }

  public uploadFile(file: File, signedRequest: string): Observable<any>{
    return Observable.create( observer => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', signedRequest);

      xhr.onreadystatechange = () => {
        if(xhr.readyState === 4) {
          if(xhr.status === 200) {
            observer.next(xhr.response);
            observer.complete();
          } else{
            console.log(xhr.responseText);
            console.log('could not upload file');
          }
        };
      };

      xhr.upload.onprogress = (event) => {
        this.progress = Math.round(event.loaded / event.total * 100);
        
        this.progressObserver
          .next(this.progress)
        };

      xhr.upload.onerror = (e) => { observer.error(e);}
      xhr.upload.ontimeout = (e) => { observer.error(e);}

      xhr.send(file);
    });
  }
}