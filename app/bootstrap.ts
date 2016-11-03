import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app.module';

//log config in front
import config from './config/config';

if( config.env == 'development') { 
    console.log(config);
}

platformBrowserDynamic().bootstrapModule(AppModule);