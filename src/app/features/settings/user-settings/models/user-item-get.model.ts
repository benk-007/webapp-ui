import {AuditGetModel} from "../../../../shared/models/audit-get.model";
import {RoleEnum} from "./role.enum";

export interface UserItemGetModel {

  id: string;
  fullName: string;
  mobile: string;
  email: string;
  enabled: boolean;
  activated: boolean;
  roles: RoleEnum[];
  audit: AuditGetModel;

}
