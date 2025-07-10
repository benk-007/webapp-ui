import { AuditGetModel } from "../../../shared/models/audit-get.model";

export interface IncidentImageGetModel {
  id: string;
  fileName: string;
  audit: AuditGetModel;
}
