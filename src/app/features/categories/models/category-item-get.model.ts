import { AuditGetModel } from "../../../shared/models/audit-get.model";

export interface CategoryItemGetModel {
  id: string;
  name: string;
  audit: AuditGetModel;
}
