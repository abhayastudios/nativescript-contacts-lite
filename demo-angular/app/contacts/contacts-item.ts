import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ContactsProvider } from "./contacts-provider"

@Component({
  selector: 'ContactsItem',
  template: `
    <StackLayout>
      <GridLayout rows="auto" columns="55 *" class="list-item" (tap)="onItemTap(item)">
        <Image row="0" col="0" *ngIf="item.thumbnail" [src]="item.thumbnail" class="thumbnail"></Image>
        <Label row="0" col="0" *ngIf="!item.thumbnail" text="&#xf2be;" class="fa thumbnail-awesome"></Label>
        <Label row="0" col="1" [text]="item.display_name" class="contact-name"></Label>
      </GridLayout>
    </StackLayout>
  `,
  styles: [`
    .list-item { margin:1 0; padding:10; background-color: #f6f6f6; }
    .thumbnail { width:50; height:50; border-radius:25; vertical-align:center; text-align:center; }
    .thumbnail-awesome { font-size:50; color:#b7b7b7; vertical-align:center; text-align:center; }
    .contact-name { font-size: 18; color: #000000; margin-left: 10; vertical-align:center; }
  `]
})
export class ContactsItemComponent implements OnInit {
  @Input() item:any = {};
  @Input() index:number = undefined;
  @Output() tap = new EventEmitter();

  constructor(public contacts:ContactsProvider) {}

  public ngOnInit() {
  }

  /* display header only when seeing character for first time */
  public displayHeader(char,index) {
    if (index===0) { return true; }
    if (char==this.contacts.cachedContacts[index-1].name.charAt(0)) { return false; } else { return true; }
  }

  public onItemTap(contact) {
    this.tap.emit(contact.contact_id); // allow parent to bind to tap
  }
}