import {Injectable} from "@angular/core";
import {BrowserXhr} from "@angular/http";

@Injectable()
/**
 * @author AhsanAyaz
 * Extend BrowserXhr to support CORS
 */
export class ExtBrowserXhr extends BrowserXhr {
  constructor() {
      super();
  }
  build(): any {
    let xhr = super.build();
    xhr.withCredentials = true;
    return <any>(xhr);
  }
}
