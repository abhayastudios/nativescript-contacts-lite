let helper = require("./contact-helper");
let debug = false;

exports.getContactsWorker = (fields,searchTerm=undefined) => {
  return new Promise((resolve, reject) => {
    helper.handlePermission().then(() => {
      let worker = new Worker('./get-contacts-worker.js'); // relative for caller script path
      worker.postMessage({
        "searchTerm": (searchTerm==='') ? undefined : searchTerm,
        "fields": fields,
        "debug": debug
      });

      worker.onmessage = ((event) => {
        if (event.data.type == 'debug') { console.log(event.data.message); }
        else if (event.data.type == 'dump') { console.dump(event.data.message); }
        else if (event.data.type == 'error') { reject(event.data); }
        else if (event.data.type == 'result') {
          worker.terminate();
          resolve(event.data.message);
        }
      });

      worker.onerror = ((e) => { reject(e); });
    }, (e) => { reject(e); });
  });
};

exports.getContacts = (fields,searchTerm=undefined) => {
  return new Promise((resolve, reject) => {
    helper.handlePermission().then(() => {
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
        if (debug) { console_log(`Querying storage backend completed in ${(new Date().getTime() - timer)} ms!`); }

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
        if (debug) { console_log(`Processing data completed in ${(new Date().getTime() - timer)} ms!`); }
        c.close();

        resolve(contacts);
      } catch (e) { reject(e); }
    }, (e) => { reject(e); });
  });
};
