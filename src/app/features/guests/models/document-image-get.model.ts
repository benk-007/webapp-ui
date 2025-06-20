import {AuditGetModel} from "../../../shared/models/audit-get.model";

export interface DocumentImageGetModel {
  id: string;
  fileName: string;
  audit: AuditGetModel;
}
