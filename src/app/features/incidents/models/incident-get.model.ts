import { AuditGetModel } from "../../../shared/models/audit-get.model";
import { SeverityEnum } from '../enums/severity.enum';
import { StatusEnum } from '../enums/status.enum';
import { CategoryModel } from './category.model';
import {UserRefModel} from "./user-ref.model";
import {RentalRefModel} from "./rental-ref.model";

export interface IncidentGetModel {
  id: string;
  name: string;
  reporter: UserRefModel;
  reviewer?: UserRefModel;
  rental?: RentalRefModel;
  severity: SeverityEnum;
  status: StatusEnum;
  categories: CategoryModel[];
  tags?: string;
  description?: string;
  audit: AuditGetModel;
}
