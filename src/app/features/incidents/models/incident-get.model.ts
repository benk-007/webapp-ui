import { AuditGetModel } from "../../../shared/models/audit-get.model";
import { SeverityEnum } from '../enums/severity.enum';
import { StatusEnum } from '../enums/status.enum';
import { CategoryModel } from './category.model';

export interface IncidentGetModel {
  id: string;
  name: string;
  reporterId: string;
  reviewerId?: string;
  rentalId?: string;
  severity: SeverityEnum;
  status: StatusEnum;
  categories: CategoryModel[];
  tags?: string;
  description?: string;
  audit: AuditGetModel;
}
