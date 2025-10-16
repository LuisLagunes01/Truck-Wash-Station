
import { ChecklistSection, ChecklistStep, TrailerType, PriceList } from './types';

const createSteps = (labels: string[]): ChecklistStep[] =>
  labels.map((label, index) => ({ id: `${label.replace(/\s+/g, '-')}-${index}`, label }));

export const DEFAULT_PRICE_LIST: PriceList = {
  tractocamion: {
    tractor: {
      exterior: 650,
      interior: 350,
    },
    trailer: {
      'Caja Estándar': 950,
      'Pipa / Cilindro Estándar': 1050,
      'Pipa / Cilindro Chica': 900,
      'Caja Ganadera / Vehículos': 1550,
      'Caja Chica': 800,
      'Caja Grande': 1100,
      'Plataforma': 850,
    },
    packages: {
        tractorComplete: 950, // Paquete 1: Lavado Completo de Tractor (S1 + S2)
        vehicleCompleteDiscount: 150, // Paquete 2 discount
    },
    additional: {
      pulidoDetallado: 4000,
      detalleInteriorCabina: 800,
    },
  },
  camionUnitario: {
    rabon35: { exterior: 550, chasis: 250, motor: 300 },
    rabon5: { exterior: 650, chasis: 300, motor: 350 },
    rabon8: { exterior: 750, chasis: 350, motor: 400 },
    torton: { exterior: 850, chasis: 400, motor: 450 },
    tortonEnjarascado: { exterior: 1050, chasis: 450, motor: 500 },
  },
  lightVehicle: {
    packages: {
      auto: {
        chico: { basico: 130, plus: 280, premium: 800 },
        grande: { basico: 150, plus: 320, premium: 950 }
      },
      camioneta: {
        chico: { basico: 160, plus: 350, premium: 1000 },
        grande: { basico: 180, plus: 400, premium: 1200 }
      },
      pickup: {
        chico: { basico: 170, plus: 380, premium: 1100 },
        grande: { basico: 190, plus: 430, premium: 1300 }
      }
    },
    aLaCarta: {
      lavadoMotor: 400,
      limpiezaTelas: 800,
      limpiezaPiel: 900,
      restauracionFaros: 500
    }
  }
};


export const SAFETY_GENERAL: ChecklistSection = {
  title: '⚠️ Checklist de Seguridad y EPP',
  className: 'p-6 rounded-lg bg-red-100 border border-red-300 mb-6',
  steps: createSteps([
    'Verificación de la Unidad y el Área de Trabajo (Inspección Visual).',
    'Conexión a tierra de la unidad.',
    'EPP: Guantes industriales (nitrilo para químicos, de carnaza para trabajos pesados).',
    'EPP: Gafas de seguridad o careta facial.',
    'EPP: Casco de seguridad.',
    'EPP: Botas con punta de acero y suela antiderrapante.',
    'EPP: Chaleco de alta visibilidad.',
  ]),
};

export const SAFETY_CISTERNA: ChecklistSection = {
  title: '🚨 Seguridad para Lavado Interior de Cisternas',
  className: 'p-6 rounded-lg bg-yellow-100 border border-yellow-300 mb-6',
  steps: createSteps([
    'Monitoreo de LEL (0%) y O2 (19.5%-20.9%) antes de iniciar el lavado interior.',
    'Verificación de desgasificación del tanque.',
    'Apertura y ventilación de la cisterna con equipos adecuados.',
    'EPP Específico: Mascarilla de protección respiratoria con filtro adecuado.',
    'Disponibilidad: Extintor de incendios cercano y en buen estado.',
  ]),
};


const COMMON_STEPS = {
  RECEPTION: { title: '1. Recepción', steps: createSteps(['Inspección visual', 'Verificación de carga previa']) },
  PREWASH: { title: '2. Prelavado', steps: createSteps(['Aplicación de agua a alta presión', 'Limpieza de bajos']) },
  WASH: { title: '3. Lavado', steps: createSteps(['Aplicación de detergente/shampoo', 'Cepillado de carrocería y neumáticos']) },
  ENJUAGUE: { title: '5. Enjuague', steps: createSteps(['Enjuague con agua a presión', 'Enjuague con agua desmineralizada']) },
  SECADO: { title: '6. Secado', steps: createSteps(['Secado con aire comprimido', 'Aplicación de lubricante en piezas móviles']) },
  CABINA: { title: '7. Limpieza Cabina', steps: createSteps(['Aspirado y limpieza de cabina']) },
};

export const CHECKLIST_TRACTOR_CAJASECA: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  COMMON_STEPS.WASH,
  { title: '4. Interior', steps: createSteps(['Procedimiento Específico: Limpieza Interior']) },
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA
];

export const CHECKLIST_REFRIGERADO: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  { ...COMMON_STEPS.WASH, steps: [...COMMON_STEPS.WASH.steps, {id: 'desincrustante', label: 'Aplicación de desincrustante'}] },
  { title: '4. Interior', steps: createSteps(['Procedimiento Específico: Limpieza Interior']) },
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA,
  { title: '8. Certificación', steps: createSteps(['Sanitización y fumigación', 'Emisión de certificado de lavado']) },
];

export const CHECKLIST_TOLVA: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  { ...COMMON_STEPS.WASH, steps: [...COMMON_STEPS.WASH.steps, {id: 'desincrustante', label: 'Aplicación de desincrustante'}] },
  { title: '4. Interior', steps: createSteps(['Procedimiento Específico: Limpieza Interior']) },
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA,
];

export const CHECKLIST_PLATAFORMA: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  COMMON_STEPS.WASH,
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA,
];

export const CHECKLIST_CISTERNA: ChecklistSection[] = [
    COMMON_STEPS.RECEPTION,
    COMMON_STEPS.PREWASH,
    { ...COMMON_STEPS.WASH, steps: [...COMMON_STEPS.WASH.steps, { id: 'desincrustante', label: 'Aplicación de desincrustante' }] },
    { title: '4. Interior', steps: createSteps(['Vaporización y Desgasificación', 'Procedimiento Específico: Limpieza Interior']) },
    COMMON_STEPS.ENJUAGUE,
    COMMON_STEPS.SECADO,
    COMMON_STEPS.CABINA,
    { title: '8. Certificación', steps: createSteps(['Medición de gases', 'Emisión de certificado de lavado']) },
];

export const CHECKLIST_MAPPING: Record<TrailerType, ChecklistSection[] | null> = {
    'Caja Estándar': CHECKLIST_TRACTOR_CAJASECA,
    'Caja Chica': CHECKLIST_TRACTOR_CAJASECA,
    'Caja Grande': CHECKLIST_TRACTOR_CAJASECA,
    'Caja Ganadera / Vehículos': CHECKLIST_PLATAFORMA, // Assuming similar to platform
    'Pipa / Cilindro Estándar': CHECKLIST_CISTERNA,
    'Pipa / Cilindro Chica': CHECKLIST_CISTERNA,
    'Plataforma': CHECKLIST_PLATAFORMA,
    '': null,
};
