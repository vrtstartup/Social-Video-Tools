import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../../common/guards/auth';
import { NoAuthGuard } from '../../common/guards/noAuth';
import { AdminGuard } from '../../common/guards/admin';

import { SubtitlesComponent } from '../../views/public/subtitles/subtitles.component';
import { AdminComponent } from '../../views/public/admin/admin.component';
import { AuthComponent } from '../../views/public/auth/authentication.component';
import { DownloadComponent } from '../../views/public/download/download.component';

const appRoutes: Routes = [
    { path: 'subtitles', component: SubtitlesComponent, canActivate: [AuthGuard] },
    { path: 'subtitles/:id', component: SubtitlesComponent, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminComponent, canActivate: [AdminGuard]},
    { path: 'auth', component: AuthComponent, canActivate: [NoAuthGuard] },
    { path: 'download/:id', component: DownloadComponent },
    { path: '', component: SubtitlesComponent, canActivate: [AuthGuard]},
];

export const routing = RouterModule.forRoot(appRoutes);