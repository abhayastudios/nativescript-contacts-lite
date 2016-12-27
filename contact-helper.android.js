var constants = require("./constants");
var Perms = require("nativescript-permissions");

exports.handlePermission = (() => {
  return new Promise((resolve, reject) => {
    // check whether we already have permissions
    if (Perms.hasPermission(android.Manifest.permission.READ_CONTACTS)) {
      resolve();
    }

    Perms.requestPermission(
      android.Manifest.permission.READ_CONTACTS,
      "This application requires read-only access to your contacts!"
    ).then(() => {
      resolve();
    }).catch(() => {
      reject('Unable to obtain permission to read contacts!');
    });
  });
});

/* 
   inside a web worker appModule.android.context does not work
*/
exports.getAndroidContext = () => {
  if (typeof appModule != "undefined" && appModule.hasOwnProperty('android') && appModule.android.hasOwnProperty('context')) {
    return (appModule.android.context);
  }

  var ctx = java.lang.Class.forName("android.app.AppGlobals").getMethod("getInitialApplication", null).invoke(null, null);
  if (ctx) { return ctx; }

  ctx = java.lang.Class.forName("android.app.ActivityThread").getMethod("currentApplication", null).invoke(null, null);
  return ctx;
};

/*
   returns value for column with index columnIndex
   helper function for convertNativeCursorToContact
*/
var getColumnValue = (cursor,columnIndex) => {
  var columnType = cursor.getType(columnIndex);
  switch (columnType) {
    case 0: // NULL
      return null;
    case 1: // Integer
      return cursor.getInt(columnIndex);
    case 2: // Float
      return cursor.getFloat(columnIndex);
    case 3: // String
      return cursor.getString(columnIndex);
    case 4: // Blob
      return cursor.getBlob(columnIndex);
      break;
    default:
      throw new Error('Contact - Unknown column type '+ columnType);
  }
}
exports.getColumnValue = getColumnValue;

