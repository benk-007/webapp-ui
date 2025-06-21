import {AuditGetModel} from "../../../shared/models/audit-get.model";

export interface DocumentItemGetModel {
  id: string;
  type: 'IDENTITY_CARD' | 'PASSPORT' | 'DRIVER_LICENCE';
  documentNumber: string;
  expirationDate: string;
  hasImage?: boolean;
  audit: AuditGetModel;
}
