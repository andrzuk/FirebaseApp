# FirebaseApp
Angular App hosted on Firebase using Email / Password Auth and Realtime Database and Storage.

## Init Application

```bash
# install Angular CLI:
npm install -g @angular/cli

# install App:
ng new MyFirebaseApp
cd MyFirebaseApp

# install required packages:
## Firebase:
ng add @angular/fire
## Firebase Tools:
npm install -g firebase-tools
## Angular CDK:
npm install @angular/cdk
## SHA-512:
npm i js-sha512
``` 

## Connect App to Firesbase

```bash
## Connection Object in src/environments/environment.ts:
export const environment = {
  firebase: {
    apiKey: "{your-api-key}",
    authDomain: "{your-auth-domain}",
    projectId: "{your-project-id}",
    storageBucket: "{your-storage-bucket}",
    messagingSenderId: "{your-messaging-sender}",
    appId: "{your-app-id}",
    databaseURL: "{your-database-url}",
    measurementId: "{your-measurement-id}",
  },
  production: false
};
``` 

## Firebase Services

```bash
## Realtime Database Rules:
{
  "rules": {
    ".read": "true",
    ".write": "auth.uid !== null"
  }
}
## Firestore Rules:
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if resource.contentType.matches('image/.*');
      allow write: if request.auth != null;
    }
  }
}
``` 

## Firebase CLI commands

```bash
firebase login
firebase init
firebase deploy
``` 
