exports.MIME_TYPES = {
  "name_details" : "vnd.android.cursor.item/name",
  "phone" : "vnd.android.cursor.item/phone_v2",
  "photo" : "vnd.android.cursor.item/photo",
  "thumbnail" : "vnd.android.cursor.item/photo",
  "organization" : "vnd.android.cursor.item/organization",
  "nickname" : "vnd.android.cursor.item/nickname",
  "note" : "vnd.android.cursor.item/note",
  "website" : "vnd.android.cursor.item/website",
  "email" : "vnd.android.cursor.item/email_v2",
  "address" : "vnd.android.cursor.item/postal-address_v2"
}

/* 
   mapping of Android data types (needed for reverse lookup of "dataN" fields)
*/
DATA_TYPES = {
  "name_details" : {
    "family": android.provider.ContactsContract.CommonDataKinds.StructuredName.FAMILY_NAME,
    "given": android.provider.ContactsContract.CommonDataKinds.StructuredName.GIVEN_NAME,
    "middle": android.provider.ContactsContract.CommonDataKinds.StructuredName.MIDDLE_NAME,
    "prefix": android.provider.ContactsContract.CommonDataKinds.StructuredName.PREFIX,
    "suffix": android.provider.ContactsContract.CommonDataKinds.StructuredName.SUFFIX
  },
  "phone": {
    //"_ID": android.provider.ContactsContract.CommonDataKinds.Phone._ID,
    "number": android.provider.ContactsContract.CommonDataKinds.Phone.NUMBER,
    "type": android.provider.ContactsContract.CommonDataKinds.Phone.TYPE,
    "labels" : [] // define them dynamically later
  },
  "email": {
    //"_ID": android.provider.ContactsContract.CommonDataKinds.Email._ID,
    "data": android.provider.ContactsContract.CommonDataKinds.Email.DATA,
    "type": android.provider.ContactsContract.CommonDataKinds.Email.TYPE,
    "labels" : [] // define them dynamically later
  },
  "address": {
    //"_ID": android.provider.ContactsContract.CommonDataKinds.StructuredPostal._ID,
    "type": android.provider.ContactsContract.CommonDataKinds.Organization.TYPE,
    "formatted_address": android.provider.ContactsContract.CommonDataKinds.StructuredPostal.FORMATTED_ADDRESS,
    "street": android.provider.ContactsContract.CommonDataKinds.StructuredPostal.STREET,
    "city": android.provider.ContactsContract.CommonDataKinds.StructuredPostal.CITY,
    "region": android.provider.ContactsContract.CommonDataKinds.StructuredPostal.REGION,
    "postcode": android.provider.ContactsContract.CommonDataKinds.StructuredPostal.POSTCODE,
    "country": android.provider.ContactsContract.CommonDataKinds.StructuredPostal.COUNTRY,
    "labels" : [] // define them dynamically later
  },
  "organization": {
    //"_ID": android.provider.ContactsContract.CommonDataKinds.Organization._ID,
    "type": android.provider.ContactsContract.CommonDataKinds.Organization.TYPE,
    "department": android.provider.ContactsContract.CommonDataKinds.Organization.DEPARTMENT,
    "company": android.provider.ContactsContract.CommonDataKinds.Organization.COMPANY,
    "title": android.provider.ContactsContract.CommonDataKinds.Organization.TITLE,
    "labels" : [] // define them dynamically later
  },
  "note": android.provider.ContactsContract.CommonDataKinds.Note.NOTE,
  "nickname": android.provider.ContactsContract.CommonDataKinds.Nickname.NAME,
  "website": {
    //"_ID": android.provider.ContactsContract.CommonDataKinds.Website._ID,
    "url": android.provider.ContactsContract.CommonDataKinds.Website.URL,
    "type": android.provider.ContactsContract.CommonDataKinds.Website.TYPE,
    "labels" : [] // define them dynamically later
  }
}

DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_ASSISTANT]='assistant';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_CALLBACK]='callback';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_CAR]='car';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_COMPANY_MAIN]='company_main';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_FAX_HOME]='fax_home';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_FAX_WORK]='fax_home';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_HOME]='home';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_ISDN]='isdn';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_MAIN]='main';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_MMS]='mms';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_MOBILE]='mobile';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_OTHER]='other';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_OTHER_FAX]='other_fax';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_PAGER]='pager';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_WORK]='work';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_WORK_MOBILE]='work_mobile';
DATA_TYPES.phone.labels[android.provider.ContactsContract.CommonDataKinds.Phone.TYPE_WORK_PAGER]='work_pager';
DATA_TYPES.organization.labels[android.provider.ContactsContract.CommonDataKinds.Organization.TYPE_WORK]='work';
DATA_TYPES.organization.labels[android.provider.ContactsContract.CommonDataKinds.Organization.TYPE_OTHER]='other';
DATA_TYPES.website.labels[android.provider.ContactsContract.CommonDataKinds.Website.TYPE_BLOG]='blog';
DATA_TYPES.website.labels[android.provider.ContactsContract.CommonDataKinds.Website.TYPE_FTP]='ftp';
DATA_TYPES.website.labels[android.provider.ContactsContract.CommonDataKinds.Website.TYPE_HOME]='home';
DATA_TYPES.website.labels[android.provider.ContactsContract.CommonDataKinds.Website.TYPE_HOMEPAGE]='homepage';
DATA_TYPES.website.labels[android.provider.ContactsContract.CommonDataKinds.Website.TYPE_OTHER]='other';
DATA_TYPES.website.labels[android.provider.ContactsContract.CommonDataKinds.Website.TYPE_PROFILE]='profile';
DATA_TYPES.website.labels[android.provider.ContactsContract.CommonDataKinds.Website.TYPE_WORK]='work';
DATA_TYPES.address.labels[android.provider.ContactsContract.CommonDataKinds.StructuredPostal.TYPE_OTHER]='other';
DATA_TYPES.address.labels[android.provider.ContactsContract.CommonDataKinds.StructuredPostal.TYPE_WORK]='work';
DATA_TYPES.address.labels[android.provider.ContactsContract.CommonDataKinds.StructuredPostal.TYPE_HOME]='home';
DATA_TYPES.email.labels[android.provider.ContactsContract.CommonDataKinds.Email.TYPE_HOME]='home';
DATA_TYPES.email.labels[android.provider.ContactsContract.CommonDataKinds.Email.TYPE_MOBILE]='mobile';
DATA_TYPES.email.labels[android.provider.ContactsContract.CommonDataKinds.Email.TYPE_OTHER]='other';
DATA_TYPES.email.labels[android.provider.ContactsContract.CommonDataKinds.Email.TYPE_WORK]='work';

exports.DATA_TYPES=DATA_TYPES;