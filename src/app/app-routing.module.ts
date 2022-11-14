import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { ContactComponent } from './contact/contact.component';
import { HomeComponent } from './home/home.component';
import { ImagesComponent } from './images/images.component';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { PageComponent } from './page/page.component';
import { PagesComponent } from './pages/pages.component';
import { RegisterComponent } from './register/register.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';
import { BackupComponent } from './backup/backup.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'pages', component: PagesComponent },
  { path: 'page/:id', component: PageComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'images', component: ImagesComponent },
  { path: 'backup', component: BackupComponent },
  { path: '**', component: HomeComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
