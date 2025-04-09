import {AuditGetModel} from "../../../../shared/models/audit-get.model";
import {RoleEnum} from "./role.enum";

export interface UserListItemGetModel{

  id: string;
  fullName: string;
  mobile: string;
  email: string;
  enabled: boolean;
  activated: boolean;
  roles: RoleEnum[];
  audit: AuditGetModel;

}
