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

    /* variables used in ios backend query */

    let contacts = []; // array containing contacts object to return
    let columnsToFetch = helper.getIOSQueryColumns(fields); // columns to return for each row

    var timer = new Date().getTime();

    /* getting all contacts */ 

    if (searchTerm===undefined) {
      var store = new CNContactStore(),
          error,
          fetch = CNContactFetchRequest.alloc().initWithKeysToFetch(columnsToFetch),
          nativeMutableArray = new NSMutableArray();
  
      fetch.unifyResults = true;
      fetch.predicate = null;

      store.enumerateContactsWithFetchRequestErrorUsingBlock(fetch, error, (c,s) => {
        nativeMutableArray.addObject(c);

        //transform raw data into desired data structure */
        contacts.push(helper.convertNativeCursorToContact(c,fields));
      });

      if (error && worker) { postMessage({ type: 'error', message: error }); } 
      if (error && !worker) { return({ type: 'error', message: error }); } 
    }

    /* getting contacts by searchTerm */ 

    if (searchTerm) {
      var store = new CNContactStore(),
          error,
          foundContacts = store.unifiedContactsMatchingPredicateKeysToFetchError(
            CNContact.predicateForContactsMatchingName(searchTerm),
            columnsToFetch, error
          );

      if (error && worker) { postMessage({ type: 'error', message: error }); } 
      if (error && !worker) { return({ type: 'error', message: error }); } 

      for (var i=0; i<foundContacts.count; i++) {
        //transform raw data into desired data structure */
        contacts.push(helper.convertNativeCursorToContact(foundContacts[i],fields));
      }
    }

    if (debug && worker) { console_log(`Processing data completed in ${(new Date().getTime() - timer)} ms!`); }
    if (debug && !worker) { console.log(`Processing data completed in ${(new Date().getTime() - timer)} ms!`); }

    return({ type: 'result', message: contacts });
  } catch (e) { return({ type: 'error', message: e }); }
});

/*
   fields:        desired fields to retrieve from phone storage backend
   searchTerm:    search only for contacts whose display_name start with this term
   debug          whether to print debug messages to the console
*/
exports.getContactFromBackendById = ((contactId,fields,debug) => {
  try {

    /* variables used in ios backend query */

    let contact = {}; // contact object to return
    let columnsToFetch = helper.getIOSQueryColumns(fields); // columns to return for each row

    var timer = new Date().getTime();

    /* getting single contact by contact_id */

    var store = new CNContactStore(),
        error,
        foundContact = store.unifiedContactWithIdentifierKeysToFetchError(contactId,columnsToFetch,error);

    if (error) { return({ type: 'error', message: error }); } 

    //transform raw data into desired data structure */
    contact = helper.convertNativeCursorToContact(foundContact,fields);

    if (debug) { console.log(`Processing data completed in ${(new Date().getTime() - timer)} ms!`); }

    return({ type: 'result', message: contact });
  } catch (e) { return({ type: 'error', message: e }); }
});
