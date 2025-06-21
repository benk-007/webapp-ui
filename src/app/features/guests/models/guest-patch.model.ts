import { AddressModel } from '../../../shared/models/address.model';
import { ContactModel } from '../../../shared/models/contact.model';
import { DocumentModel } from '../../../shared/models/document.model';
import {AuditGetModel} from "../../../shared/models/audit-get.model";

export interface GuestItemPatchModel {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  address?: AddressModel;
  contact?: ContactModel;
}
