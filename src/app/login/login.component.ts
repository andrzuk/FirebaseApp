import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  signInForm = new FormGroup({
    email: new FormControl(''),
    password: new FormControl(''),
  });

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

  signIn() {
    this.pending = true;
    const email = this.signInForm.value.email || '';
    const password = this.signInForm.value.password || '';
    this.firebase.signIn(email, password).then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('user', JSON.stringify(user));
      this.router.navigateByUrl("/admin");
      this.appComponent.isLoggedIn = true;
      this.appComponent.checkUserLogged();
      var info: any = {};
      const infoKeys = Object.keys(user);
      const infoValues = Object.values(user);
      for (var i = 0; i < infoKeys.length; i++) {
        if (infoKeys[i] == 'metadata') {
          info = infoValues[i];
        }
      }
      this.firebase.getUser(user.uid).then((snapshot) => {
        if (snapshot.exists()) {
          const details = snapshot.exportVal();
          this.firebase.updateUser(user.uid, details.email, details.status, details.token, parseInt(info.createdAt), parseInt(info.lastLoginAt)).then(() => {}).catch((error) => {});
        }
      });
    }).catch((error) => {
      this.pending = false;
      this.signInForm.controls.password.reset();
      this.message = error.message;
      this.appComponent.isLoggedIn = false;
    });
  }
}
