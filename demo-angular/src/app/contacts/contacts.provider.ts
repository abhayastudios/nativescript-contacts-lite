import { Injectable } from '@angular/core';
import * as appSettings from "@nativescript/core/application-settings";
import { getContactsWorker, getContactById } from 'nativescript-contacts-lite';

@Injectable()
export class ContactsProvider {
  public cachedContacts:Array<any> = []; // array of objects containing shadow of entire phonebook

  constructor() {}

  /*
     creates a sorted cache of the phonebook through a web worker so UI won't get stuck and stores in app storage
  */
  public cacheContacts() {
    return new Promise((resolve, reject) => {
      console.log('Start caching contacts');

      /* get all contacts from phonebook */

      let desiredFields:Array<string> = ['display_name','thumbnail']; // fields to fetch from contacts

      console.time('getContactsWorker');

      getContactsWorker(desiredFields).then((result) => {
        console.timeEnd('getContactsWorker');
        console.log(`getContactsWorker: found ${result.length} items`);
        this.cachedContacts = result;
        resolve();
      })
      .catch((error) => { console.error(error); });
    });
  }

  public getSingleContact(contact_id) {
    return new Promise((resolve, reject) => {
      var timer = new Date().getTime();

      let desiredFields:Array<string> = ['address','display_name','email','name_details','nickname','note','organization','phone','photo','thumbnail','website']; // fields to fetch from contacts
      getContactById(contact_id,desiredFields).then((result) => {
        console.log(`getContactById complete in ${(new Date().getTime() - timer)} ms.`);
        resolve(result);
      })
      .catch((error) => { console.error(error); });
    });
  }
}
