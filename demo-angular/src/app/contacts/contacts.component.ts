import { Component, OnInit } from '@angular/core';
import { ContactsProvider } from './contacts.provider';

@Component({
  template: `
    <StackLayout>
      <ListView [items]="contacts.cachedContacts">
        <ng-template let-item="item" let-index="index">
          <ContactsItem [item]="item" [index]="index" (tap)="onItemTap($event)"></ContactsItem>
        </ng-template>
      </ListView>
    <StackLayout>
  `,
  styles: [`
    ListView {
      separator-color:transparent;
      height:100%;
    }
  `]
})
export class ContactsComponent implements OnInit {
  constructor(public contacts:ContactsProvider) {}

  public ngOnInit() {
    this.contacts.cacheContacts();
  }

  public onItemTap(contact_id) {
    this.contacts.getSingleContact(contact_id).then((contact) => {
      console.dir(contact);
    });
  }
}