import { SeverityEnum } from '../enums/severity.enum';
import { StatusEnum } from '../enums/status.enum';

export interface IncidentPostModel {
  name: string;
  reporterId: string;
  reviewerId?: string;
  rentalId?: string;
  severity?: SeverityEnum;
  status?: StatusEnum;
  categoryIds: string[];
  tags?: string;
  description?: string;
}
