# NativeScript Contacts Lite

This nativescript-contacts-lite plugin provides pretty fast (but hey it's all relative) read-only access to the iOS and Android contact directory. By limiting the scope of the result set through the `desiredFields`, it is possible to obtain a JSON object containing the relevant data of the contact directory within a couple of hundred milliseconds.

# Installation

Run `tns plugin add nativescript-contacts-lite`

# Usage

To use the contacts module you must first `require()` it.

```js
var Contacts = require("nativescript-contacts-lite");
```

## Methods

### getContacts & getContactsWorker
Both methods retrieve contacts and share the same interface. The difference is that the former runs in the main thread and the latter within a web worker.

**Argument 1: desiredFields**
An array containing the desired fields to fetch from phone's storage backend. Possible values are:
```js
[
  'address',
  'display_name',
  'email',
  'name_details',
  'nickname',
  'note',
  'organization',
  'phone',
  'photo',
  'thumbnail',
  'website'
]
```

**Argument 2: searchTerm (optional)**
A string with a search term to limit the result set to only contacts whose `display_name` contain the term. Defaults to fetching all relevant contacts if an empty search term is provided or none at all.

**Argument 3: debug (optional)**
Boolean (true/false) determining whether to pass debug messages to the console. Defaults to false.


**Example using getContacts**
```js
let desiredFields = ['display_name','phone'];
let searchTerm = 'Jon';

console.log('Loading contacts...');
let timer = new Date().getTime();

Contacts.getContacts(desiredFields,searchTerm).then((result) => {
  console.log(`Loading contacts completed in ${(new Date().getTime() - timer)} ms.`);
  console.log(`Found ${result.length} contacts.`);
  console.dump(result);
}, (e) => { console.dump(e); });
```

**Example using getContactsWorker**
```js
let desiredFields = ['display_name','phone','thumbnail','email','organization'];

console.log('Loading contacts...');
let timer = new Date().getTime();

Contacts.getContactsWorker(desiredFields).then((result) => {
  console.log(`Loading contacts completed in ${(new Date().getTime() - timer)} ms.`);
  console.log(`Found ${result.length} contacts.`);
  console.dump(result);
}, (e) => { console.dump(e); });
```


### getContactById
Get contact details for a specific contact.

**Argument 1: contactId**
The identifier of the contact you wish to obtain details of (obtained through the getContacts(Worker) methods).

**Argument 2: desiredFields**
An array containing the desired fields to fetch from phone's storage backend. See `getContacts` method for possible values.

**Argument 3: debug (optional)**
Boolean (true/false) determining whether to pass debug messages to the console. Defaults to false.

**Example**
```js
let contact_id = contact.contact_id // get id from result of getContacts method

let desiredFields = [
  'address',
  'display_name',
  'email',
  'name_details',
  'nickname',
  'note',
  'organization',
  'phone',
  'photo',
  'thumbnail',
  'website'
]

Contacts.getContactById(contact_id,desiredFields).then((result) => {
  console.dump(result);
}, (e) => { console.dump(e); });
```


# Performance

## Considerations

### Running in main thread versus web worker
The plugin provides both methods that run in either the main/UI thread or within a web worker. Although offloading the processing to a separate thread adds web worker initialization time, it guarantees that the main UI thread will continue to work smoothly. 

If you are implementing an autocomplete where on each key you are querying a smaller subset of the contacts, you will probably want to go with the non-worker variant to avoid web worker initialization time while the user is waiting. On the other hand, if you are reading the entire contact directory while initializing your app, you probably want this to happen in the background to avoid the UI getting stuck while processing. In the latter case you probably would want to use the web worker variant.

### Contact Picker Example
Another way to speed up performance is possible in certain cases like when you are building a contact picker. In this case it is probably good enough to first provide a narrow array of desiredFields like `['display_name','thumbnail']` to `getContacts` to display the list. Only when the user selects a specific contact, you can obtain all details for a specific contact by supplying a wider array of desiredFields to `getContactById`.


## Benchmarks

### Android
On a relatively old Samsung Galaxy S4 a list of ~600 contacts is returned somewhere between ~300ms up to ~2s depending on the desired fields and whether you run in the main thread or in a web worker.

### iOS
Tests on an iPhone 7 plus with ~600 contacts returned in ~105ms when running `getContacts(['display_name', 'phone'])` (so non worker). This could use some more real iOS device data in different modes (e.g. more fields & web worker mode) if anyone has some.


# Notes

## Photo & Thumbnail Images
The plugin returns `photo` & `thumbnail` images as a base64 encoded string ready to be used as the source attribute of an image, e.g. `<Image *ngIf="item.thumbnail" [src]="item.thumbnail"></Image>`

## Android Specifics

### Permissions
This plugin uses the [nativescript-permissions](https://github.com/NathanaelA/nativescript-permissions) plugin by Nathanael Anderson for obtaining read-only permissions to the phone's contacts on Android 6 and above.

## iOS Specifics
Since the plugin uses the Contact framework it is supported only on iOS 9.0 and above!

### Permissions
As of iOS 10 it has become mandatory to add the `NSContactsUsageDescription` key to your application's `Info.plist` (see [Apple's developer documentation](https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CocoaKeys.html#//apple_ref/doc/uid/TP40009251-SW14)).

Therefore you should add something like this to your `~/app/App_Resources/iOS/Info.plist`:
```
<key>NSContactsUsageDescription</key>
<string>This application requires access to your contacts to function properly.</string>
```

# Acknowledgements
The iOS part of this plugin is based on the [nativescript-contacts](https://github.com/firescript/nativescript-contacts) plugin.
