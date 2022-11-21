import { Component } from '@angular/core';
import { Title, Meta, MetaDefinition } from '@angular/platform-browser';

import { FirebaseService } from './firebase.service';

import { sha512 } from 'js-sha512';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  appName = 'MyFirebaseApp';
  pageMeta: MetaDefinition = {};

  isLoggedIn = false;
  isAdmin = false;

  settingsList: never | any = [];

  constructor(private title: Title, private meta: Meta, private firebase: FirebaseService) { }

  ngOnInit(): void {
    this.checkAppInitialized((initialized: any) => {
      if (!initialized) {
        this.initApp();
      }
    });
    this.checkUserLogged();
    this.firebase.getSettings().then((snapshot) => {
      this.settingsList = [];
      const settings = snapshot.exportVal();
      for (const key in settings) {
        this.settingsList.push({ key: key, value: settings[key] });
      }
      this.settingsList.forEach((setting: any) => {
        if (setting.value.name == 'app_title') {
          this.title.setTitle(setting.value.value);
        }
        if (setting.value.name == 'app_name') {
          this.appName = setting.value.value;
        }
        if (setting.value.name == 'app_description') {
          this.pageMeta = { name: 'description', content: setting.value.value };
          this.meta.updateTag(this.pageMeta);
        }
      });
    }).catch(() => {});
  }

  checkAppInitialized(callback: any) {
    var result: boolean = true;
    const checkList = ['app_name', 'app_title', 'app_description', 'firebase_storage_url', 'images_width', 'images_height'];
    this.firebase.getSettings().then((snapshot) => {
      this.settingsList = [];
      const settings = snapshot.exportVal();
      for (const key in settings) {
        this.settingsList.push({ key: key, value: settings[key] });
      }
      this.settingsList.forEach((setting: any) => {
        if (checkList.indexOf(setting.value.name) == -1) {
          result = false;
        }
      });
      result &&= this.settingsList.length > 0;
      callback(result);
    }).catch(() => {});
  }

  initApp() {
    const settings = [
      { key: 'app_name', value: 'FirebaseApp' },
      { key: 'app_title', value: 'Firebase App | Google Cloud Hosting' },
      { key: 'app_description', value: 'Angular Application on Firebase Hosting' },
      { key: 'firebase_storage_url', value: 'https://firebasestorage.googleapis.com' },
      { key: 'images_width', value: '64' },
      { key: 'images_height', value: '64' },
    ];
    settings.forEach((setting) => {
      const uid = sha512.create().update(setting.key).hex().substring(0, 32);
      const settingItem = { id: uid, name: setting.key, value: setting.value, modified: Date.now() };
      this.firebase.saveSetting(settingItem).then(() => {}).catch(() => {});
    });
  }

  checkUserLogged() {
    const user = localStorage.getItem('user') || '';
    if (user) {
      const userInfo = JSON.parse(user);
      this.checkIsAdmin(userInfo, (res: any) => {
        this.isAdmin = res;
      });
      this.isLoggedIn = true;
    }
    else {
      this.isAdmin = false;
      this.isLoggedIn = false;
    }
  }

  checkIsAdmin(userInfo: any, callback: any) {
    this.firebase.getUser(userInfo.uid).then((snapshot) => {
      if (snapshot.exists()) {
        const details = snapshot.exportVal();
        callback(details.status == 1);
      }
      else {
        callback(false);
      }
    });
  }

  getSorted(sourceList: any[], sortField: string, ascending: boolean): any[] {
    var result: any[] = [];
    var orderedIndex: any[] = [];
    for (var i = 0; i < sourceList.length; i++) {
      var lastValue = 0, lastIndex = 0;
      sourceList.forEach((item: any, idx: any) => {
        if (item.value[sortField] > lastValue.toString()) {
          if (orderedIndex.indexOf(idx) == -1) {
            lastValue = item.value[sortField];
            lastIndex = idx;
          }
        }
      });
      orderedIndex.push(lastIndex);
    }
    for (var i = 0; i < orderedIndex.length; i++) {
      result.push(sourceList[orderedIndex[i]]);
    }
    return ascending ? result.reverse() : result;
  }
}
