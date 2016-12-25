# NativeScript Contacts Lite

This nativescript-contacts-lite plugin provides pretty fast read-only access to the iOS and Android contact directory. The actual work is offloaded to a different thread by running inside a web-worker. Although initialization of the web worker actually adds ~500ms of processing time, it guarantees that the main UI thread will continue to work smoothly. By limiting the scope of the result set through the `desiredFields`, it is possible to obtain a JSON object containing the relevant data of the contact directory within a couple of hundred milliseconds.

## Performance

### Android

On a relatively old Samsung Galaxy S4 a list of ~600 contacts is returned somewhere between ~500ms up to ~2s depending on the desired fields.

### iOS

Support for iOS will follow in a couple of days.

## Installation

Run `tns plugin add https://github.com/abhayastudios/nativescript-contacts-lite.git`

## Usage

To use the contacts module you must first `require()` it.

```js
var Contacts = require("nativescript-contacts-lite");
```

### Methods

####getContactsWorker - retrieve all contacts that have relevant data within the scope of desiredFields

```js
/* 
   desired fields to retrieve from phone storage backend
   possible values: ['displayName','detailedName','phone','photo','organization','nickname','note','website','email','address']
*/
let desiredFields = ['displayName','phone','photo'];

console.log('Loading contacts...');
let timer = new Date().getTime();

Contacts.getContactsWorker(desiredFields).then((result) => {
  console.log(`Loading contacts completed in ${(new Date().getTime() - timer)} ms. Found ${result.length} contacts.`);
  console.dump(result);
}, (e) => { console.dump(e); });
```

### Android


### iOS
Since the plugin uses the Contact framework it is supported only on iOS 9.0 and above!
