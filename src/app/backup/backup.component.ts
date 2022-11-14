import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

import { sha512 } from 'js-sha512';

@Component({
  selector: 'app-backup',
  templateUrl: './backup.component.html',
  styleUrls: ['./backup.component.scss']
})
export class BackupComponent implements OnInit {

  userInfo = { uid: null, email: '', role: '', createdAt: null, lastLoginAt: null, stsTokenManager: { accessToken: '', expirationTime: null, refreshToken: '' } };
  isLoggedIn = false;
  isAdmin = false;
  settingsList: never | any = [];
  usersList: never | any = [];
  pagesList: never | any = [];
  archivesList: never | any = [];
  imagesList: never | any = [];
  backupFileContent: any = null;
  selectedFile: any;
  myReader: any;
  backupForm = new FormGroup({
    file: new FormControl(''),
  });
  action = '';
  pending = false;
  resume = false;
  saved = false;
  restored = false;
  success = false;
  message = '';

  constructor(private firebase: FirebaseService, private router: Router, private appComponent: AppComponent) { }

  ngOnInit(): void {
    this.checkUserLogged();
    this.myReader = new FileReader();
  }

  checkUserLogged() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.appComponent.checkIsAdmin(this.userInfo, (res: any) => {
        this.isAdmin = res;
        this.showPanel();
      });
      this.isLoggedIn = true;
    }
    else {
      this.router.navigateByUrl("/login");
      this.isLoggedIn = false;
    }
  }

  showPanel() {
    this.action = 'panel';
    this.pending = false;
    this.resume = false;
    this.selectedFile = null;
    this.backupForm.controls.file.reset();
    this.backupForm.setValue({ file: '' });
    setTimeout(() => {
      document.getElementById('file')?.focus();        
    }, 500);
  }

  onFileSelected(event: any) {
    this.selectedFile = null;
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
    this.pending = false;
    this.message = '';
  }

  saveBackup() {
    this.backupFileContent = [];
    this.firebase.getSettings().then((snapshot) => {
      this.settingsList = [];
      const settings = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in settings) {
          this.settingsList.push({ key: key, value: settings[key] });
        }
        const backup = { collection: 'settings', items: this.settingsList };
        this.backupFileContent.push(backup);
        this.checkCompleted();
      }
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
    this.firebase.getUsers().then((snapshot) => {
      this.usersList = [];
      const users = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in users) {
          this.usersList.push({ key: key, value: users[key] });
        }
        const backup = { collection: 'users', items: this.usersList };
        this.backupFileContent.push(backup);
        this.checkCompleted();
      }
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
    this.firebase.getPages().then((snapshot) => {
      this.usersList = [];
      const pages = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in pages) {
          this.pagesList.push({ key: key, value: pages[key] });
        }
        const backup = { collection: 'pages', items: this.pagesList };
        this.backupFileContent.push(backup);
        this.checkCompleted();
      }
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
    this.firebase.getArchives().then((snapshot) => {
      this.archivesList = [];
      const archives = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in archives) {
          this.archivesList.push({ key: key, value: archives[key] });
        }
        const backup = { collection: 'archives', items: this.archivesList };
        this.backupFileContent.push(backup);
        this.checkCompleted();
      }
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
    this.firebase.getImages().then((snapshot) => {
      this.imagesList = [];
      const images = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in images) {
          this.imagesList.push({ key: key, value: images[key] });
        }
        const backup = { collection: 'images', items: this.imagesList };
        this.backupFileContent.push(backup);
        this.checkCompleted();
      }
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
  }

  checkCompleted() {
    const uid = sha512.create().update((new Date()).toTimeString()).hex().substring(0, 16);
    if (this.backupFileContent.length == 5) {
        const output = JSON.stringify(this.backupFileContent);
        this.saveText(output, 'Backup_' + uid + '.json');
        this.resume = true;
        this.success = true;
        this.message = 'Backup was saved successfully.';
        this.saved = true;
    }
  }

  loadBackup() {
    const fb = this.firebase;
    this.myReader.readAsText(this.selectedFile);
    this.myReader.onloadend = function (e: any) {
      const backup = e.target.result;
      this.backupFileContent = JSON.parse(backup);
      this.backupFileContent.forEach((item: any) => {
        if (item.collection == 'settings') {
          item.items.forEach((doc: any) => {
            const setting = { id: doc.key, name: doc.value.name, value: doc.value.value, modified: doc.value.modified };
            fb.saveSetting(setting).then(() => {}).catch((error: any) => {});
          });
        }
        if (item.collection == 'users') {
          item.items.forEach((doc: any) => {
            const user = { id: doc.key, email: doc.value.email, status: doc.value.status, token: doc.value.token, createdAt: doc.value.createdAt, lastLoginAt: doc.value.lastLoginAt };
            fb.updateUser(user.id, user.email, user.status, user.token, user.createdAt, user.lastLoginAt).then(() => {}).catch((error: any) => {});
          });
        }
        if (item.collection == 'pages') {
          item.items.forEach((doc: any) => {
            const page = { id: doc.key, type: doc.value.type, title: doc.value.title, content: doc.value.content, modified: doc.value.modified };
            fb.savePage(page).then(() => {}).catch((error: any) => {});
          });
        }
        if (item.collection == 'archives') {
          item.items.forEach((doc: any) => {
            const archive = { id: doc.key, pageId: doc.value.pageId, type: doc.value.type, title: doc.value.title, content: doc.value.content, modified: doc.value.modified, archived: doc.value.archived };
            fb.saveArchive(archive).then(() => {}).catch((error: any) => {});
          });
        }
        if (item.collection == 'images') {
          item.items.forEach((doc: any) => {
            const image = { id: doc.key, bucket: doc.value.bucket, contentType: doc.value.contentType, fullPath: doc.value.fullPath, generation: doc.value.generation, name: doc.value.name, size: doc.value.size, width: doc.value.width, height: doc.value.height, timeCreated: doc.value.timeCreated, updated: doc.value.updated, modified: doc.value.modified };
            fb.saveImage(image).then(() => {}).catch((error: any) => {});
          });
        }
      });
    }
    this.restored = true;
    this.resume = true;
    this.success = true;
    this.message = 'Backup was restored successfully.';
  }

  cancelBackup() {
    this.router.navigateByUrl("/login");
  }

  saveText(text: string, filename: string) {
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click();
  }
}
