import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  userInfo = { uid: null, email: '', role: '', createdAt: null, lastLoginAt: null, stsTokenManager: { accessToken: '', expirationTime: null, refreshToken: '' } };
  isLoggedIn = false;
  isAdmin = false;
  usersList: never | any = [];
  fullList: never | any = [];
  resume = false;
  success = false;
  message = '';
  searchForm = new FormGroup({
    search: new FormControl('')
  });
  search: string = '';

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
        this.showUsers();
      });
      this.isLoggedIn = true;
    }
    else {
      this.router.navigateByUrl("/login");
      this.isLoggedIn = false;
    }
  }

  showUsers() {
    this.resume = false;
    this.firebase.getUsers().then((snapshot) => {
      this.usersList = [];
      const users = snapshot.exportVal();
      if (this.isAdmin) {
        for (const key in users) {
          this.usersList.push({ key: key, value: users[key] });
        }  
      }
      else {
        for (const key in users) {
          if (this.userInfo.uid == key) {
            this.usersList.push({ key: key, value: users[key] });
          }
        }
      }
      this.fullList = this.usersList;
      this.filter();
      setTimeout(() => {
        document.getElementById('search')?.focus();        
      }, 500);  
      this.resume = true;
      this.success = true;
    }).catch((error) => {
      this.resume = true;
      this.success = false;
      this.message = error.message;
    });
  }

  editUser(user: any) {
    this.resume = false;
    if (this.userInfo.uid != user.key) {
      user.value.status = 1 - user.value.status;
      this.firebase.updateUser(user.key, user.value.email, user.value.status, user.value.token, user.value.createdAt, user.value.lastLoginAt).then(() => {
        this.showUsers();
        this.resume = true;
        this.success = true;
        this.message = 'User updated successfully.';
      }).catch((error) => {
        this.resume = true;
        this.success = false;
        this.message = error.message;
      });  
    }
    else {
      this.resume = true;
      this.success = false;
      this.message = 'You cannot change your own role.';
    }
  }

  filter(): void {
    this.search = this.searchForm.value.search?.toLowerCase() || '';
    this.usersList = this.fullList.filter((item: any) => {
      return item.value.email.toLowerCase().includes(this.search);
    });
  }
}
