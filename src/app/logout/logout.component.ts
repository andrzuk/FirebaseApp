import { Component, OnInit } from '@angular/core';

import { FirebaseService } from '../firebase.service';
import { Router } from "@angular/router";

import { AppComponent } from '../app.component';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {

  constructor(private firebase: FirebaseService, private router: Router, public appComponent: AppComponent) { }

  ngOnInit(): void {
    this.signOut();
  }

  signOut() {
    this.firebase.singOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigateByUrl("/home");
      this.appComponent.isLoggedIn = false;
      this.appComponent.isAdmin = false;
    }).catch((error) => {});
  }
}
