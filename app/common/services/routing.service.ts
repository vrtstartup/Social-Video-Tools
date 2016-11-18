import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../common/services/auth-guard.service';

import { SubtitlesComponent } from '../../views/public/subtitles/subtitles.component';
import { AuthComponent } from '../../views/public/auth/authentication.component';

const appRoutes: Routes = [
    { path: 'subtitles', component: SubtitlesComponent, canActivate: [AuthGuard] },
    { path: 'auth', component: AuthComponent },
    { path: '', component: AuthComponent },
];

export const routing = RouterModule.forRoot(appRoutes);