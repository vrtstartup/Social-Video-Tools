import { Routes, RouterModule } from '@angular/router';
import { RoleGuard } from '../../common/guards/role.guard';

import { SubtitlesComponent } from '../../views/public/subtitles/subtitles.component';
import { ProjectsComponent } from '../../views/public/subtitles/components/projects.component';
import { DashboardComponent } from '../../views/public/admin/dashboard.component';
import { UsersComponent } from '../../views/public/admin/users.component';
import { AuthComponent } from '../../views/public/auth/authentication.component';
import { DownloadComponent } from '../../views/public/download/download.component';

import AllowedRoles from '../../common/models/roles';

const appRoutes: Routes = [
    { path: 'projects', component: ProjectsComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user'] } },
    { path: '', component: ProjectsComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']} },
    { path: 'subtitles', component: SubtitlesComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']} },
    { path: 'subtitles/:id', component: SubtitlesComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']} },
    { path: 'auth', component: AuthComponent },
    { path: 'download/:id', component: DownloadComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']} },
    { path: 'admin', component: DashboardComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['admin']}},
    { path: 'admin/users', component: UsersComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['admin']}},
    // { path: 'admin/projects', component: ProjectListComponent, canActivate: [RoleGuard], data: { roles: ['user','tester','admin']}},
];

export const routing = RouterModule.forRoot(appRoutes);