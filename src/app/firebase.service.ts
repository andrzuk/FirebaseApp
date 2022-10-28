import { Injectable } from '@angular/core';
import { getAuth } from '@angular/fire/auth';
import { getDatabase, ref, get, set, child, remove } from '@angular/fire/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAdditionalUserInfo, UserCredential } from "firebase/auth";
import { Firestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  constructor(private firestore: Firestore) { }

  signUp(email: string, password: string) {
    const auth = getAuth();
    return createUserWithEmailAndPassword(auth, email, password);
  }

  signIn(email: string, password: string) {
    const auth = getAuth();
    return signInWithEmailAndPassword(auth, email, password);
  }

  singOut() {
    const auth = getAuth();
    return signOut(auth);
  }

  getUserInfo(credential: UserCredential) {
    return getAdditionalUserInfo(credential);
  }

  addUser(user: any, token: any) {
    const database = getDatabase();
    return set(ref(database, 'users/' + user.uid), {
      email: user.email,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      status: user.status,
      token: token,
    });
  }

  getUser(id: any) {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'users/' + id));
  }

  updateUser(id: string, email: string, status: number, token: string, createdAt: number, lastLoginAt: number) {
    const database = getDatabase();
    return set(ref(database, 'users/' + id), {
      email: email,
      createdAt: createdAt,
      lastLoginAt: lastLoginAt,
      status: status,
      token: token,
    });
  }

  removeUser(id: string) {
    const database = getDatabase();
    return remove(ref(database, 'users/' + id));
  }

  getUsers() {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'users'));
  }

  getPage(id: any) {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'pages/' + id));
  }

  savePage(page: any) {
    const database = getDatabase();
    return set(ref(database, 'pages/' + page.id), {
      type: page.type,
      title: page.title,
      content: page.content,
      modified: page.modified,
    });
  }

  removePage(id: string) {
    const database = getDatabase();
    return remove(ref(database, 'pages/' + id));
  }

  getPages() {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'pages'));
  }

  getArchive(id: any) {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'archives/' + id));
  }

  saveArchive(archive: any) {
    const database = getDatabase();
    return set(ref(database, 'archives/' + archive.id), {
      pageId: archive.pageId,
      type: archive.type,
      title: archive.title,
      content: archive.content,
      modified: archive.modified,
      archived: archive.archived,
    });
  }

  removeArchive(id: string) {
    const database = getDatabase();
    return remove(ref(database, 'archives/' + id));
  }

  getArchives() {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'archives'));
  }

  getSetting(id: any) {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'settings/' + id));
  }

  saveSetting(setting: any) {
    const database = getDatabase();
    return set(ref(database, 'settings/' + setting.id), {
      name: setting.name,
      value: setting.value,
      modified: setting.modified,
    });
  }

  removeSetting(id: string) {
    const database = getDatabase();
    return remove(ref(database, 'settings/' + id));
  }

  getSettings() {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'settings'));
  }

  getImage(id: any) {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'images/' + id));
  }

  saveImage(image: any) {
    const database = getDatabase();
    return set(ref(database, 'images/' + image.id), {
      bucket: image.bucket, 
      contentType: image.contentType, 
      fullPath: image.fullPath, 
      generation: image.generation, 
      name: image.name, 
      size: image.size, 
      width: image.width, 
      height: image.height, 
      timeCreated: image.timeCreated, 
      updated: image.updated,
      modified: image.modified,
    });
  }

  removeImage(id: string) {
    const database = getDatabase();
    return remove(ref(database, 'images/' + id));
  }

  getImages() {
    const databaseRef = ref(getDatabase());
    return get(child(databaseRef, 'images'));
  }
}
