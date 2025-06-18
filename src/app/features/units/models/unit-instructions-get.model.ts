export interface UnitInstructionsGetModel {
  id?: string;
  audit?: {
    createdBy?: string;
    createdAt?: string;
    modifiedBy?: string;
    modifiedAt?: string;
  };
  checkTimes?: {
    checkInTime?: string;
    checkOutTime?: string;
    timeZone?: string;
  };
  accessCodes?: {
    wifiName?: string;
    wifiPassword?: string;
    securityCode?: string;
    keyPickup?: string;
  };
  instructions?: {
    checkInInstructions?: string;
    checkOutInstructions?: string;
    directions?: string;
    houseRules?: string;
    specialInstructions?: string;
  };
  payment?: {
    paymentTerms?: string;
    paymentInstructions?: string;
  };
}
