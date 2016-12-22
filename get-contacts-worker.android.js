require('globals'); // necessary to bootstrap tns modules on the new thread
var helper = require("./contact-helper");

/* pass debug messages to main thread since web workers do not have console access */
let console_log = (msg) => { postMessage({ type: 'debug', message: msg }); }
let console_dump = (msg) => { postMessage({ type: 'dump', message: msg }); }

self.onmessage = (event) => {
  try {
    let contacts = []; // array containing contacts sturcture we are building

    /* variables used in android backend query */
    let content_uri = android.provider.ContactsContract.Data.CONTENT_URI,   // The content URI of the words table
        columnsToFetch = helper.getAndroidQueryColumns(event.data.fields),  // The columns to return for each row
        selectionClause = helper.getSelectionClause(event.data.fields),     // Either null, or e.g.: CONTACT_ID + "=? AND " + MIMETYPE + "=?"
        selectionArgs = helper.getSelectionArgs(event.data.fields),         // Either null, or an array of string args for selection clause
        sortOrder = null;                                                   // The sort order for the returned rows

    console_dump(columnsToFetch);
    // console_log(selectionClause);
    // console_dump(selectionArgs);

    /* load raw data from android backend */

    var timer = new Date().getTime();
    let c = helper.getAndroidContext().getContentResolver().query(content_uri, columnsToFetch, selectionClause, selectionArgs, sortOrder);
    console_log(`Querying storage backend completed in ${(new Date().getTime() - timer)} ms!`);

    /*
       transform raw data into desired data structure

       moveToNext() moves the row pointer to the next row in the cursor
       initial position is -1 and retrieving data at that position you will get an exception
     */

    var timer = new Date().getTime();
    while (c.moveToNext()) {
      let contact = helper.convertNativeCursorToJson(c);
      contacts.push(contact);
    }
    console_log(`Processing data completed in ${(new Date().getTime() - timer)} ms!`);
    c.close();

    postMessage({ type: 'result', message: contacts });
  } catch (e) { postMessage({ type: 'result', message: e }); }
}