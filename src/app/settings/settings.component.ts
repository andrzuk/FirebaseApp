import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

import { sha512 } from 'js-sha512';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  userInfo = { uid: null, email: '', role: '', createdAt: null, lastLoginAt: null, stsTokenManager: { accessToken: '', expirationTime: null, refreshToken: '' } };
  isLoggedIn = false;
  isAdmin = false;
  settingsList: never | any = [];
  settingsListSorted: never | any = [];
  settingForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl(''),
    value: new FormControl(''),
  });
  action = '';
  resume = false;
  success = false;
  message = '';

  constructor(private firebase: FirebaseService, private router: Router, private appComponent: AppComponent) { }

  ngOnInit(): void {
    this.checkUserLogged();
  }

  checkUserLogged() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.appComponent.checkIsAdmin(this.userInfo, (res: any) => {
        this.isAdmin = res;
        this.showSettings();
      });
      this.isLoggedIn = true;
    }
    else {
      this.router.navigateByUrl("/login");
      this.isLoggedIn = false;
    }
  }

  showSettings() {
    this.resume = false;
    this.action = 'list';
    this.firebase.getSettings().then((snapshot) => {
      this.settingsList = [];
      const settings = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in settings) {
          this.settingsList.push({ key: key, value: settings[key] });
        }
      }
      this.settingsListSorted = this.appComponent.getSorted(this.settingsList);
      this.resume = true;
      this.success = true;
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
  }

  addSetting() {
    this.action = 'edit';
    const uid = sha512.create().update((new Date()).toTimeString()).hex().substring(0, 32);
    this.settingForm.controls.name.reset();
    this.settingForm.controls.value.reset();
    this.settingForm.setValue({ id: uid, name: '', value: '' });
    setTimeout(() => {
      document.getElementById('name')?.focus();        
    }, 500);
  }

  editSetting(setting: any) {
    this.action = 'edit';
    this.resume = false;
    this.firebase.getSetting(setting.key).then((snapshot) => {
      const key = snapshot.key;
      const setting = snapshot.exportVal();
      this.settingForm.setValue({ id: key, name: setting.name, value: setting.value });
      this.resume = true;
      setTimeout(() => {
        document.getElementById('name')?.focus();        
      }, 500);  
    }).catch((error) => {});
  }

  saveSetting() {
    const id = this.settingForm.value.id;
    const name = this.settingForm.value.name?.trim();
    const value = this.settingForm.value.value?.trim();
    if (name && value) {
      this.firebase.getSettings().then((snapshot) => {
        this.settingsList = [];
        const settings = snapshot.exportVal();
        for (const key in settings) {
          this.settingsList.push({ key: key, value: settings[key] });
        }
        var canSave: boolean = true;
        this.settingsList.forEach((setting: any) => {
          if (setting.key != id) {
            if (setting.value.name == name) {
              canSave = false;
            }  
          }
        });
        if (canSave) {
          const setting = { id: id, name: name, value: value, modified: Date.now() };
          this.firebase.saveSetting(setting).then(() => {
            this.showSettings();
            this.message = 'Setting was saved successfully.';
          }).catch((error) => {
            this.message = error.message;
          });    
        }
        else {
          this.message = 'Setting name already exists.';
          this.resume = true;
          this.success = false;
        }
      }).catch(() => {});
    }
    else {
      this.message = 'Name and value are required.';
      this.resume = true;
      this.success = false;
    }
  }

  deleteSetting(setting: any) {
    this.action = 'delete';
    this.resume = false;
    this.firebase.getSetting(setting.key).then((snapshot) => {
      const key = snapshot.key;
      const setting = snapshot.exportVal();
      this.settingForm.setValue({ id: key, name: setting.name, value: setting.value });
      this.resume = true;
    }).catch((error) => {});
  }

  removeSetting() {
    const id = this.settingForm.value.id || '';
    if (id) {
      this.firebase.removeSetting(id).then(() => {
        this.showSettings();
        this.message = 'Setting was removed successfully.';
      }).catch((error) => {
        this.message = error.message;
      });
    }
  }

  cancelSetting() {
    this.action = 'list';
    this.message = '';
  }
}
