import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

import { sha512 } from 'js-sha512';

import { getStorage, ref, uploadBytes, deleteObject } from "@angular/fire/storage";

@Component({
  selector: 'app-images',
  templateUrl: './images.component.html',
  styleUrls: ['./images.component.scss']
})
export class ImagesComponent implements OnInit {

  userInfo = { uid: null, email: '', role: '', createdAt: null, lastLoginAt: null, stsTokenManager: { accessToken: '', expirationTime: null, refreshToken: '' } };
  isLoggedIn = false;
  isAdmin = false;
  selectedFile: any;
  imagesList: never | any = [];
  imagesListSorted: never | any = [];
  imageForm = new FormGroup({
    id: new FormControl(''),
    file: new FormControl(''),
  });
  imageInfo: never | any = {};
  storageUrl: string = '';
  imgSize = { width: 0, height: 0 };
  listItemSize = { width: 0, height: 0 };
  action = '';
  pending = false;
  resume = false;
  success = false;
  message = '';
  filename = '';
  link = '';

  settingsList: never | any = [];

  constructor(private firebase: FirebaseService, private router: Router, private appComponent: AppComponent, private clipboard: Clipboard) { }

  ngOnInit(): void {
    this.checkUserLogged();
    this.firebase.getSettings().then((snapshot) => {
      this.settingsList = [];
      const settings = snapshot.exportVal();
      for (const key in settings) {
        this.settingsList.push({ key: key, value: settings[key] });
      }
      this.settingsList.forEach((setting: any) => {
        if (setting.value.name == 'firebase_storage_url') {
          this.storageUrl = setting.value.value;
        }
        if (setting.value.name == 'images_width') {
          this.listItemSize.width = parseInt(setting.value.value);
        }
        if (setting.value.name == 'images_height') {
          this.listItemSize.height = parseInt(setting.value.value);
        }
      });
    }).catch((error) => {});
  }

  checkUserLogged() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.appComponent.checkIsAdmin(this.userInfo, (res: any) => {
        this.isAdmin = res;
        this.showImages();
      });
      this.isLoggedIn = true;
    }
    else {
      this.router.navigateByUrl("/login");
      this.isLoggedIn = false;
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = null;
    const file: File = event.target.files[0];
    if (file) {
      var objectURL = URL.createObjectURL(file);
      var img = new Image();
      img.src = objectURL;
      img.onload = () => {
        this.imgSize.width = img.width;
        this.imgSize.height = img.height;
      };
      this.selectedFile = file;
    }
    this.pending = false;
    this.message = '';
  }

  showImages() {
    this.resume = false;
    this.action = 'list';
    this.firebase.getImages().then((snapshot) => {
      this.imagesList = [];
      const images = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in images) {
          this.imagesList.push({ key: key, value: images[key] });
        }
      }
      this.imagesListSorted = this.appComponent.getSorted(this.imagesList);
      this.resume = true;
      this.success = true;
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
  }

  addImage() {
    this.action = 'edit';
    this.pending = false;
    this.resume = false;
    this.selectedFile = null;
    this.imageForm.controls.file.reset();
    const uid = sha512.create().update((new Date()).toTimeString()).hex().substring(0, 32);
    this.imageForm.setValue({ id: uid, file: '' });
    setTimeout(() => {
      document.getElementById('file')?.focus();        
    }, 500);
  }

  checkImageExist(filename: string) {
    var result: boolean = false;
    this.imagesList.forEach((item: any) => {
      if (item.value.name == filename) {
        result = true;
      }
    });
    return result;
  }

  saveImage() {
    if (this.selectedFile) {
      if (this.checkImageExist(this.selectedFile.name)) {
        this.message = 'Selected file already exists.';
        this.pending = true;
        this.success = false;
        setTimeout(() => {
          document.getElementById('file')?.focus();        
        }, 500);    
        return;
      }
      this.pending = true;
      this.resume = false;
      this.success = true;
      this.message = 'Upload is being performed...';
      const storage = getStorage();
      const storageRef = ref(storage, this.selectedFile.name);
      uploadBytes(storageRef, this.selectedFile).then((snapshot) => {
        const bucket = snapshot.metadata.bucket;
        const contentType = snapshot.metadata.contentType;
        const fullPath = snapshot.metadata.fullPath;
        const generation = snapshot.metadata.generation;
        const name = snapshot.metadata.name;
        const size = snapshot.metadata.size;
        const timeCreated = snapshot.metadata.timeCreated;
        const updated = snapshot.metadata.updated;
        const image = { id: this.imageForm.controls.id.value, bucket: bucket, contentType: contentType, fullPath: fullPath, generation: generation, name: name, size: size, width: this.imgSize.width, height: this.imgSize.height, timeCreated: timeCreated, updated: updated, modified: Date.now() };
        this.firebase.saveImage(image).then(() => {
          this.showImages();
          this.pending = false;
          this.success = true;
          this.message = 'Upload has finished successfully.';
        }).catch((error) => {
          this.pending = false;
          this.resume = true;
          this.success = false;
          this.message = error.message;
        });  
      }).catch((error) => {
        this.pending = false;
        this.success = false;
        this.message = error.message;
      });
    }
  }

  deleteImage(image: any) {
    this.action = 'delete';
    this.resume = false;
    this.pending = true;
    this.firebase.getImage(image.key).then((snapshot) => {
      const key = snapshot.key;
      const image = snapshot.exportVal();
      this.imageForm.setValue({ id: key, file: image.name });
      this.resume = true;
      this.pending = false;
    }).catch((error) => {});
  }

  removeImage() {
    this.pending = true;
    const id = this.imageForm.value.id || '';
    const filename = this.imageForm.value.file || '';
    const storage = getStorage();
    const storageRef = ref(storage, filename);
    deleteObject(storageRef).then(() => {
      if (id) {
        this.firebase.removeImage(id).then(() => {
          this.showImages();
          this.message = 'Image was removed successfully.';
        }).catch((error) => {
          this.pending = false;
          this.message = error.message;
        });
      }
    }).catch((error) => {
      this.pending = false;
      this.message = error.message;
    });
  }

  cancelImage() {
    this.action = 'list';
    this.message = '';
  }

  showImage(image: any) {
    this.action = 'preview';
    this.firebase.getImage(image.key).then((snapshot) => {
      const key = snapshot.key;
      const image = snapshot.exportVal();
      this.imageInfo = { key: key, bucket: image.bucket, name: image.name, size: image.size, width: image.width, height: image.height };
      this.link = this.storageUrl + '/v0/b/' + this.imageInfo.bucket + '/o/' + this.imageInfo.name + '?alt=media';
      this.filename = this.imageInfo.name;
    }).catch((error) => {});
  }

  copyLink(link: string) {
    this.clipboard.copy(link);
  }

  copyImage(image: any) {
    const link = this.storageUrl + '/v0/b/' + image.value.bucket + '/o/' + image.value.name + '?alt=media';
    this.clipboard.copy(link);
  }

  downloadLink(link: string, filename: string) {
    var a = document.createElement('a');
    a.href = link;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadImage(image: any) {
    const link = this.storageUrl + '/v0/b/' + image.value.bucket + '/o/' + image.value.name + '?alt=media';
    var a = document.createElement('a');
    a.href = link;
    a.download = image.value.name;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
