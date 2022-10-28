import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

import { sha512 } from 'js-sha512';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  signUpForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

  supervisorStatus = 0;
  usersList: never | any = [];
  pending = false;
  message = '';

  constructor(private firebase: FirebaseService, private router: Router, public appComponent: AppComponent) { }

  ngOnInit(): void {
    this.checkUserLogged();
  }

  checkUserLogged() {
    const user = localStorage.getItem('user');
    if (user) {
      this.appComponent.isLoggedIn = true;
      this.router.navigateByUrl("/admin");
    }
    else {
      setTimeout(() => {
        document.getElementById('email')?.focus();        
      }, 500);
      this.appComponent.isLoggedIn = false;
    }
  }

  signUp() {
    this.pending = true;
    const email = this.signUpForm.value.email || '';
    const password = this.signUpForm.value.password || '';
    const token = sha512.create().update(email + password).hex();
    this.firebase.signUp(email, password).then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigateByUrl("/admin");
      this.appComponent.isLoggedIn = true;
      var info: any = {};
      const infoKeys = Object.keys(user);
      const infoValues = Object.values(user);
      for (var i = 0; i < infoKeys.length; i++) {
        if (infoKeys[i] == 'metadata') {
          info = infoValues[i];
        }
      }
      this.firebase.getUsers().then((snapshot) => {
        this.usersList = [];
        const users = snapshot.exportVal();
        for (const key in users) {
          this.usersList.push({ key: key, value: users[key] });
        }
        this.supervisorStatus = 1;
        this.usersList.forEach((item: any) => {
          if (item.value.status) {
            this.supervisorStatus = 0;
          }
        });
        const newUser: any = { uid: user.uid, email: user.email, status: this.supervisorStatus, createdAt: parseInt(info.createdAt), lastLoginAt: parseInt(info.lastLoginAt) };
        this.firebase.addUser(newUser, token).then(() => {}).catch((error) => {
          this.message = error.message;
          this.appComponent.isLoggedIn = false;
        });
      }).catch((error) => {
        this.pending = false;
        this.signUpForm.controls.password.reset();
        this.message = error.message;
        this.appComponent.isLoggedIn = false;
      });
    }).catch((error) => {
      this.pending = false;
      this.signUpForm.controls.password.reset();
      this.message = error.message;
      this.appComponent.isLoggedIn = false;
    });
  }
}
