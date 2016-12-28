require('globals'); // necessary to bootstrap tns modules on the new thread
let contacts = require("./contacts");

self.onmessage = (event) => {
  return new Promise((resolve, reject) => {
    let result = contacts.getContactsFromBackend(
      event.data.fields,
      (event.data.searchTerm==='') ? undefined : event.data.searchTerm,
      event.data.debug,
      true // we are running in a web worker
    );
    postMessage(result);
  });
}
