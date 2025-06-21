import { ContactModel } from "../../../shared/models/contact.model";
import { AuditGetModel } from "../../../shared/models/audit-get.model";
import { AddressModel } from "../../../shared/models/address.model";
import { DocumentModel } from "../../../shared/models/document.model";

export interface GuestItemGetModel {
  id: string;
  audit: AuditGetModel;
  firstName: string;
  lastName: string;
  birthDate: string;
  address: AddressModel;
  contact: ContactModel;
  withIdentityDocument: boolean;
}
