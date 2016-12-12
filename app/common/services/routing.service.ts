import { Routes, RouterModule } from '@angular/router';
import { RoleGuard } from '../../common/guards/role.guard';

import { ProjectComponent } from '../../views/public/project/project.component';
import { ProjectsComponent } from '../../views/public/projects/projects.component';
import { LoginComponent } from '../../views/public/login/login.component';
import { DownloadComponent } from '../../views/public/download/download.component';
import { AdminComponent } from '../../views/admin/admin.component';
import { DashboardComponent } from '../../views/admin/dashboard.component';
import { UsersComponent } from '../../views/admin/users.component';

const appRoutes: Routes = [
    { path: 'projects', component: ProjectsComponent, canActivate: [RoleGuard], data: { allowedRoles: 0 }},
    { path: '', redirectTo: '/projects', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'projects/:id', component: ProjectComponent, canActivate: [RoleGuard], data: { allowedRoles: 0 }},
    { path: 'download/:id', component: DownloadComponent, canActivate: [RoleGuard], data: { allowedRoles: 0 }},
    { path: 'admin',
        component: AdminComponent,
        canActivate: [RoleGuard], 
        data: { allowedRoles: 2 },
        children: [
            { path: '', component: DashboardComponent },
            { path: 'users', component: UsersComponent },
        ],
    },
    { path: '**', redirectTo: '/login', pathMatch: 'full' },
];

export const routing = RouterModule.forRoot(appRoutes);