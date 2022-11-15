import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

import { sha512 } from 'js-sha512';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit {

  userInfo = { uid: null, email: '', role: '', createdAt: null, lastLoginAt: null, stsTokenManager: { accessToken: '', expirationTime: null, refreshToken: '' } };
  isLoggedIn = false;
  isAdmin = false;
  pagesList: never | any = [];
  pagesListSorted: never | any = [];
  fullList: never | any = [];
  pageForm = new FormGroup({
    id: new FormControl(''),
    type: new FormControl(''),
    title: new FormControl(''),
    content: new FormControl(''),
  });
  pageId: string | null = '';
  archivesList: never | any = [];
  archivesListSorted: never | any = [];
  archiveForm = new FormGroup({
    id: new FormControl(''),
    pageId: new FormControl(''),
    type: new FormControl(''),
    title: new FormControl(''),
    content: new FormControl(''),
    modified: new FormControl(''),
  });
  action = '';
  resume = false;
  success = false;
  message = '';
  key: string | null = '';
  link = '';
  searchForm = new FormGroup({
    search: new FormControl('')
  });
  search: string = '';

  constructor(private firebase: FirebaseService, private router: Router, private appComponent: AppComponent, private clipboard: Clipboard) { }

  ngOnInit(): void {
    this.checkUserLogged();
  }

  checkUserLogged() {
    const user = localStorage.getItem('user');
    if (user) {
      this.userInfo = JSON.parse(user);
      this.appComponent.checkIsAdmin(this.userInfo, (res: any) => {
        this.isAdmin = res;
        this.showPages();
      });
      this.isLoggedIn = true;
    }
    else {
      this.router.navigateByUrl("/login");
      this.isLoggedIn = false;
    }
  }

  showPages() {
    this.resume = false;
    this.action = 'list';
    this.firebase.getPages().then((snapshot) => {
      this.pagesList = [];
      const pages = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in pages) {
          this.pagesList.push({ key: key, value: pages[key] });
        }  
      }
      this.pagesListSorted = this.appComponent.getSorted(this.pagesList);
      this.fullList = this.pagesListSorted;
      this.filter();
      this.resume = true;
      this.success = true;
      setTimeout(() => {
        document.getElementById('search')?.focus();        
      }, 500);
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
  }

  addPage() {
    this.action = 'edit';
    this.key = null;
    const uid = sha512.create().update((new Date()).toTimeString()).hex().substring(0, 32);
    this.pageForm.controls.type.reset();
    this.pageForm.controls.title.reset();
    this.pageForm.controls.content.reset();
    this.pageForm.setValue({ id: uid, type: 'Regular', title: '', content: '' });
    setTimeout(() => {
      document.getElementById('title')?.focus();        
    }, 500);
  }

  editPage(page: any) {
    this.action = 'edit';
    this.resume = false;
    this.firebase.getPage(page.key).then((snapshot) => {
      const key = snapshot.key;
      const page = snapshot.exportVal();
      this.key = key;
      this.pageForm.setValue({ id: key, type: page.type, title: page.title, content: page.content });
      this.link = '/page/' + key;
      this.resume = true;
      setTimeout(() => {
        document.getElementById('title')?.focus();        
      }, 500);  
    }).catch((error) => {});
  }

  savePage() {
    const id = this.pageForm.value.id;
    const type = this.pageForm.value.type;
    const title = this.pageForm.value.title?.trim();
    const content = this.pageForm.value.content?.trim();
    if (title && content) {
      const page = { id: id, type: type, title: title, content: content, modified: Date.now() };
      this.firebase.savePage(page).then(() => {
        this.showPages();
        this.message = 'Page was saved successfully.';
      }).catch((error) => {
        this.message = error.message;
      });
    }
    else {
      this.message = 'Title and contents are required.';
      this.resume = true;
      this.success = false;
    }
  }

  deletePage(page: any) {
    this.action = 'delete';
    this.resume = false;
    this.firebase.getPage(page.key).then((snapshot) => {
      const key = snapshot.key;
      const page = snapshot.exportVal();
      this.pageId = key;
      this.pageForm.setValue({ id: key, type: page.type, title: page.title, content: page.content });
      this.resume = true;
    }).catch((error) => {});
  }

  removePage() {
    const id = this.pageForm.value.id || '';
    if (id) {
      this.firebase.getArchives().then((snapshot) => {
        var canDelete: boolean = true;
        const archives = snapshot.exportVal();
        for (const key in archives) {
          if (archives[key]['pageId'] == this.pageId) {
            canDelete = false;
          }
        }
        if (canDelete) {
          this.firebase.removePage(id).then(() => {
            this.showPages();
            this.success = true;
            this.message = 'Page was removed successfully.';
          }).catch((error) => {
            this.message = error.message;
          });      
        }
        else {
          this.success = false;
          this.message = 'You cannot delete this page until there are related archives.';
        }
      }).catch((error) => {
        this.success = false;
        this.message = error.message;
      });  
    }
  }

  cancelPage() {
    this.action = 'list';
    this.message = '';
  }

  copyLink(link: string) {
    this.clipboard.copy(link);
  }

  copyPage(page: any) {
    const link = this.link = '/page/' + page.key;
    this.clipboard.copy(link);
  }

  showArchives(page: any) {
    this.resume = false;
    this.action = 'archives';
    this.message = '';
    this.firebase.getArchives().then((snapshot) => {
      this.archivesList = [];
      const archives = snapshot.exportVal();
      for (const key in archives) {
        if (archives[key]['pageId'] == page.key) {
          this.archivesList.push({ key: key, value: archives[key] });
        }
      }
      this.archivesListSorted = this.appComponent.getSorted(this.archivesList);
      this.pageId = page.key;
      this.resume = true;
      this.success = true;
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
  }

  editArchive(archive: any) {
    this.action = 'modify';
    this.resume = false;
    this.firebase.getArchive(archive.key).then((snapshot) => {
      const key = snapshot.key;
      const archive = snapshot.exportVal();
      this.key = key;
      this.archiveForm.setValue({ id: key, pageId: archive.pageId, type: archive.type, title: archive.title, content: archive.content, modified: archive.modified });
      this.resume = true;
    }).catch((error) => {});
  }

  saveArchive() {
    const id = this.archiveForm.value.id;
    const pageId = this.archiveForm.value.pageId;
    const type = this.archiveForm.value.type;
    const title = this.archiveForm.value.title?.trim();
    const content = this.archiveForm.value.content?.trim();
    const modified = this.archiveForm.value.modified;
    if (title && content) {
      const archive = { id: id, pageId: pageId, type: type, title: title, content: content, modified: modified, archived: Date.now() };
      this.firebase.saveArchive(archive).then(() => {
        const owner = { key: pageId, value: null };
        this.showArchives(owner);
        this.message = 'Archive was saved successfully.';
      }).catch((error) => {
        this.message = error.message;
      });
    }
    else {
      this.message = 'Title and contents are required.';
      this.resume = true;
      this.success = false;
    }
  }

  restoreArchive(archive: any) {
    this.firebase.getArchive(archive.key).then((snapshot) => {
      const key = snapshot.key;
      const archive = snapshot.exportVal();
      const page = { id: archive.pageId, type: archive.type, title: archive.title, content: archive.content, modified: archive.modified };
      this.firebase.savePage(page).then(() => {
        this.showPages();
        this.message = 'Page was restored successfully.';
      }).catch((error) => {
        this.message = error.message;
      });
    }).catch((error) => {});
  }

  deleteArchive(archive: any) {
    this.action = 'remove';
    this.resume = false;
    this.firebase.getArchive(archive.key).then((snapshot) => {
      const key = snapshot.key;
      const archive = snapshot.exportVal();
      this.archiveForm.setValue({ id: key, pageId: archive.pageId, type: archive.type, title: archive.title, content: archive.content, modified: archive.modified });
      this.resume = true;
    }).catch((error) => {});
  }

  removeArchive() {
    const id = this.archiveForm.value.id || '';
    const pageId = this.archiveForm.value.pageId || '';
    if (id) {
      this.firebase.removeArchive(id).then(() => {
        const owner = { key: pageId, value: null };
        this.showArchives(owner);
        this.message = 'Archive was removed successfully.';
      }).catch((error) => {
        this.message = error.message;
      });
    }
  }

  archivePage(id: any) {
    const uid = sha512.create().update((new Date()).toTimeString()).hex().substring(0, 32);
    this.firebase.getPage(id).then((snapshot) => {
      const key = snapshot.key;
      const page = snapshot.exportVal();
      this.key = key;
      this.resume = true;
      const archive = { id: uid, pageId: id, type: page.type, title: page.title, content: page.content, modified: page.modified, archived: Date.now() };
      this.firebase.saveArchive(archive).then(() => {
        const owner = { key: id, value: null };
        this.showArchives(owner);
        this.message = 'Page was archived successfully.';
      }).catch((error) => {
        this.message = error.message;
      });
    }).catch((error) => {});
  }

  cancelArchive() {
    this.action = 'archives';
    this.message = '';
    setTimeout(() => {
      document.getElementById('search')?.focus();        
    }, 500);
  }

  filter(): void {
    this.search = this.searchForm.value.search?.toLowerCase() || '';
    this.pagesListSorted = this.fullList.filter((item: any) => {
      return item.value.title.toLowerCase().includes(this.search) || item.value.content.toLowerCase().includes(this.search);
    });
  }
}
