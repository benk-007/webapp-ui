import { AddressModel } from '../../../shared/models/address.model';
import {ContactModel} from "../../../shared/models/contact.model";

export interface MultiUnitPostModel {
  name: string;
  nature: string,
  calendarColor?: string;
  address: AddressModel;
  contact: ContactModel;
  subUnits: SubUnitModel[];
}

export interface SubUnitModel {
  // Pour unité existante
  unitId?: string;

  // Pour nouvelle sous-unité
  name?: string;
  priority?: number;
  readiness?: boolean;
}