/*
   Takes a native cursor row and converts to json object for new contacts
   If contact already exists then merge relevant properties with the existing object

   Arguments
    1: cursor - the cursor returned by Android's getContentResolver().query()
    2: fields - those the user is interested in (skip irrelevant properties for speedup)
    3: columnNames - since we already have those, no need to check them for every iteration
    4: existingContact - either undefined or object for an existing record
*/
exports.convertNativeCursorToContact = (cursor,fields,columnNames,existingContact) => {
  let contact = {}; // contact object to return if creatng a new record
  if (existingContact) { contact = existingContact; }

  if (!existingContact) { 
    contact.contact_id = getColumnValue(cursor,columnNames.indexOf("contact_id"));
  }

  /* displayName */

  if (fields.indexOf("displayName") > -1 && !existingContact) {
    contact.displayName = getColumnValue(cursor,columnNames.indexOf("display_name"));
  }

  /* detailedName */

  if (fields.indexOf("detailedName") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['detailedName']) {
    var record = { "accountName" : getColumnValue(cursor,columnNames.indexOf("account_name")) }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['detailedName']['family']));
    if (columnValue != null) { record.family = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['detailedName']['given']));
    if (columnValue != null) { record.given = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['detailedName']['middle']));
    if (columnValue != null) { record.middle = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['detailedName']['prefix']));
    if (columnValue != null) { record.prefix = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['detailedName']['suffix']));
    if (columnValue != null) { record.suffix = columnValue }
    if (!existingContact || !contact.hasOwnProperty('detailedName')) { contact.detailedName = []; }
    contact.detailedName.push(record);
  }

  /* phone */

  if (fields.indexOf("phone") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['phone']) {
    var record = { "accountName" : getColumnValue(cursor,columnNames.indexOf("account_name")) }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['phone']['type']));
    if (columnValue != null) { record.type = constants.DATA_TYPES['phone']['labels'][columnValue] || columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['phone']['number']));
    if (columnValue != null) { record.number = columnValue.trim() }
    if (!existingContact || !contact.hasOwnProperty('phone')) { contact.phone = []; }
    contact.phone.push(record);
  }

  /* photo */

  if (fields.indexOf("photo") > -1 && !existingContact) { 
    contact.photo = { 
      "photoUri": getColumnValue(cursor,columnNames.indexOf("photo_uri")),
      "photoThumbUri": getColumnValue(cursor,columnNames.indexOf("photo_thumb_uri"))
    }
  }

  /* organization */

  if (fields.indexOf("organization") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['organization']) {
    var record = { "accountName" : getColumnValue(cursor,columnNames.indexOf("account_name")) }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['organization']['type']));
    if (columnValue != null) { record.type = constants.DATA_TYPES['organization']['labels'][columnValue] || columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['organization']['department']));
    if (columnValue != null) { record.department = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['organization']['company']));
    if (columnValue != null) { record.company = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['organization']['title']));
    if (columnValue != null) { record.title = columnValue }
    if (!existingContact || !contact.hasOwnProperty('organization')) { contact.organization = []; }
    contact.organization.push(record);
  }

  /* nickname */

  if (fields.indexOf("nickname") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['nickname']) {
    var record = {};
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['nickname']));
    if (columnValue!=null && columnValue!='') { 
      record.name = columnValue;
      record.accountName = getColumnValue(cursor,columnNames.indexOf("account_name"));
    } else { record = null; }
    if (!existingContact || !contact.hasOwnProperty('nickname')) { contact.nickname = []; }
    if (record!=null) { contact.nickname.push(record); }
  }

  /* note */

  if (fields.indexOf("note") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['note']) {
    var record = {}; 
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['note']));
    if (columnValue!=null && columnValue!='') { 
      record.note = columnValue;
      record.accountName = getColumnValue(cursor,columnNames.indexOf("account_name"));
    } else { record = null; }
    if (!existingContact || !contact.hasOwnProperty('note')) { contact.note = []; }
    if (record!=null) { contact.note.push(record); }
  }
  
  /* email */

  if (fields.indexOf("email") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['email']) {
    var record = { "accountName" : getColumnValue(cursor,columnNames.indexOf("account_name")) }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['email']['type']));
    if (columnValue != null) { record.type = constants.DATA_TYPES['email']['labels'][columnValue] || columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['email']['data']));
    if (columnValue != null) { record.address = columnValue }
    if (!existingContact || !contact.hasOwnProperty('email')) { contact.email = []; }
    contact.email.push(record);
  }

  /* website */

  if (fields.indexOf("website") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['website']) {
    var record = { "accountName" : getColumnValue(cursor,columnNames.indexOf("account_name")) }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['website']['type']));
    if (columnValue != null) { record.type = constants.DATA_TYPES['website']['labels'][columnValue] || columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['website']['url']));
    if (columnValue != null) { record.url = columnValue }
    if (!existingContact || !contact.hasOwnProperty('website')) { contact.website = []; }
    contact.website.push(record);
  }

  /* address */

  if (fields.indexOf("address") > -1 && getColumnValue(cursor,columnNames.indexOf("mimetype")) == constants.MIME_TYPES['address']) {
    var record = { "accountName" : getColumnValue(cursor,columnNames.indexOf("account_name")) }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['address']['type']));
    if (columnValue != null) { record.type = constants.DATA_TYPES['address']['labels'][columnValue] || columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['address']['formatted_address']));
    if (columnValue != null) { record.formatted_address = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['address']['street']));
    if (columnValue != null) { record.street = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['address']['city']));
    if (columnValue != null) { record.city = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['address']['region']));
    if (columnValue != null) { record.region = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['address']['postcode']));
    if (columnValue != null) { record.postcode = columnValue }
    var columnValue = getColumnValue(cursor,columnNames.indexOf(constants.DATA_TYPES['address']['country']));
    if (columnValue != null) { record.country = columnValue }
    if (!existingContact || !contact.hasOwnProperty('address')) { contact.address = []; }
    contact.address.push(record);
  }
  return contact;
};

