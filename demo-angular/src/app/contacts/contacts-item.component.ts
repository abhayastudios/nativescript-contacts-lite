import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'ContactsItem',
  template: `
    <GridLayout rows="auto" columns="60 *" class="list-item" (tap)="onItemTap(item)">
      <Image row="0" col="0" *ngIf="item.thumbnail" [src]="item.thumbnail" class="thumbnail"></Image>
      <Label row="0" col="0" *ngIf="!item.thumbnail" text="&#xf2be;" class="fa thumbnail-awesome"></Label>
      <Label row="0" col="1" [text]="item.display_name" class="contact-name"></Label>
    </GridLayout>
  `,
  styleUrls: ['./contacts-item.component.css' ]
})
export class ContactsItemComponent implements OnInit {
  @Input() item:any = {};
  @Input() index:number = undefined;
  @Output() tap = new EventEmitter();

  constructor() {}

  public ngOnInit() {
  }

  public onItemTap(contact) {
    this.tap.emit(contact.contact_id); // allow parent to bind to tap
  }
}
