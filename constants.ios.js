var HOME_FAX = "_$!<HomeFAX>!$_";
var WORK_FAX = "_$!<WorkFAX>!$_";
var MAIN = "_$!<Main>!$_";

exports.getGenericLabel = (nativeLabel) => {
  var genericLabel = nativeLabel;

  switch (nativeLabel) {
    case CNLabelHome:
      genericLabel = 'home';
      break;
    case CNLabelWork:
      genericLabel = 'work';
      break;
    case CNLabelOther:
      genericLabel = 'other';
      break;
  };

  return genericLabel;
};


exports.getPhoneLabel = (nativeLabel) => {
  var phoneLabel = exports.getGenericLabel(nativeLabel);

  switch (nativeLabel) {
    case kABPersonPhoneMobileLabel:
      phoneLabel = "mobile";
      break;
    case HOME_FAX:
      phoneLabel = 'fax_home';
      break;
    case WORK_FAX:
      phoneLabel = 'fax_work';
      break;
    case kABPersonPhonePagerLabel:
      phoneLabel = 'pager';
      break;
    case MAIN:
      phoneLabel = 'main';
      break;
  };

  return phoneLabel;
};

exports.getWebsiteLabel = (nativeLabel) => {
  var websiteLabel = exports.getGenericLabel(nativeLabel);

  switch (nativeLabel) {
    case CNLabelURLAddressHomePage:
      websiteLabel = "homepage";
      break;
  };

  return websiteLabel;
};
