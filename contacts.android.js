let helper = require("./contacts-helper");

/* 
   if running inside a web worker, need to pass debug messages to main thread as workers do not have console access
*/
let console_log = (msg) => { postMessage({ type: 'log', message: msg }); }
let console_dump = (msg) => { postMessage({ type: 'dump', message: msg }); }

/*
   fields:        desired fields to retrieve from phone storage backend
   searchTerm:    search only for contacts whose display_name start with this term
   debug          whether to print debug messages to the console
   worker:        wether we are running inside a web worker
*/
exports.getContactsFromBackend = ((fields,searchTerm,debug,worker) => {
  try {

    /* variables used in android backend query */

    let content_uri = android.provider.ContactsContract.Data.CONTENT_URI,   // The content URI of the words table
        columnsToFetch = helper.getAndroidQueryColumns(fields),             // The columns to return for each row
        selectionClause = helper.getSelectionClause(fields,searchTerm),     // Either null, or e.g.: CONTACT_ID + "=? AND " + MIMETYPE + "=?"
        selectionArgs = helper.getSelectionArgs(fields,searchTerm),         // Either null, or an array of string args for selection clause
        sortOrder = null;                                                   // The sort order for the returned rows

    /* load raw data from android backend */

    var timer = new Date().getTime();
    let c = helper.getAndroidContext().getContentResolver().query(content_uri, columnsToFetch, selectionClause, selectionArgs, sortOrder);
    if (debug && worker) { console_log(`Querying storage backend completed in ${(new Date().getTime() - timer)} ms!`); }
    if (debug && !worker) { console.log(`Querying storage backend completed in ${(new Date().getTime() - timer)} ms!`); }

    /*
       transform raw data into desired data structure
       moveToNext() moves the row pointer to the next row in the cursor
       initial position is -1 and retrieving data at that position you will get an exception
     */

    let contacts = []; // array containing contacts object to return
    var timer = new Date().getTime();
    while (c.moveToNext()) {
      let contact_id = helper.getColumnValue(c,columnsToFetch.indexOf("contact_id"));
      // see if contact_id already exists in contacts to pass existing object for appending
      let existingContactObj = undefined;
      let existingContactIndex = contacts.findIndex((item,index) => { return item.contact_id === contact_id });
      if (existingContactIndex > -1) { existingContactObj=contacts[existingContactIndex]; }

      let contact = helper.convertNativeCursorToContact(c,fields,columnsToFetch,existingContactObj);
      if (existingContactIndex > -1) { contacts[existingContactIndex] = contact; }
      else { contacts.push(contact); }
    }
    if (debug && worker) { console_log(`Processing data completed in ${(new Date().getTime() - timer)} ms!`); }
    if (debug && !worker) { console.log(`Processing data completed in ${(new Date().getTime() - timer)} ms!`); }
    c.close();

    if (worker) { postMessage({ type: 'result', message: contacts }); } else { return({ type: 'result', message: contacts }); }
  } catch (e) { 
    if (worker) { postMessage({ type: 'error', message: e }); } else { return({ type: 'error', message: e }); }
  }
});
