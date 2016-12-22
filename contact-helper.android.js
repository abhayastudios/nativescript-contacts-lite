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

exports.convertNativeCursorToJson = (cursor) => {
  var count = cursor.getColumnCount();
  var results = {};

  for (var i=0; i < count; i++) {
    var type = cursor.getType(i);
    //noinspection JSUnresolvedFunction
    var name = cursor.getColumnName(i);

    switch (type) {
      case 0: // NULL
        results[name] = null;
        break;
      case 1: // Integer
        //noinspection JSUnresolvedFunction
        results[name] = cursor.getInt(i);
        break;
      case 2: // Float
        //noinspection JSUnresolvedFunction
        results[name] = cursor.getFloat(i);
        break;
      case 3: // String
        results[name] = cursor.getString(i);
        break;
      case 4: // Blob
        results[name] = cursor.getBlob(i);
        break;
      default:
        throw new Error('Contacts - Unknown Field Type '+ type);
    }
  }
  return results;
};

/*
   returns an array with names of columns to fetch from Android storage backend
   constants map to Android's "dataX" fields, e.g.
   android.provider.ContactsContract.CommonDataKinds.Phone.NUMBER = "data1"
   see: https://developer.android.com/reference/android/provider/ContactsContract.Data.html
*/
exports.getAndroidQueryColumns = (fields) => {
  let columnsToFetch = []; 

  columnsToFetch.push("display_name","contact_id","raw_contact_id","mimetype","account_name");

  if (fields.indexOf("name") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.PREFIX);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredName.SUFFIX);
  }
  if (fields.indexOf("phone") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Phone._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Phone.NUMBER);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Phone.TYPE);
  }
  if (fields.indexOf("email") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Email._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Email.DATA);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Email.TYPE);
  }
  if (fields.indexOf("address") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization.TYPE);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.FORMATTED_ADDRESS);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.STREET);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.CITY);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.REGION);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.POSTCODE);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.StructuredPostal.COUNTRY);
  }
  if (fields.indexOf("organization") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Organization._ID);
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
  if (fields.indexOf("url") > -1) {
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Website._ID);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Website.URL);
    columnsToFetch.push(android.provider.ContactsContract.CommonDataKinds.Website.TYPE);
  }
  if (fields.indexOf("photo") > -1) {
    columnsToFetch.push("photo_uri","photo_thumb_uri");
  }

  return columnsToFetch.filter((value) => { return value != null; }); // filter out any nulls
}

exports.MIME_TYPES = {
  "name" : "vnd.android.cursor.item/name",
  "phone" : "vnd.android.cursor.item/phone_v2",
  "photo" : "vnd.android.cursor.item/photo",
  "organization" : "vnd.android.cursor.item/organization",
  "nickname" : "vnd.android.cursor.item/nickname",
  "note" : "vnd.android.cursor.item/note",
  "url" : "vnd.android.cursor.item/website",
  "email" : "vnd.android.cursor.item/email_v2",
  "address" : "vnd.android.cursor.item/postal-address_v2"
}

/*
   returns an array with names of relevant metadata types to fetch from storage backend
*/
exports.getAndroidMimeTypes = (fields) => {
  let datatypes = [];

  if (fields.indexOf("name") > -1) { datatypes.push(exports.MIME_TYPES['name']); }
  if (fields.indexOf("phone") > -1) { datatypes.push(exports.MIME_TYPES['phone']); }
  if (fields.indexOf("photo") > -1) { 
    // no need for this mime type since photo + thumb URI are obtained in getAndroidQueryColumns 
    // datatypes.push(exports.MIME_TYPES['photo']);
  }
  if (fields.indexOf("organization") > -1) { datatypes.push(exports.MIME_TYPES['organization']); }
  if (fields.indexOf("nickname") > -1) { datatypes.push(exports.MIME_TYPES['nickname']); }
  if (fields.indexOf("note") > -1) { datatypes.push(exports.MIME_TYPES['note']); }
  if (fields.indexOf("url") > -1) { datatypes.push(exports.MIME_TYPES['url']); }
  if (fields.indexOf("email") > -1) { datatypes.push(exports.MIME_TYPES['email']); }
  if (fields.indexOf("address") > -1) { datatypes.push(exports.MIME_TYPES['address']); }

  return datatypes.filter((value) => { return value != null; }); // filter out any nulls
}

/*
   returns an string with the selection clause, e.g. 'mimetype=? OR mimetype=?'
*/
exports.getSelectionClause = ((fields) => {
  let clauseArr = [];
  exports.getAndroidMimeTypes(fields).forEach(() => {
    clauseArr.push('mimetype=?','OR');
  });
  clauseArr.pop();
  return(clauseArr.join(' '));
});

/*
   returns an array of strings with the arguments for the selection clause,
   e.g. ['vnd.android.cursor.item/name','vnd.android.cursor.item/photo']
*/
exports.getSelectionArgs = ((fields) => {
  let argsArr = [];
  exports.getAndroidMimeTypes(fields).forEach((mimetype) => { argsArr.push(mimetype); });
  return(argsArr);
});