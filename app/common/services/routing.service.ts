import { Routes, RouterModule } from '@angular/router';
import { RoleGuard } from '../../common/guards/role.guard';

import { ProjectComponent } from '../../views/public/project/project.component';
import { ProjectsComponent } from '../../views/public/projects/projects.component';
import { LoginComponent } from '../../views/public/login/login.component';
import { DownloadComponent } from '../../views/public/download/download.component';
import { AdminComponent } from '../../views/admin/admin.component';
import { DashboardComponent } from '../../views/admin/dashboard.component';
import { UsersComponent } from '../../views/admin/users.component';

import AllowedRoles from '../../common/models/roles';

const appRoutes: Routes = [
    { path: 'projects', component: ProjectsComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']}},
    { path: '', redirectTo: '/projects', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'project', component: ProjectComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']}},
    { path: 'project/:id', component: ProjectComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']}},
    { path: 'download/:id', component: DownloadComponent, canActivate: [RoleGuard], data: { roles: AllowedRoles['user']}},
    { path: 'admin',
        component: AdminComponent,
        canActivate: [RoleGuard], 
        data: { roles: AllowedRoles['admin']},
        children: [
            { path: '', component: DashboardComponent },
            { path: 'users', component: UsersComponent },
        ],
    },
    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];

export const routing = RouterModule.forRoot(appRoutes);