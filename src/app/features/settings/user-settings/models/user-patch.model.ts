import {RoleEnum} from "./role.enum";

export interface UserPatchModel {
  fullName: string;
  email: string;
  mobile: string;
  roles: RoleEnum[];
  enabled: boolean;
}