/*
   returns an array with names of columns to fetch from Android storage backend
   constants map to Android's "dataX" fields, e.g.
   android.provider.ContactsContract.CommonDataKinds.Phone.NUMBER = "data1"
   see: https://developer.android.com/reference/android/provider/ContactsContract.Data.html
*/
exports.getAndroidQueryColumns = (fields) => {
  let columnsToFetch = []; 

  columnsToFetch.push("contact_id","mimetype","account_name");

  if (fields.indexOf("displayName") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.ContactNameColumns.DISPLAY_NAME_PRIMARY);
  }

  if (fields.indexOf("detailedName") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.PREFIX);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.SUFFIX);
  }
  if (fields.indexOf("phone") > -1) {
    //columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Phone._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Phone.NUMBER);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Phone.TYPE);
  }
  if (fields.indexOf("email") > -1) {
    //columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Email._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Email.DATA);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Email.TYPE);
  }
  if (fields.indexOf("address") > -1) {
    //columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization.TYPE);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.FORMATTED_ADDRESS);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.STREET);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.CITY);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.REGION);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.POSTCODE);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.COUNTRY);
  }
  if (fields.indexOf("organization") > -1) {
    //columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization.TYPE);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization.DEPARTMENT);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization.COMPANY);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization.TITLE);
  }
  if (fields.indexOf("note") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Note.NOTE);
  }
  if (fields.indexOf("nickname") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Nickname.NAME);
  }
  if (fields.indexOf("website") > -1) {
    //columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Website._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Website.URL);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Website.TYPE);
  }
  if (fields.indexOf("photo") > -1) {
    columnsToFetch.push("photo_uri","photo_thumb_uri");
  }

  // filter out any nulls & duplicates
  return columnsToFetch.filter((item, index, self) => { return (item != null && index == self.indexOf(item)) });
}



/*
   returns an array with names of relevant metadata types to fetch from storage backend
*/
exports.getAndroidMimeTypes = (fields) => {
  let datatypes = [];

  if (fields.indexOf("detailedName") > -1) { datatypes.push(constants.MIME_TYPES['detailedName']); }
  if (fields.indexOf("phone") > -1) { datatypes.push(constants.MIME_TYPES['phone']); }
  if (fields.indexOf("photo") > -1) { 
    // datatypes.push(constants.MIME_TYPES['photo']); // photo + thumb URI are obtained in getAndroidQueryColumns 
  }
  if (fields.indexOf("organization") > -1) { datatypes.push(constants.MIME_TYPES['organization']); }
  if (fields.indexOf("nickname") > -1) { datatypes.push(constants.MIME_TYPES['nickname']); }
  if (fields.indexOf("note") > -1) { datatypes.push(constants.MIME_TYPES['note']); }
  if (fields.indexOf("website") > -1) { datatypes.push(constants.MIME_TYPES['website']); }
  if (fields.indexOf("email") > -1) { datatypes.push(constants.MIME_TYPES['email']); }
  if (fields.indexOf("address") > -1) { datatypes.push(constants.MIME_TYPES['address']); }

  return datatypes.filter((value) => { return value != null; }); // filter out any nulls
}

/*
   returns an string with the selection clause, e.g. 'mimetype=? OR mimetype=?'
*/
exports.getSelectionClause = ((fields,searchTerm) => {
  let clause = '';
  let clauseArr = [];
  exports.getAndroidMimeTypes(fields).forEach(() => {
    clauseArr.push('mimetype=?','OR');
  });
  clauseArr.pop();
  clause = `(${clauseArr.join(' ')})`
  if (searchTerm) { clause += ` AND ${android.provider.ContactsContract.ContactNameColumns.DISPLAY_NAME_PRIMARY} LIKE ?`; }
  return(clause);
});

/*
   returns an array of strings with the arguments for the selection clause,
   e.g. ['vnd.android.cursor.item/name','vnd.android.cursor.item/photo']
*/
exports.getSelectionArgs = ((fields,searchTerm) => {
  let argsArr = [];
  exports.getAndroidMimeTypes(fields).forEach((mimetype) => { argsArr.push(mimetype); });
  if (searchTerm) { argsArr.push(`%${searchTerm}%`); }
  return(argsArr);
});
