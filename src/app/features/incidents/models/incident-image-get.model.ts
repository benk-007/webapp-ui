import { AuditGetModel } from "../../../shared/models/audit-get.model";
import { SafeUrl } from "@angular/platform-browser";

export interface IncidentImageGetModel {
  id: string;
  fileName: string;
  fileSize?: number;
  imageUrl?: SafeUrl;
  audit: AuditGetModel;
}
