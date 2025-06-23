import {AddressModel} from '../../../shared/models/address.model';
import {ContactModel} from '../../../shared/models/contact.model';
import {IdentityDocumentPostModel} from "./identity-document-post.model";

export interface GuestItemPostModel {
  firstName: string;
  lastName: string;
  birthDate: string;
  address?: AddressModel;
  contact?: ContactModel;
  identityDocument?: IdentityDocumentPostModel;
}
