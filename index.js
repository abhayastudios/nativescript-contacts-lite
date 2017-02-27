let contacts = require("./contacts");
let helper = require("./contacts-helper");

exports.getContactsWorker = (fields,searchTerm=undefined,debug=false) => {
  return new Promise((resolve, reject) => {
    helper.handlePermission().then(() => {

      let worker = {};

      if (global.TNS_WEBPACK) {
        let Worker = require("worker-loader!./get-contacts-worker.js");
        worker = new Worker;
      } else {
        worker = new Worker('./get-contacts-worker.js'); // relative for caller script path
      }

      worker.postMessage({
        "searchTerm": (searchTerm==='') ? undefined : searchTerm,
        "fields": fields,
        "debug": debug
      });

      worker.onmessage = ((event) => {
        if (event.data.type == 'log') { console.log(event.data.message); }
        else if (event.data.type == 'dump') { console.dump(event.data.message); }
        else if (event.data.type == 'error') { reject(event.data); }
        else if (event.data.type == 'result') {
          worker.terminate();
          resolve(event.data.message);
        }
      });

      worker.onerror = ((e) => { reject(e); });
    }, (e) => { reject(e); }); // end of handlePermission
  }); // end of promise
};

exports.getContacts = (fields,searchTerm=undefined,debug=false) => {
  return new Promise((resolve, reject) => {
    helper.handlePermission().then(() => {
      let result = contacts.getContactsFromBackend(
        fields,
        (searchTerm==='') ? undefined : searchTerm,
        debug,
        false // we are not running in a web worker
      );
      if (result.type=="error") { reject(result.message); } else { resolve(result.message); }
    }, (e) => { reject(e); }); // end of handlePermission
  }); // end of promise
};

exports.getContactById = (contactId,fields,debug=false) => {
  return new Promise((resolve, reject) => {
    let result = contacts.getContactFromBackendById(contactId,fields,debug);
    if (result.type=="error") { reject(result.message); } else { resolve(result.message); }
  }); // end of promise
}
