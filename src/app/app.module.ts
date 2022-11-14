import { NgModule } from '@angular/core';
import { BrowserModule, Title, Meta } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { environment } from '../environments/environment';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LogoutComponent } from './logout/logout.component';
import { AdminComponent } from './admin/admin.component';
import { SettingsComponent } from './settings/settings.component';
import { UsersComponent } from './users/users.component';
import { PagesComponent } from './pages/pages.component';
import { SanitizeHtmlPipe } from './sanitize-html.pipe';
import { PageComponent } from './page/page.component';
import { ContactComponent } from './contact/contact.component';
import { ImagesComponent } from './images/images.component';
import { NumberFormatPipe } from './number-format.pipe';
import { BackupComponent } from './backup/backup.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    LogoutComponent,
    AdminComponent,
    SettingsComponent,
    UsersComponent,
    PagesComponent,
    SanitizeHtmlPipe,
    PageComponent,
    ContactComponent,
    ImagesComponent,
    NumberFormatPipe,
    BackupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideStorage(() => getStorage()),
    provideFirestore(() => getFirestore())
  ],
  providers: [Title, Meta],
  bootstrap: [AppComponent]
})
export class AppModule { }
