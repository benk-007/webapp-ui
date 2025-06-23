import {AuditGetModel} from "../../../shared/models/audit-get.model";

export interface IdentityDocumentItemGetModel {
  id: string;
  type: 'IDENTITY_CARD' | 'PASSPORT' | 'DRIVER_LICENCE' | 'OTHER';
  value: string;
  expirationDate: string;
  fileProvided: boolean;
  audit: AuditGetModel;
}
