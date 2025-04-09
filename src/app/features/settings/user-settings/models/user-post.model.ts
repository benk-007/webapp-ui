import {RoleEnum} from "./role.enum";

export interface UserPostModel {
  fullName: string;
  email: string;
  mobile: string;
  roles: RoleEnum[];
}
