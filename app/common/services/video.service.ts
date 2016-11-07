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

  public makeFileRequest (url: string, file: File, projectId: string): Observable<any> {
    return Observable.create( observer => {
      let formData: FormData = new FormData()
      let xhr: XMLHttpRequest = new XMLHttpRequest()

      // order is super important here
      // server needs to know projectId before it can store the 
      // video file in it's proper location
      formData.append('projectId', projectId);
      formData.append('video', file);

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            observer.next(JSON.parse(xhr.response));
            observer.complete();
          } else {
            observer.error(xhr.response);
          }
        }
      };

      xhr.upload.onprogress = (event) => {
        this.progress = Math.round(event.loaded / event.total * 100);

        this.progressObserver
          .next(this.progress)
      };

      xhr.open('POST', url, true);
      xhr.send(formData);
    });
  }
}