import {AuditGetModel} from "../../../shared/models/audit-get.model";
import {SafeUrl} from "@angular/platform-browser";

export interface ImageGetModel {
  id: string;
  cover: boolean;
  fileName: string;
  imageUrl: SafeUrl;
  audit: AuditGetModel;
}
