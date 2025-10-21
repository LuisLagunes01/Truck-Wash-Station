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

const COMMON_STEPS = {
  RECEPTION: {
    title: '1. Recepción e Inspección Inicial',
    steps: createSteps([
      'Confirmar servicios solicitados con el cliente.',
      'Inspección visual de 360° del vehículo.',
      'Fotografiar todos los lados del vehículo, destacando daños preexistentes (rayones, abolladuras).',
      'Verificar y registrar daños en el formato de Orden de Servicio.',
      'Revisar si hay objetos personales de valor a la vista y notificar al cliente para que los retire.',
      'Verificar el tipo de carga previa (si aplica) para determinar químicos a usar.'
    ])
  },
  PREWASH: {
    title: '2. Prelavado y Descontaminación',
    steps: createSteps([
      'Aplicación de agua a alta presión para remover lodo y suciedad superficial.',
      'Limpieza profunda de chasis, bajos, loderas y rines con agua a presión.',
      'Aplicación de desengrasante en motor (si se solicitó), chasis y rines.',
      'Dejar actuar el desengrasante según especificaciones del producto (aprox. 5 min).'
    ])
  },
  WASH: {
    title: '3. Lavado Exterior Detallado',
    steps: createSteps([
      'Aplicación de shampoo o detergente especializado con espumadora para cubrir toda la superficie.',
      'Cepillado manual de toda la carrocería, empezando de arriba hacia abajo.',
      'Uso de cepillos suaves para superficies pintadas, emblemas y vidrios.',
      'Uso de cepillos de cerdas duras para llantas y partes bajas.',
      'Atención especial a parrilla, defensas y áreas de difícil acceso con cepillos pequeños.'
    ])
  },
  ENJUAGUE: {
    title: '4. Enjuague Completo',
    steps: createSteps([
      'Enjuague completo con agua a presión para retirar todo el producto de limpieza, de arriba hacia abajo.',
      'Asegurarse de enjuagar bien debajo de los guardabarros, chasis y cavidades.',
      'Enjuague final con agua desmineralizada (si está disponible) para evitar manchas de sarro.'
    ])
  },
  SECADO: {
    title: '5. Secado y Acabado',
    steps: createSteps([
      'Secado de superficies grandes y vidrios con jaladores de aire de silicón.',
      'Secado de detalles, manijas, espejos y molduras con toallas de microfibra limpias.',
      'Uso de aire comprimido para expulsar agua de lugares difíciles.',
      'Aplicación de abrillantador en llantas y molduras plásticas exteriores.',
      'Lubricación de bisagras y chapas (si es solicitado).'
    ])
  },
  CABINA: {
    title: '6. Limpieza de Cabina',
    steps: createSteps([
      'Retirar tapetes y sacudirlos o lavarlos según el material.',
      'Retirar basura general de la cabina.',
      'Aspirado profundo de asientos, alfombras, piso y debajo de los asientos.',
      'Limpieza de tablero, consola central y paneles de puertas con producto para interiores.',
      'Limpieza de vidrios y espejos interiores hasta que queden sin marcas.',
      'Colocación de tapetes limpios y aromatizante (si el cliente lo aprueba).'
    ])
  },
  INSPECTION: {
      title: '7. Inspección Final de Calidad',
      steps: createSteps([
          'Revisión final de la limpieza exterior, buscando residuos de jabón, manchas o áreas omitidas.',
          'Revisión de la limpieza interior, asegurando que no haya polvo o basura.',
          'Verificar que los vidrios estén limpios por dentro y por fuera.',
          'Confirmar que todos los servicios adicionales solicitados (motor, chasis, etc.) se completaron correctamente.',
          'Notificar al cliente que el vehículo está listo para la entrega.'
      ])
  }
};


export const CHECKLIST_TRACTOR_CAJASECA: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  COMMON_STEPS.WASH,
  { title: 'Proceso: Lavado Interior de Caja Seca', steps: createSteps([
      'Barrido o soplado de residuos sólidos y polvo.',
      'Lavado a presión de paredes y piso interior con detergente neutro.',
      'Enjuague completo del interior.',
      'Dejar puertas abiertas para ventilación y secado.'
    ])
  },
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA,
  COMMON_STEPS.INSPECTION
];

export const CHECKLIST_REFRIGERADO: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  { ...COMMON_STEPS.WASH, steps: [...COMMON_STEPS.WASH.steps, {id: 'desincrustante-refri', label: 'Aplicación de desincrustante en áreas metálicas si es necesario'}] },
  { title: 'Proceso: Lavado y Sanitización Interior Caja Refrigerada', steps: createSteps([
      'Lavado a presión de interior con jabón grado alimenticio.',
      'Enjuague abundante para eliminar todo residuo.',
      'Aplicación de solución sanitizante en paredes, piso y techo.',
      'Dejar actuar el sanitizante por el tiempo especificado.',
      'Enjuague final (si el producto lo requiere) y secado.',
    ]) 
  },
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA,
  { title: 'Proceso: Certificación', steps: createSteps(['Verificación de limpieza con lámpara UV (si aplica)', 'Emisión de certificado de lavado y sanitización.']) },
  COMMON_STEPS.INSPECTION,
];

export const CHECKLIST_TOLVA: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  { ...COMMON_STEPS.WASH, steps: [...COMMON_STEPS.WASH.steps, {id: 'desincrustante-tolva', label: 'Aplicación de desincrustante para cemento/residuos'}] },
  { title: 'Proceso: Limpieza Interior de Tolva', steps: createSteps([
      'Apertura de válvulas y soplado de residuos con aire a presión.',
      'Lavado interior a alta presión para desprender material adherido.',
      'Inspección visual para asegurar que no queden residuos.'
    ]) 
  },
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA,
  COMMON_STEPS.INSPECTION,
];

export const CHECKLIST_PLATAFORMA: ChecklistSection[] = [
  COMMON_STEPS.RECEPTION,
  COMMON_STEPS.PREWASH,
  COMMON_STEPS.WASH,
  { title: 'Proceso: Lavado de Plataforma', steps: createSteps([
      'Atención especial al lavado de la superficie de carga.',
      'Limpieza de cadenas, ganchos y puntos de anclaje.',
      'Desengrasado de áreas con residuos de aceite o grasa.'
  ]) },
  COMMON_STEPS.ENJUAGUE,
  COMMON_STEPS.SECADO,
  COMMON_STEPS.CABINA,
  COMMON_STEPS.INSPECTION,
];

export const CHECKLIST_CISTERNA: ChecklistSection[] = [
    COMMON_STEPS.RECEPTION,
    COMMON_STEPS.PREWASH,
    { ...COMMON_STEPS.WASH, steps: [...COMMON_STEPS.WASH.steps, { id: 'desincrustante-cisterna', label: 'Aplicación de desincrustante específico para el producto transportado' }] },
    { title: 'Proceso: Lavado Exterior de Cisterna', steps: createSteps([
        'Limpieza detallada de domos, válvulas de descarga y conexiones.',
        'Cepillado de pasarelas y escaleras.',
        'Pulido de áreas de acero inoxidable o aluminio (si se solicita).',
    ]) },
    COMMON_STEPS.ENJUAGUE,
    COMMON_STEPS.SECADO,
    COMMON_STEPS.CABINA,
    COMMON_STEPS.INSPECTION,
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