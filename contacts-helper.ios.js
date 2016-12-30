var constants = require("./constants");
var imageSource = require("image-source");

/* 
   permissions handling is reall only relevant for Android, for iOS we will always resolve
*/
exports.handlePermission = (() => {
  return new Promise((resolve, reject) => {
    resolve();
  });
});

let getiOSValue = function(key, contactData){
  return contactData.isKeyAvailable(key) ? contactData[key] : null;
};

/*
   Takes a native cursor row and converts to json object for new contacts
   If contact already exists then merge relevant properties with the existing object

   Arguments
    1: cursor - the cursor returned by Android's getContentResolver().query()
    2: fields - those the user is interested in (skip irrelevant properties for speedup)
    3: columnNames - since we already have those, no need to check them for every iteration
    4: existingContact - either undefined or object for an existing record
*/
exports.convertNativeCursorToContact = (c,fields) => {
  let contact = {}; // contact object to return if creatng a new record
  contact.contact_id = getiOSValue("identifier", c);

  /* display_name */

  if (fields.indexOf("display_name") > -1) {
    contact.display_name = `${getiOSValue("givenName", c)} ${getiOSValue("familyName", c)}`;
  }

  /* name_details */

  if (fields.indexOf("name_details") > -1) {
    var record = {};
    record.family = getiOSValue("familyName", c);
    record.given  = getiOSValue("givenName", c);
    record.middle = getiOSValue("middleName", c);
    record.prefix = getiOSValue("namePrefix", c);
    record.suffix = getiOSValue("nameSuffix", c);
    if (!contact.hasOwnProperty('name_details')) { contact.name_details = []; }
    contact.name_details.push(record);
  }

  /* phone */

  if (fields.indexOf("phone") > -1) {
    if (!contact.hasOwnProperty('phone')) { contact.phone = []; }

    for (var i=0; i < c.phoneNumbers.count; i++) {
      var pdata = c.phoneNumbers[i];
      contact.phone.push({
        //id: pdata.identifier,
        type: constants.getPhoneLabel(pdata.label),
        number: pdata.value.stringValue
      });
    }
  }

  /* photo */

  if (fields.indexOf("photo") > -1) {
    contact.photo = null;
    if (c.imageDataAvailable) {
      var photo = imageSource.fromData(c.imageData);
      if (photo) { contact.photo = "data:image/png;base64,"+photo.toBase64String("png"); }
    }
  }

  /* thumbnail */

  if (fields.indexOf("thumbnail") > -1) {
    contact.thumbnail = null;
    if (c.imageDataAvailable) {
      var thumb = imageSource.fromData(c.thumbnailImageData);
      if (thumb) { contact.thumbnail = "data:image/png;base64,"+thumb.toBase64String("png"); }
    }
  }

  /* organization */

  if (fields.indexOf("organization") > -1) {
    var record = {}
    record.title = getiOSValue("jobTitle", c);
    record.department = getiOSValue("departmentName", c);
    record.company = getiOSValue("organizationName", c);
    if (!contact.hasOwnProperty('organization')) { contact.organization = []; }
    contact.organization.push(record);
  }

  /* nickname */ 

  if (fields.indexOf("nickname") > -1) {
    var record = {};
    record.name = getiOSValue("nickname", c);
    if (!contact.hasOwnProperty('nickname')) { contact.nickname = []; }
    contact.nickname.push(record);
  }

  /* note */

  if (fields.indexOf("note") > -1) {
    var record = {};
    var columnValue = getiOSValue("notes", c);
    if (columnValue!=null && columnValue!='') { record.note = columnValue; } else { record = null; }
    if (!contact.hasOwnProperty('note')) { contact.note = []; }
    if (record!=null) { contact.note.push(record); }
  }
  
  /* email */

  if (fields.indexOf("email") > -1) {
    if (!contact.hasOwnProperty('email')) { contact.email = []; }

    for (var i=0; i < c.emailAddresses.count; i++) {
      var edata = c.emailAddresses[i];
      contact.email.push({
        type: constants.getGenericLabel(edata.label),
        address: edata.value
      });
    }
  }

  /* website */

  if (fields.indexOf("website") > -1) {
    if (!contact.hasOwnProperty('website')) { contact.website = []; }

    for (var i=0; i < c.urlAddresses.count; i++) {
      var urldata = c.urlAddresses[i];
      contact.website.push({
        type: constants.getWebsiteLabel(urldata.label),
        url: urldata.value
      });
    }
  }

  /* address */

  if (fields.indexOf("address") > -1) {
    if (!contact.hasOwnProperty('address')) { contact.address = []; }

    for (var i=0; i < c.postalAddresses.count; i++) {
      var postaldata = c.postalAddresses[i];
      contact.address.push({
        type: constants.getGenericLabel(postaldata.label),
        street: postaldata.value.street,
        city: postaldata.value.city,
        region: postaldata.value.state,
        postcode: postaldata.value.postalCode,
        country: postaldata.value.country,
        street: postaldata.value.street,
        formatted_address: null
      });
    }
  }

  return contact;
};

/*
   returns an array with names of columns to fetch from Android storage backend
   constants map to Android's "dataX" fields, e.g.
   android.provider.ContactsContract.CommonDataKinds.Phone.NUMBER = "data1"
   see: https://developer.android.com/reference/android/provider/ContactsContract.Data.html
*/
exports.getIOSQueryColumns = (fields) => {
  let columnsToFetch = []; 

  //columnsToFetch.push("contact_id","mimetype","account_name");

  if (fields.indexOf('display_name') > -1) { columnsToFetch.push("givenName","familyName"); }
  if (fields.indexOf('name_details') > -1) { columnsToFetch.push("givenName","familyName","middleName","namePrefix","nameSuffix"); }
  if (fields.indexOf('phone') > -1) { columnsToFetch.push("phoneNumbers"); }
  if (fields.indexOf('email') > -1) { columnsToFetch.push("emailAddresses"); }
  if (fields.indexOf('address') > -1) { columnsToFetch.push("postalAddresses"); }
  if (fields.indexOf('nickname') > -1) { columnsToFetch.push("nickname"); }
  if (fields.indexOf('organization') > -1) { columnsToFetch.push("jobTitle", "departmentName", "organizationName"); }
  if (fields.indexOf('note') > -1) { columnsToFetch.push("notes"); }
  if (fields.indexOf('photo') > -1) { columnsToFetch.push(CNContactImageDataAvailableKey, CNContactImageDataKey); }
  if (fields.indexOf('thumbnail') > -1) { columnsToFetch.push(CNContactImageDataAvailableKey, CNContactThumbnailImageDataKey); }
  if (fields.indexOf('website') > -1) { columnsToFetch.push("urlAddresses"); }

  // filter out any nulls & duplicates
  return columnsToFetch.filter((item, index, self) => { return (item != null && index == self.indexOf(item)) });
}