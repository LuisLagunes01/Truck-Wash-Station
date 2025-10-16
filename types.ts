
export interface CustomerName {
  fullName: string;
  name: string | null;
  paternalLastName: string | null;
  maternalLastName: string | null;
}

export interface BillingInfo {
  rfc: string;
  taxRegime: string;
  taxPostalCode: string;
}

export interface Address {
  street: string;
  exteriorNumber: string;
  interiorNumber: string | null;
  neighborhood: string;
  municipality: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Contact {
  email: string | null;
  phone: string | null;
}

export type VehicleType = 'Tractor' | 'Remolque' | 'Camion' | 'Auto' | 'Pickup' | 'Camioneta';

export interface Vehicle {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  plates: string;
  color: string;
  kms: string;
}


export interface CustomerData {
  id: string;
  customerName: CustomerName;
  billingInfo: BillingInfo;
  address: Address;
  contact: Contact;
  vehicles?: Vehicle[];
}

export type TrailerType =
  | 'Caja Estándar'
  | 'Pipa / Cilindro Estándar'
  | 'Pipa / Cilindro Chica'
  | 'Caja Ganadera / Vehículos'
  | 'Caja Chica'
  | 'Caja Grande'
  | 'Plataforma'
  | '';

export interface Trailer {
  id: number;
  type: TrailerType;
}

// --- Light vehicles ---
export type LightVehicleType = 'auto' | 'camioneta' | 'pickup';
export type VehicleSize = 'chico' | 'grande';
export type LightVehiclePackage = 'basico' | 'plus' | 'premium' | 'ninguno';

export interface LightVehicleSelection {
  vehicleType: LightVehicleType | '';
  vehicleSize: VehicleSize | '';
  package: LightVehiclePackage;
  aLaCarta: {
    lavadoMotor: boolean;
    limpiezaTelas: boolean;
    limpiezaPiel: boolean;
    restauracionFaros: boolean;
  };
}

// --- Unitary Trucks ---
export type CamionUnitarioType = 'rabon35' | 'rabon5' | 'rabon8' | 'torton' | 'tortonEnjarascado' | '';

export interface CamionUnitarioSelection {
    type: CamionUnitarioType;
    services: {
        exterior: boolean;
        chasis: boolean;
        motor: boolean;
    };
}

// --- Main Selection Object ---
export interface VehicleSelection {
  tractor: {
    exterior: boolean;
    interior: boolean;
  };
  trailers: Trailer[];
  isVehiclePackage: boolean;
  additionalServices: {
    pulidoDetallado: boolean;
    detalleInteriorCabina: boolean;
  };
  lightVehicleSelection: LightVehicleSelection;
  camionUnitarioSelection: CamionUnitarioSelection;
}

export type QuotationPrefix = 'COT-TRACTO' | 'COT-CAMION' | 'COT-AUTO';

export interface Quotation {
  id: string;
  customerId: string;
  vehicleSelection: VehicleSelection;
  createdAt: Date;
  total: number;
  type: QuotationPrefix;
}

export interface ChecklistStep {
  id: string;
  label: string;
}

export interface ChecklistSection {
  title: string;
  steps: ChecklistStep[];
  className?: string;
}

export interface GeneratedChecklist {
  safety: ChecklistSection[];
  tractor?: ChecklistSection[];
  trailers: {
    id: number;
    title: string;
    sections: ChecklistSection[];
  }[];
  additional?: ChecklistSection;
}

// --- Price List Structure ---

interface TractocamionPrices {
  tractor: {
    exterior: number;
    interior: number;
  };
  trailer: {
    'Caja Estándar': number;
    'Pipa / Cilindro Estándar': number;
    'Pipa / Cilindro Chica': number;
    'Caja Ganadera / Vehículos': number;
    'Caja Chica': number;
    'Caja Grande': number;
    'Plataforma': number;
  };
  packages: {
      tractorComplete: number;
      vehicleCompleteDiscount: number;
  };
  additional: {
    pulidoDetallado: number;
    detalleInteriorCabina: number;
  };
}

interface CamionUnitarioPrices {
    rabon35: { exterior: number; chasis: number; motor: number; };
    rabon5: { exterior: number; chasis: number; motor: number; };
    rabon8: { exterior: number; chasis: number; motor: number; };
    torton: { exterior: number; chasis: number; motor: number; };
    tortonEnjarascado: { exterior: number; chasis: number; motor: number; };
}

interface LightVehiclePrices {
  packages: {
    auto: { chico: { basico: number; plus: number; premium: number; }; grande: { basico: number; plus: number; premium: number; } };
    camioneta: { chico: { basico: number; plus: number; premium: number; }; grande: { basico: number; plus: number; premium: number; } };
    pickup: { chico: { basico: number; plus: number; premium: number; }; grande: { basico: number; plus: number; premium: number; } };
  };
  aLaCarta: {
    lavadoMotor: number;
    limpiezaTelas: number;
    limpiezaPiel: number;
    restauracionFaros: number;
  }
}

export interface PriceList {
  tractocamion: TractocamionPrices;
  camionUnitario: CamionUnitarioPrices;
  lightVehicle: LightVehiclePrices;
}
