# NativeScript Contacts Lite

This nativescript-contacts-lite plugin provides pretty fast read-only access to the iOS and Android contact directory. By limiting the scope of the result set through the `desiredFields`, it is possible to obtain a JSON object containing the relevant data of the contact directory within a couple of hundred milliseconds.

The plugin provides both methods that run in either the main/UI thread or within a web worker. Although offloading the processing to a separate thread adds ~350ms of web worker initialization time, it guarantees that the main UI thread will continue to work smoothly. 

If you are implementing an autocomplete where on each key you are querying a smaller subset of the contacts, you will probably want to go with the non-worker variant to avoid web worker initialization time and the user is waiting anyway. On the other hand, if you are reading the entire contact directory while initializing your app, you probably want this to happen in the background and to avoid the UI to get stuck while processing which is when you should use the web worker variant.

## Performance

### Android

On a relatively old Samsung Galaxy S4 a list of ~600 contacts is returned somewhere between ~300ms up to ~2s depending on the desired fields and whether you run in the main thread or in a web worker.

### iOS

On the iOS simulator with >1000 contacts it returns up to ~600ms. This could use some real iOS device data if anyone has some.

## Installation

Run `tns plugin add nativescript-contacts-lite`

## Usage

To use the contacts module you must first `require()` it.

```js
var Contacts = require("nativescript-contacts-lite");
```

### Methods

####getContacts & getContactsWorker
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

A string with a search term to limit the result set to only contact whose `display_name` contain the term. Defaults to fetching all relevant contacts if an empty search term is provided or none at all.

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

## Notes

### Android

#### Permissions
This plugin uses the [nativescript-permissions](https://github.com/NathanaelA/nativescript-permissions) plugin by Nathanael Anderson for obtaining read-only permissions to the phone's contacts on Android 6.

### iOS
Since the plugin uses the Contact framework it is supported only on iOS 9.0 and above!

## Acknowledgements
The iOS part of this plugin is based on the [nativescript-contacts](https://github.com/firescript/nativescript-contacts) plugin.
