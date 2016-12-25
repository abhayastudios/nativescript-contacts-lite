exports.getContactsWorker = (fields,searchPredicate=undefined) => {
  return new Promise((resolve, reject) => {
    let worker = new Worker('./get-contacts-worker.js'); // relative for caller script path
    worker.postMessage({ "searchPredicate": searchPredicate, "fields" : fields });
    worker.onmessage = ((event) => {
      if (event.data.type == 'debug') { console.log(event.data.message); }
      else if (event.data.type == 'dump') { console.dump(event.data.message); }
      else if (event.data.type == 'error') { reject(event.data); }
      else if (event.data.type == 'result') {
        worker.terminate();
        resolve(event.data.message);
      }
    });
    worker.onerror = ((e) => {
      reject(e);
    });
  });
};

// exports.getContacts = (fields,searchPredicate=undefined) => {
//   return new Promise((resolve, reject) => {
//   });
// };
