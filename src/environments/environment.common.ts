export const UAA_SERVICE = 'authMgtApi/';
export const UNIT_SERVICE = 'unitMgtApi/';
export const GUEST_SERVICE ='guestMgtApi/'

export const commonProperties = {
  //authentication
  login: UAA_SERVICE + 'login',

  //forgot-password
  forgotPassword: UAA_SERVICE + 'forgot-password',

  //refresh-token
  refreshToken: UAA_SERVICE + 'refresh-token',

  //reset-password
  resetPassword: UAA_SERVICE + 'reset-password',

  //change-password
  changePassword: UAA_SERVICE + 'change-password',

  //validate-account
  validateAccount: UAA_SERVICE + 'validate-account',

  //user-management
  userList: UAA_SERVICE + 'users',
  userById: UAA_SERVICE + 'users/:userId',

  //unit
  unitList: UNIT_SERVICE + 'units',
  unitById: UNIT_SERVICE + 'units/:unitId',
  unitInfosById: UNIT_SERVICE + 'units/:unitId/infos',
  unitDetailsById: UNIT_SERVICE + 'units/:unitId/details',
  unitInstructionsById: UNIT_SERVICE + 'units/:unitId/inst',
  unitRoomsById: UNIT_SERVICE + 'units/:unitId/rooms',
  unitRoomById: UNIT_SERVICE + 'units/:unitId/rooms/:roomId',

  //rate
  unitBaseRateById: UNIT_SERVICE + 'units/:unitId/rates/default',

  //unit images
  unitImages: UNIT_SERVICE + 'images',
  unitImageById: UNIT_SERVICE + 'images/:imageId',

  //guests
  guestList: GUEST_SERVICE + 'guests',
  guestById: GUEST_SERVICE + 'guests/:guestId',

  //documents
  idDocuments: GUEST_SERVICE + 'id-documents',

  // id-document images
  idDocumentImages: GUEST_SERVICE + 'images',
  idDocumentImageById: GUEST_SERVICE + 'images/:imageId',

}
