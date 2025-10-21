
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CustomerData, Quotation, VehicleSelection, Trailer, TrailerType, ChecklistSection, ChecklistStep, PriceList, LightVehicleSelection, Vehicle, VehicleType, QuotationPrefix, CamionUnitarioSelection, CamionUnitarioType } from './types';
import { DEFAULT_PRICE_LIST, SAFETY_GENERAL, CHECKLIST_MAPPING } from './constants';

// FIX: Replaced the previously broken Base64 string with a clean, reliable SVG icon to ensure the logo always displays correctly.
const TRUCK_ICON_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231A3B4A'%3E%3Cpath d='M20.5 13.5C21.3284 13.5 22 12.8284 22 12C22 11.1716 21.3284 10.5 20.5 10.5H19V8.5C19 7.67157 18.3284 7 17.5 7H14V3.5C14 2.67157 13.3284 2 12.5 2H4.5C3.67157 2 3 2.67157 3 3.5V16.5C3 17.3284 3.67157 18 4.5 18H7.5C7.5 19.6569 8.84315 21 10.5 21C12.1569 21 13.5 19.6569 13.5 18H16.5C16.5 19.6569 17.8431 21 19.5 21C21.1569 21 22.5 19.6569 22.5 18H23V16.5C23 14.8431 21.6569 13.5 20.5 13.5ZM10.5 19.5C9.67157 19.5 9 18.8284 9 18C9 17.1716 9.67157 16.5 10.5 16.5C11.3284 16.5 12 17.1716 12 18C12 18.8284 11.3284 19.5 10.5 19.5ZM19.5 19.5C18.6716 19.5 18 18.8284 18 18C18 17.1716 18.6716 16.5 19.5 16.5C20.3284 16.5 21 17.1716 21 18C21 18.8284 20.3284 19.5 19.5 19.5ZM17.5 15H14.2121C13.8213 15.632 13.203 16.1363 12.4856 16.4468C11.9787 16.1471 11.5312 15.7497 11.1818 15.2829L11.1712 15H4.5V3.5H12.5V15H13.5V8.5H17.5V15Z'/%3E%3C/svg%3E`;

const initialCustomerData: Omit<CustomerData, 'id'> = {
  customerName: { fullName: '', name: null, paternalLastName: null, maternalLastName: null },
  billingInfo: { rfc: '', taxRegime: '', taxPostalCode: '' },
  address: { street: '', exteriorNumber: '', interiorNumber: '', neighborhood: '', municipality: '', state: '', postalCode: '', country: 'México' },
  contact: { email: null, phone: null },
  vehicles: []
};

const initialLightVehicleSelection: LightVehicleSelection = {
  vehicleType: '',
  vehicleSize: '',
  package: 'ninguno',
  aLaCarta: {
    lavadoMotor: false,
    limpiezaTelas: false,
    limpiezaPiel: false,
    restauracionFaros: false
  }
};

const initialCamionUnitarioSelection: CamionUnitarioSelection = {
    type: '',
    services: {
        exterior: false,
        chasis: false,
        motor: false,
    },
};

const initialVehicleSelection: VehicleSelection = {
  tractor: { exterior: false, interior: false },
  trailers: [],
  isVehiclePackage: false,
  additionalServices: {
    pulidoDetallado: false,
    detalleInteriorCabina: false
  },
  lightVehicleSelection: initialLightVehicleSelection,
  camionUnitarioSelection: initialCamionUnitarioSelection,
};

const handlePrint = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
        document.body.classList.add('printing');
        section.classList.add('active-print');
        window.print();
        section.classList.remove('active-print');
        document.body.classList.remove('printing');
    }
};

const Home: React.FC<{
    onNavigate: (view: 'register' | 'search' | 'priceSettings') => void;
    onQuickQuote: () => void;
}> = ({ onNavigate, onQuickQuote }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <img src={TRUCK_ICON_SVG} alt="Truck Wash Station Icon" className="w-24 h-24 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-800">TRUCK WASH STATION</h1>
                    <p className="text-slate-500 mt-1">Sistema de Gestión de Servicios</p>
                </div>

                <div className="space-y-4 pt-4">
                    <button onClick={() => onNavigate('register')} className="w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-6 py-3 transition-all duration-200 transform hover:scale-105">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                        Registrar Cliente
                    </button>
                    <button onClick={onQuickQuote} className="w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg px-6 py-3 transition-all duration-200 transform hover:scale-105">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h3l-3-3M9 17v-3m3 3h3l-3-3M9 10h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        Cotización Rápida
                    </button>
                    <button onClick={() => onNavigate('search')} className="w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-slate-600 hover:bg-slate-700 rounded-lg px-6 py-3 transition-all duration-200 transform hover:scale-105">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        Buscar
                    </button>
                    <button onClick={() => onNavigate('priceSettings')} className="w-full flex items-center justify-center gap-3 text-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded-lg px-6 py-3 transition-all duration-200 transform hover:scale-105">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Ajustes de Precios
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Customer Registration Component ---
const CustomerRegistrationForm: React.FC<{ 
    onRegister: (data: CustomerData) => void,
    onContinueWithoutClient: () => void,
    onGoBack: () => void;
}> = ({ onRegister, onContinueWithoutClient, onGoBack }) => {
  const [formData, setFormData] = useState<Omit<CustomerData, 'id'>>(initialCustomerData);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');

    setFormData(prev => {
        const updatedSection = {
            ...prev[section as keyof Omit<CustomerData, 'id'>],
            [field]: value
        };
        const updatedFormData = {
            ...prev,
            [section]: updatedSection
        };

        if (name === 'billingInfo.taxPostalCode') {
            updatedFormData.address.postalCode = value;
        }

        return updatedFormData;
    });
  };

  const stopScan = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  const handleScan = async () => {
    // @ts-ignore
    if (!('BarcodeDetector' in window) || !window.BarcodeDetector) {
      setFormError('Tu navegador no soporta la detección de códigos de barras.');
      return;
    }
    
    setIsScanning(true);
    setFormError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.error("Error playing video:", e));
      }

      // @ts-ignore
      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
      
      const detectCode = async () => {
        if (!streamRef.current || !videoRef.current || videoRef.current.readyState < 2) {
            if(streamRef.current) requestAnimationFrame(detectCode);
            return;
        }
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0) {
              const qrData = barcodes[0].rawValue;
              try {
                  const url = new URL(qrData);
                  if (url.hostname.includes('sat.gob.mx')) {
                      setQrUrl(qrData);
                      handleUrlProcess(qrData);
                  } else {
                      setFormError('El código QR no parece ser una URL válida del SAT.');
                  }
              } catch (e) {
                  setFormError('No se pudo interpretar el código QR. No es una URL válida.');
              }
              stopScan();
          } else {
              requestAnimationFrame(detectCode);
          }
        } catch (e) {
          console.error("Scan error:", e);
          setFormError('Error durante el escaneo.');
          stopScan();
        }
      };
      requestAnimationFrame(detectCode);
    } catch (err) {
      console.error("Camera error:", err);
      setFormError('No se pudo acceder a la cámara. Asegúrate de dar los permisos necesarios.');
      setIsScanning(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<{mimeType: string, data: string}> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
              const base64String = reader.result as string;
              const [header, data] = base64String.split(',');
              const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
              resolve({ mimeType, data });
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
      });
  };

  const processWithAI = async (parts: any[], errorMessage: string) => {
    setIsProcessing(true);
    setFormError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              customerName: { type: Type.OBJECT, properties: { fullName: { type: Type.STRING }, name: { type: Type.STRING }, paternalLastName: { type: Type.STRING }, maternalLastName: { type: Type.STRING } } },
              billingInfo: { type: Type.OBJECT, properties: { rfc: { type: Type.STRING }, taxRegime: { type: Type.STRING }, taxPostalCode: { type: Type.STRING } } },
              address: { type: Type.OBJECT, properties: { street: { type: Type.STRING }, exteriorNumber: { type: Type.STRING }, interiorNumber: { type: Type.STRING }, neighborhood: { type: Type.STRING }, municipality: { type: Type.STRING }, state: { type: Type.STRING }, postalCode: { type: Type.STRING }, country: { type: Type.STRING } } },
              contact: { type: Type.OBJECT, properties: { email: { type: Type.STRING }, phone: { type: Type.STRING } } }
            },
          },
          systemInstruction: "You are an expert AI for extracting structured data from Mexican 'Cédula de Identificación Fiscal' (CIF) documents or URLs. Provide only the JSON output.",
        },
      });
      const result = JSON.parse(response.text);
      const mergedData = {
          ...initialCustomerData, ...result,
          customerName: { ...initialCustomerData.customerName, ...result.customerName },
          billingInfo: { ...initialCustomerData.billingInfo, ...result.billingInfo },
          address: { ...initialCustomerData.address, ...result.address, country: 'México' },
          contact: { ...initialCustomerData.contact, ...result.contact },
      };
      setFormData(mergedData);
    } catch (err) {
      console.error(err);
      setFormError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { mimeType, data: base64Data } = await blobToBase64(file);
    const parts = [
      { inlineData: { mimeType, data: base64Data } },
      { text: "Analyze the attached Mexican fiscal document. Extract the customer's data: full name (or company name), RFC, tax regime, and the full fiscal address. If it's an individual, break down the name. Return null for fields not found. Format the output according to the provided JSON schema." }
    ];
    await processWithAI(parts, 'Error al procesar el documento. Intenta de nuevo.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlProcess = async (urlToProcess = qrUrl) => {
    if (!urlToProcess || !urlToProcess.includes('sat.gob.mx')) {
        setFormError('Por favor, introduce una URL válida del SAT.');
        return;
    }
    const parts = [
        { text: `Analyze this Mexican SAT QR code URL: "${urlToProcess}". Extract the customer's data: full name (or company name), RFC, tax regime, and the full fiscal address. The address should be a plausible fiscal address in Mexico based on the data. If it's an individual, break down the name into components. Return null for fields not found. Format the output according to the provided JSON schema.` }
    ];
    await processWithAI(parts, 'Error al procesar la URL. Intenta de nuevo.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.fullName && !formData.billingInfo.rfc) {
      setFormError('Se requiere Razón Social o RFC.');
      return;
    }
    const newCustomer: CustomerData = {
        ...formData,
        id: `CUST-${Date.now()}`
    }
    onRegister(newCustomer);
  };
  
  useEffect(() => {
    return () => stopScan();
  }, [stopScan]);

  const isLoading = isScanning || isProcessing;

  return (
    <div className="p-8 rounded-3xl bg-white shadow-xl space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="section-title mb-0">Registro de Cliente</h2>
        <button onClick={onGoBack} className="btn-secondary ml-4">Regresar</button>
      </div>
      
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#00A0B0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-lg font-semibold text-gray-700">{isScanning ? 'Buscando QR...' : 'Procesando...'}</p>
        </div>
      )}

      {isScanning && (
        <div className="p-4 border-2 border-dashed rounded-lg text-center">
          <video ref={videoRef} playsInline className="w-full max-w-sm mx-auto rounded-lg" aria-label="Vista de la cámara para escanear QR"></video>
          <p className="mt-2 text-gray-600">Apunta la cámara al código QR...</p>
          <button type="button" onClick={stopScan} className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-full font-semibold">Cancelar Escaneo</button>
        </div>
      )}

      <div className="space-y-4 p-4 border rounded-lg bg-gray-50" hidden={isLoading}>
        <p className="text-lg font-semibold text-gray-800 text-center">Llenado Automático por IA</p>
        <div className="flex flex-col sm:flex-row gap-2">
            <input type="url" value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} placeholder="Pegar URL del QR del SAT aquí..." className="w-full p-3 border border-gray-300 rounded-lg flex-grow" aria-label="URL del QR del SAT" />
            <button type="button" onClick={() => handleUrlProcess()} disabled={isLoading} className="btn-primary flex-shrink-0 !rounded-lg">Procesar URL</button>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="btn-primary w-full sm:w-auto !bg-blue-600 hover:!bg-blue-800 disabled:opacity-50 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                Subir Documento
            </button>
            <button type="button" onClick={handleScan} disabled={isLoading} className="btn-primary w-full sm:w-auto !bg-gray-700 hover:!bg-gray-900 disabled:opacity-50 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V4h2v2H5zM3 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V9zm2 2V9h2v2H5zm5-7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V4zm2 2V4h2v2h-2zM8 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V9zm2 2V9h2v2h-2zm5-7a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zm2 2V4h2v2h-2zM13 9a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V9zm2 2V9h2v2h-2z" /><path d="M7 13a1 1 0 011-1h8a1 1 0 011 1v2a1 1 0 01-1 1H8a1 1 0 01-1-1v-2z" /></svg>
                Escanear QR
            </button>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4 p-4 border rounded-lg" disabled={isLoading}>
          <legend className="text-lg font-semibold px-2">Datos Generales y de Facturación</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" name="customerName.fullName" value={formData.customerName.fullName} onChange={handleInputChange} placeholder="Razón Social (Requerido si no hay RFC)" className="w-full p-3 border border-gray-300 rounded-lg md:col-span-2" aria-label="Razón Social o Nombre Completo" />
            <input type="text" name="billingInfo.rfc" value={formData.billingInfo.rfc} onChange={handleInputChange} placeholder="RFC (Requerido si no hay Razón Social)" className="w-full p-3 border border-gray-300 rounded-lg" aria-label="RFC" />
            <input type="text" name="billingInfo.taxRegime" value={formData.billingInfo.taxRegime} onChange={handleInputChange} placeholder="Régimen Fiscal" className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Régimen Fiscal" />
            <input type="email" name="contact.email" value={formData.contact.email || ''} onChange={handleInputChange} placeholder="Email de Contacto" className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Email de Contacto" />
            <input type="tel" name="contact.phone" value={formData.contact.phone || ''} onChange={handleInputChange} placeholder="Teléfono de Contacto" className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Teléfono de Contacto" />
          </div>
        </fieldset>
        <fieldset className="space-y-4 p-4 border rounded-lg" disabled={isLoading}>
          <legend className="text-lg font-semibold px-2">Domicilio Fiscal</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <input type="text" name="address.street" value={formData.address.street} onChange={handleInputChange} placeholder="Calle" className="sm:col-span-2 md:col-span-3 w-full p-3 border border-gray-300 rounded-lg" aria-label="Calle" />
            <input type="text" name="address.exteriorNumber" value={formData.address.exteriorNumber} onChange={handleInputChange} placeholder="Num. Ext." className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Número Exterior" />
            <input type="text" name="address.interiorNumber" value={formData.address.interiorNumber || ''} onChange={handleInputChange} placeholder="Num. Int." className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Número Interior" />
            <input type="text" name="billingInfo.taxPostalCode" value={formData.billingInfo.taxPostalCode} onChange={handleInputChange} placeholder="Código Postal" className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Código Postal" />
            <input type="text" name="address.neighborhood" value={formData.address.neighborhood} onChange={handleInputChange} placeholder="Colonia" className="sm:col-span-2 w-full p-3 border border-gray-300 rounded-lg" aria-label="Colonia" />
            <input type="text" name="address.municipality" value={formData.address.municipality} onChange={handleInputChange} placeholder="Municipio / Alcaldía" className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Municipio o Alcaldía" />
            <input type="text" name="address.state" value={formData.address.state} onChange={handleInputChange} placeholder="Estado" className="w-full p-3 border border-gray-300 rounded-lg" aria-label="Estado" />
            <input type="text" name="address.country" value={formData.address.country} onChange={handleInputChange} placeholder="País" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" aria-label="País" readOnly />
          </div>
        </fieldset>
        {formError && <p className="text-red-600 text-center" role="alert">{formError}</p>}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" style={{ display: 'none' }} />
        <div className="text-center pt-2 flex flex-col sm:flex-row justify-center items-center gap-4 flex-wrap">
          <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto disabled:opacity-50">Registrar Cliente</button>
          <button type="button" onClick={onContinueWithoutClient} disabled={isLoading} className="btn-secondary w-full sm:w-auto disabled:opacity-50">Continuar sin Registrar</button>
        </div>
      </form>
    </div>
  );
};


// --- Search Component ---
const SearchComponent: React.FC<{
    customers: CustomerData[];
    quotations: Quotation[];
    onSelectCustomer: (customer: CustomerData) => void;
    onViewQuotation: (quotation: Quotation) => void;
    onGoBack: () => void;
}> = ({ customers, quotations, onSelectCustomer, onViewQuotation, onGoBack }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        return customers.filter(c =>
            c.customerName.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.billingInfo.rfc.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, customers]);

    const filteredQuotations = useMemo(() => {
        if (!searchTerm) return quotations;
        const customerMatchIds = customers
            .filter(c => c.customerName.fullName.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(c => c.id);
        
        return quotations.filter(q =>
            q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customerMatchIds.includes(q.customerId)
        );
    }, [searchTerm, quotations, customers]);

    const getCustomerName = (customerId: string) => {
        return customers.find(c => c.id === customerId)?.customerName.fullName || 'N/A';
    }

    return (
        <div className="p-8 rounded-3xl bg-white shadow-xl space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="section-title">Búsqueda</h2>
                <button onClick={onGoBack} className="btn-secondary ml-4">Regresar</button>
            </div>
            <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre de cliente, RFC o ID de cotización..."
                className="w-full p-3 border border-gray-300 rounded-lg"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Clientes Registrados</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => (
                            <div key={customer.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{customer.customerName.fullName}</p>
                                    <p className="text-sm text-gray-600">{customer.billingInfo.rfc}</p>
                                </div>
                                <button onClick={() => onSelectCustomer(customer)} className="btn-primary !py-1 !px-3">Ver Perfil</button>
                            </div>
                        )) : <p>No se encontraron clientes.</p>}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Cotizaciones Guardadas</h3>
                     <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {filteredQuotations.length > 0 ? filteredQuotations.map(quote => (
                            <div key={quote.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{quote.id}</p>
                                    <p className="text-sm text-gray-600">Cliente: {getCustomerName(quote.customerId)}</p>
                                    <p className="text-sm text-gray-600">Total: ${quote.total.toFixed(2)}</p>
                                </div>
                                <button onClick={() => onViewQuotation(quote)} className="btn-primary !bg-green-600 hover:!bg-green-800 !py-1 !px-3">Ver y Usar</button>
                            </div>
                        )) : <p>No se encontraron cotizaciones.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Customer Profile Component ---
const CustomerProfile: React.FC<{
  customer: CustomerData,
  quotations: Quotation[],
  onCreateNew: (view: 'quotation' | 'serviceOrder') => void,
  onViewQuotation: (quotation: Quotation) => void,
  onDeleteCustomer: (customerId: string) => void,
  onDeleteQuotation: (quotationId: string) => void,
  onGoBack: () => void
}> = ({ customer, quotations, onCreateNew, onViewQuotation, onDeleteCustomer, onDeleteQuotation, onGoBack }) => {

  const customerQuotations = useMemo(() => {
    return quotations.filter(q => q.customerId === customer.id);
  }, [quotations, customer.id]);

  const handleDeleteCustomer = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${customer.customerName.fullName}? Esta acción no se puede deshacer y eliminará todas sus cotizaciones.`)) {
      onDeleteCustomer(customer.id);
    }
  };

  const handleDeleteQuotation = (id: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la cotización ${id}?`)) {
        onDeleteQuotation(id);
    }
  };

  return (
    <div className="p-8 rounded-3xl bg-white shadow-xl space-y-8">
      <div className="flex justify-between items-start">
          <div>
            <h2 className="section-title">Perfil de Cliente</h2>
            <div className="mt-2 text-gray-700">
                <p className="text-2xl font-bold">{customer.customerName.fullName}</p>
                <p><strong>RFC:</strong> {customer.billingInfo.rfc}</p>
                <p><strong>Tel:</strong> {customer.contact.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {customer.contact.email || 'N/A'}</p>
            </div>
          </div>
          <button onClick={onGoBack} className="btn-secondary ml-4">Regresar</button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 border-t">
        <button onClick={() => onCreateNew('quotation')} className="btn-primary !text-xl !py-4 !px-8 w-full sm:w-auto">
          Crear Cotización
        </button>
        <button onClick={() => onCreateNew('serviceOrder')} className="btn-primary !bg-green-600 hover:!bg-green-800 !text-xl !py-4 !px-8 w-full sm:w-auto">
          Crear Orden de Servicio
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cotizaciones Guardadas</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 border rounded-lg p-2">
            {customerQuotations.length > 0 ? customerQuotations.map(quote => (
                <div key={quote.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center gap-2 flex-wrap">
                    <div>
                        <p className="font-semibold">{quote.id}</p>
                        <p className="text-sm text-gray-600">Fecha: {new Date(quote.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">Total: ${quote.total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => onViewQuotation(quote)} className="btn-primary !bg-green-600 hover:!bg-green-800 !py-1 !px-3">Ver / Usar</button>
                        <button onClick={() => handleDeleteQuotation(quote.id)} className="btn-secondary !bg-red-600 hover:!bg-red-800 !py-1 !px-3">Eliminar</button>
                    </div>
                </div>
            )) : <p>Este cliente no tiene cotizaciones guardadas.</p>}
        </div>
      </div>
      
      {customer.id !== 'CUST-GENERAL' && (
        <div className="pt-6 border-t text-center">
            <button onClick={handleDeleteCustomer} className="btn-secondary !bg-red-600 hover:!bg-red-800">Eliminar Perfil de Cliente</button>
        </div>
      )}
    </div>
  );
};


// --- Quotation Tool Component ---
const QuotationTool: React.FC<{ 
  customer: CustomerData,
  priceList: PriceList,
  initialQuotation?: Quotation,
  onSave: (quotation: Quotation) => void,
  onGenerateOrder: (selection: VehicleSelection, vehicleInfo?: Omit<Vehicle, 'id'>) => void,
  onGoBack: () => void
}> = ({ customer, priceList, initialQuotation, onSave, onGenerateOrder, onGoBack }) => {
  const [selection, setSelection] = useState<VehicleSelection>(initialQuotation?.vehicleSelection || initialVehicleSelection);
  const [trailerCount, setTrailerCount] = useState(initialQuotation?.vehicleSelection.trailers.length || 0);
  const [activeTab, setActiveTab] = useState<'tractocamion' | 'lightVehicles' | 'trucks'>('tractocamion');
  const [isSaving, setIsSaving] = useState(false);
  const [quotationDate, setQuotationDate] = useState(() => initialQuotation ? new Date(initialQuotation.date).toISOString().substring(0, 10) : new Date().toISOString().substring(0, 10));
  const [vehicleInfo, setVehicleInfo] = useState(initialQuotation?.vehicleInfo || { type: 'Tractor' as VehicleType, make: '', model: '', plates: '', color: '', kms: '' });

  const total = useMemo(() => {
    let currentTotal = 0;
    const { tractor, trailers, isVehiclePackage, additionalServices, lightVehicleSelection, camionUnitarioSelection } = selection;

    // Tractocamion calculation
    if (activeTab === 'tractocamion') {
        const isTractorComplete = tractor.exterior && tractor.interior;
        let tractorCost = 0;
        if (isTractorComplete) {
            tractorCost = priceList.tractocamion.packages.tractorComplete;
        } else {
            if (tractor.exterior) tractorCost += priceList.tractocamion.tractor.exterior;
            if (tractor.interior) tractorCost += priceList.tractocamion.tractor.interior;
        }
        currentTotal += tractorCost;
        let trailerCost = 0;
        trailers.forEach(t => { if (t.type) trailerCost += priceList.tractocamion.trailer[t.type] || 0 });
        currentTotal += trailerCost;
        if (isVehiclePackage && isTractorComplete && trailers.length > 0 && trailers[0].type) {
            currentTotal -= priceList.tractocamion.packages.vehicleCompleteDiscount;
        }
        if (additionalServices.pulidoDetallado) currentTotal += priceList.tractocamion.additional.pulidoDetallado;
        if (additionalServices.detalleInteriorCabina) currentTotal += priceList.tractocamion.additional.detalleInteriorCabina;
    }

    // Light vehicle calculation
    else if(activeTab === 'lightVehicles' && lightVehicleSelection && lightVehicleSelection.vehicleType && lightVehicleSelection.vehicleSize) {
        if(lightVehicleSelection.package !== 'ninguno') {
            currentTotal += priceList.lightVehicle.packages[lightVehicleSelection.vehicleType][lightVehicleSelection.vehicleSize][lightVehicleSelection.package] || 0;
        }
        if (lightVehicleSelection.aLaCarta.lavadoMotor) currentTotal += priceList.lightVehicle.aLaCarta.lavadoMotor;
        if (lightVehicleSelection.aLaCarta.limpiezaTelas) currentTotal += priceList.lightVehicle.aLaCarta.limpiezaTelas;
        if (lightVehicleSelection.aLaCarta.limpiezaPiel) currentTotal += priceList.lightVehicle.aLaCarta.limpiezaPiel;
        if (lightVehicleSelection.aLaCarta.restauracionFaros) currentTotal += priceList.lightVehicle.aLaCarta.restauracionFaros;
    }

    // Unitary truck calculation
    else if (activeTab === 'trucks' && camionUnitarioSelection && camionUnitarioSelection.type) {
        const prices = priceList.camionUnitario[camionUnitarioSelection.type];
        if (camionUnitarioSelection.services.exterior) currentTotal += prices.exterior;
        if (camionUnitarioSelection.services.chasis) currentTotal += prices.chasis;
        if (camionUnitarioSelection.services.motor) currentTotal += prices.motor;
    }

    return currentTotal;
  }, [selection, priceList, activeTab]);
  
  const handleTrailerCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const count = Math.max(0, parseInt(e.target.value, 10) || 0);
    setTrailerCount(count);
    setSelection(current => ({
      ...current, trailers: Array.from({ length: count }, (_, i) => current.trailers[i] || { id: Date.now() + i, type: '' })
    }));
  };

  const handleTrailerTypeChange = (id: number, type: TrailerType) => setSelection(current => ({
    ...current, trailers: current.trailers.map(t => (t.id === id ? { ...t, type } : t))
  }));
  
  const handleTractorServiceChange = (service: 'exterior' | 'interior', isChecked: boolean) => setSelection(s => {
    const newTractor = { ...s.tractor, [service]: isChecked };
    return { ...s, tractor: newTractor, isVehiclePackage: s.isVehiclePackage && newTractor.exterior && newTractor.interior };
  });

  const handleVehiclePackageChange = (e: React.ChangeEvent<HTMLInputElement>) => setSelection(s => ({
    ...s, isVehiclePackage: e.target.checked, tractor: e.target.checked ? { exterior: true, interior: true } : s.tractor
  }));

  const handleAdditionalServiceChange = (service: keyof VehicleSelection['additionalServices'], isChecked: boolean) => setSelection(s => ({
    ...s, additionalServices: { ...s.additionalServices, [service]: isChecked }
  }));

  const handleLightVehicleChange = (field: keyof LightVehicleSelection, value: any) => setSelection(s => ({
    ...s, lightVehicleSelection: { ...s.lightVehicleSelection, [field]: value }
  }));
  
  const handleLightVehicleAlaCartaChange = (field: keyof LightVehicleSelection['aLaCarta'], value: boolean) => setSelection(s => ({
    ...s, lightVehicleSelection: { ...s.lightVehicleSelection, aLaCarta: { ...s.lightVehicleSelection.aLaCarta, [field]: value } }
  }));
  
  const handleCamionUnitarioTypeChange = (type: CamionUnitarioType) => setSelection(s => ({
    ...s, camionUnitarioSelection: { ...s.camionUnitarioSelection, type }
  }));

  const handleCamionUnitarioServiceChange = (service: keyof CamionUnitarioSelection['services'], value: boolean) => setSelection(s => ({
    ...s, camionUnitarioSelection: { ...s.camionUnitarioSelection, services: { ...s.camionUnitarioSelection.services, [service]: value } }
  }));

    const handleVehicleInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setVehicleInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

  const handleSaveQuotation = () => {
    setIsSaving(true);
    let prefix: QuotationPrefix = 'COT-TRACTO';
    if (activeTab === 'lightVehicles') prefix = 'COT-AUTO';
    else if (activeTab === 'trucks') prefix = 'COT-CAMION';

    const newQuotation: Quotation = {
      id: `${prefix}-${Date.now()}`, 
      customerId: customer.id, 
      vehicleSelection: selection, 
      date: new Date(quotationDate), 
      total, 
      type: prefix,
      vehicleInfo: vehicleInfo.make || vehicleInfo.plates ? vehicleInfo : undefined,
    };
    onSave(newQuotation);
    alert(`Cotización ${newQuotation.id} guardada con un total de $${total.toFixed(2)}.`);
    setTimeout(() => setIsSaving(false), 1000);
  };
  
  const { requestedServices } = useMemo(() => {
      const services: { description: string; price: number }[] = [];
      const { tractor, trailers, isVehiclePackage, additionalServices, lightVehicleSelection, camionUnitarioSelection } = selection;

      if(activeTab === 'tractocamion'){
        const isTractorComplete = tractor.exterior && tractor.interior;
        if (isTractorComplete) services.push({ description: 'Paquete 1: Lavado Completo de Tractor', price: priceList.tractocamion.packages.tractorComplete });
        else {
            if (tractor.exterior) services.push({ description: 'Servicio 1: Lavado de Tractor Exterior', price: priceList.tractocamion.tractor.exterior });
            if (tractor.interior) services.push({ description: 'Servicio 2: Aspirado y limpieza interior de Cabina', price: priceList.tractocamion.tractor.interior });
        }
        trailers.forEach((t) => { if (t.type) services.push({ description: `Lavado Remolque - ${t.type}`, price: priceList.tractocamion.trailer[t.type] }) });
        if (isVehiclePackage && isTractorComplete && trailers.length > 0 && trailers[0].type) services.push({ description: 'Descuento Paquete 2', price: -priceList.tractocamion.packages.vehicleCompleteDiscount });
        if (additionalServices.pulidoDetallado) services.push({ description: 'Adicional: Pulido Detallado', price: priceList.tractocamion.additional.pulidoDetallado });
        if (additionalServices.detalleInteriorCabina) services.push({ description: 'Adicional: Detallado Interior de cabina', price: priceList.tractocamion.additional.detalleInteriorCabina });
      } else if (activeTab === 'lightVehicles' && lightVehicleSelection && lightVehicleSelection.vehicleType && lightVehicleSelection.vehicleSize) {
          if(lightVehicleSelection.package !== 'ninguno') {
              services.push({ description: `Paquete ${lightVehicleSelection.package} - ${lightVehicleSelection.vehicleType} ${lightVehicleSelection.vehicleSize}`, price: priceList.lightVehicle.packages[lightVehicleSelection.vehicleType][lightVehicleSelection.vehicleSize][lightVehicleSelection.package] });
          }
// FIX: Replaced Object.entries with a type-safe Object.keys iteration to prevent a TypeScript error where the key was being inferred as a generic 'string' instead of a specific literal type.
(Object.keys(lightVehicleSelection.aLaCarta) as (keyof typeof lightVehicleSelection.aLaCarta)[]).forEach(key => {
    if (lightVehicleSelection.aLaCarta[key]) {
        services.push({ description: `A la Carta: ${String(key).replace(/([A-Z])/g, ' $1')}`, price: priceList.lightVehicle.aLaCarta[key] });
    }
});
      } else if (activeTab === 'trucks' && camionUnitarioSelection && camionUnitarioSelection.type) {
        const prices = priceList.camionUnitario[camionUnitarioSelection.type];
        const typeName = camionUnitarioSelection.type.replace(/([A-Z0-9])/g, ' $1').replace('rabon', 'Rabon').replace('torton', 'Torton');
        if (camionUnitarioSelection.services.exterior) services.push({ description: `Lavado Exterior - ${typeName}`, price: prices.exterior });
        if (camionUnitarioSelection.services.chasis) services.push({ description: `Lavado de Chasis - ${typeName}`, price: prices.chasis });
        if (camionUnitarioSelection.services.motor) services.push({ description: `Lavado de Motor - ${typeName}`, price: prices.motor });
      }
      return { requestedServices: services };
  }, [selection, priceList, activeTab]);

  return (
    <div className="p-8 rounded-3xl bg-white shadow-xl space-y-8">
        <div id="printable-quotation" className="printable-section">
            <header className="hidden print-only mb-4 p-4 border-b-2 border-black">
                <h2 className="text-3xl font-black text-gray-800">COTIZACIÓN</h2>
                <div className="flex justify-between">
                    <div>
                        <p><strong>Cliente:</strong> {customer.customerName.fullName}</p>
                        <p><strong>RFC:</strong> {customer.billingInfo.rfc}</p>
                    </div>
                    <div>
                        <p><strong>Fecha:</strong> {new Date(quotationDate).toLocaleDateString('es-MX')}</p>
                        <p><strong>ID Cotización (Temporal):</strong> QT-{Date.now()}</p>
                    </div>
                </div>
            </header>
            <main>
                <div className="flex justify-between items-center no-print">
                    <h2 className="section-title">Cotizador de Servicios</h2>
                    <button onClick={onGoBack} className="btn-secondary ml-4">Regresar</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 no-print">
                    <div>
                        <label htmlFor="quotationDate" className="block text-sm font-medium text-gray-700">Fecha de Cotización</label>
                        <input type="date" id="quotationDate" value={quotationDate} onChange={e => setQuotationDate(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                
                <details className="p-4 border rounded-lg bg-gray-50 my-4 no-print">
                    <summary className="text-lg font-bold text-gray-800 cursor-pointer">Datos del Vehículo (Opcional)</summary>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tipo de Vehículo</label>
                            <select name="type" value={vehicleInfo.type} onChange={handleVehicleInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md">
                                <option value="Tractor">Tractor</option>
                                <option value="Remolque">Remolque</option>
                                <option value="Camion">Camión</option>
                                <option value="Auto">Auto</option>
                                <option value="Pickup">Pickup</option>
                                <option value="Camioneta">Camioneta</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Marca</label>
                            <input type="text" name="make" value={vehicleInfo.make} onChange={handleVehicleInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Modelo</label>
                            <input type="text" name="model" value={vehicleInfo.model} onChange={handleVehicleInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Placas</label>
                            <input type="text" name="plates" value={vehicleInfo.plates} onChange={handleVehicleInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Color</label>
                            <input type="text" name="color" value={vehicleInfo.color} onChange={handleVehicleInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">KMS</label>
                            <input type="text" name="kms" value={vehicleInfo.kms} onChange={handleVehicleInfoChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                </details>

                <div className="border-b border-gray-200 no-print">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('tractocamion')} className={`${activeTab === 'tractocamion' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Tractor y Remolques</button>
                        <button onClick={() => setActiveTab('trucks')} className={`${activeTab === 'trucks' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Camiones (Unitarios)</button>
                        <button onClick={() => setActiveTab('lightVehicles')} className={`${activeTab === 'lightVehicles' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Autos, Pickups, Camionetas</button>
                    </nav>
                </div>

                <div className="space-y-6 pt-4">
                    {activeTab === 'tractocamion' && (
                        <>
                            <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                            <legend className="text-lg font-bold text-gray-800 px-2">Unidad Tractora</legend>
                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <label className="flex items-center space-x-3 cursor-pointer text-base">
                                <input type="checkbox" checked={selection.tractor.exterior} onChange={e => handleTractorServiceChange('exterior', e.target.checked)} className="h-5 w-5 rounded"/>
                                <span>Servicio 1: Lavado Exterior (${priceList.tractocamion.tractor.exterior})</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer text-base">
                                <input type="checkbox" checked={selection.tractor.interior} onChange={e => handleTractorServiceChange('interior', e.target.checked)} className="h-5 w-5 rounded"/>
                                <span>Servicio 2: Limpieza Interior de Cabina (${priceList.tractocamion.tractor.interior})</span>
                                </label>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">Seleccionar ambos servicios equivale al "Paquete 1: Lavado Completo de Tractor" por ${priceList.tractocamion.packages.tractorComplete}.</p>
                            </fieldset>

                            <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                            <legend className="text-lg font-bold text-gray-800 px-2">Remolques</legend>
                            <div className="pt-2">
                                <label htmlFor="trailerCount" className="block text-base font-semibold mb-2 text-gray-800">Cantidad de Remolques</label>
                                <input type="number" id="trailerCount" min="0" value={trailerCount} onChange={handleTrailerCountChange} className="w-24 p-2 border border-gray-300 rounded-lg text-center" />
                            </div>
                            {trailerCount > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                                    {selection.trailers.map((trailer, index) => (
                                        <div key={trailer.id} className="p-4 border rounded-lg bg-white space-y-2">
                                            <label className="block text-base font-bold text-gray-800">Remolque #{index + 1}</label>
                                            <select value={trailer.type} onChange={(e) => handleTrailerTypeChange(trailer.id, e.target.value as TrailerType)} className="w-full p-2 border border-gray-300 rounded-lg">
                                                <option value="">Selecciona Tipo</option>
                                                <option value="Caja Estándar">Caja Estándar (${priceList.tractocamion.trailer['Caja Estándar']})</option>
                                                <option value="Pipa / Cilindro Estándar">Pipa / Cilindro Estándar (${priceList.tractocamion.trailer['Pipa / Cilindro Estándar']})</option>
                                                <option value="Pipa / Cilindro Chica">Pipa / Cilindro Chica (${priceList.tractocamion.trailer['Pipa / Cilindro Chica']})</option>
                                                <option value="Caja Ganadera / Vehículos">Caja Ganadera / Vehículos (${priceList.tractocamion.trailer['Caja Ganadera / Vehículos']})</option>
                                                <option value="Caja Chica">Caja Chica (${priceList.tractocamion.trailer['Caja Chica']})</option>
                                                <option value="Caja Grande">Caja Grande (${priceList.tractocamion.trailer['Caja Grande']})</option>
                                                <option value="Plataforma">Plataforma (${priceList.tractocamion.trailer.Plataforma})</option>
                                            </select>
                                        </div>
                                    ))}
                                </div>
                            )}
                            </fieldset>

                            <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                            <legend className="text-lg font-bold text-gray-800 px-2">Paquetes y Servicios Adicionales</legend>
                            <div className="flex flex-col gap-3 pt-2">
                                <label className="flex items-center space-x-3 cursor-pointer text-base">
                                    <input type="checkbox" checked={selection.isVehiclePackage} onChange={handleVehiclePackageChange} className="h-5 w-5 rounded"/>
                                    <span>Paquete 2: Lavado de Vehículo Completo (Tractor Completo + 1 Remolque con ${priceList.tractocamion.packages.vehicleCompleteDiscount} de descuento)</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer text-base">
                                    <input type="checkbox" checked={selection.additionalServices.pulidoDetallado} onChange={e => handleAdditionalServiceChange('pulidoDetallado', e.target.checked)} className="h-5 w-5 rounded"/>
                                    <span>Adicional: Pulido Detallado (${priceList.tractocamion.additional.pulidoDetallado})</span>
                                </label>
                                <label className="flex items-center space-x-3 cursor-pointer text-base">
                                    <input type="checkbox" checked={selection.additionalServices.detalleInteriorCabina} onChange={e => handleAdditionalServiceChange('detalleInteriorCabina', e.target.checked)} className="h-5 w-5 rounded"/>
                                    <span>Adicional: Limpeza, aspirado y Detallado Interior de cabina (${priceList.tractocamion.additional.detalleInteriorCabina})</span>
                                </label>
                            </div>
                            </fieldset>
                        </>
                    )}
                    {activeTab === 'lightVehicles' && (
                        <>
                          <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                            <legend className="text-lg font-bold text-gray-800 px-2">Vehículo</legend>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-base font-semibold mb-2 text-gray-800">Tipo de Vehículo</label>
                                    <select value={selection.lightVehicleSelection.vehicleType} onChange={e => handleLightVehicleChange('vehicleType', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option value="">Seleccione</option>
                                        <option value="auto">Auto</option>
                                        <option value="camioneta">Camioneta</option>
                                        <option value="pickup">Pickup</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-base font-semibold mb-2 text-gray-800">Tamaño</label>
                                    <select value={selection.lightVehicleSelection.vehicleSize} onChange={e => handleLightVehicleChange('vehicleSize', e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option value="">Seleccione</option>
                                        <option value="chico">Chico</option>
                                        <option value="grande">Grande</option>
                                    </select>
                                </div>
                             </div>
                          </fieldset>

                           <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                                <legend className="text-lg font-bold text-gray-800 px-2">Paquetes</legend>
                                <div className="pt-2 space-y-2">
                                    {['basico', 'plus', 'premium', 'ninguno'].map(pkg => (
                                        <label key={pkg} className="flex items-center space-x-3 cursor-pointer text-base">
                                            <input type="radio" name="lightVehiclePackage" value={pkg} checked={selection.lightVehicleSelection?.package === pkg} onChange={e => handleLightVehicleChange('package', e.target.value)} className="h-5 w-5" />
                                            <span>{pkg.charAt(0).toUpperCase() + pkg.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                           </fieldset>
                           <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                                <legend className="text-lg font-bold text-gray-800 px-2">A la Carta</legend>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                                    {/* FIX: Cast the result of Object.keys to the specific key types to ensure type safety. */}
                                    {(Object.keys(selection.lightVehicleSelection.aLaCarta) as (keyof typeof selection.lightVehicleSelection.aLaCarta)[]).map(key => (
                                        <label key={key} className="flex items-center space-x-3 cursor-pointer text-base">
                                            <input type="checkbox" checked={selection.lightVehicleSelection.aLaCarta[key]} onChange={e => handleLightVehicleAlaCartaChange(key, e.target.checked)} className="h-5 w-5 rounded"/>
                                            <span>{key.replace(/([A-Z])/g, ' $1')} (${priceList.lightVehicle.aLaCarta[key]})</span>
                                        </label>
                                    ))}
                                </div>
                           </fieldset>
                        </>
                    )}
                     {activeTab === 'trucks' && (
                        <>
                          <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                            <legend className="text-lg font-bold text-gray-800 px-2">Camión Unitario</legend>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-base font-semibold mb-2 text-gray-800">Tipo de Camión</label>
                                    <select value={selection.camionUnitarioSelection.type} onChange={e => handleCamionUnitarioTypeChange(e.target.value as CamionUnitarioType)} className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option value="">Seleccione</option>
                                        <option value="rabon35">Rabon (3.5 Ton)</option>
                                        <option value="rabon5">Rabon (5 Ton)</option>
                                        <option value="rabon8">Rabon (8 Ton)</option>
                                        <option value="torton">Torton</option>
                                        <option value="tortonEnjarascado">Torton de Enjarascado</option>
                                    </select>
                                </div>
                             </div>
                          </fieldset>
                           <fieldset className="p-4 border rounded-lg bg-gray-50 no-print">
                                <legend className="text-lg font-bold text-gray-800 px-2">Servicios para Camión</legend>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                                    {/* FIX: Cast the result of Object.keys to the specific key types to ensure type safety and prevent TypeScript errors when accessing object properties or passing keys as function arguments. */}
                                    {(Object.keys(selection.camionUnitarioSelection.services) as (keyof typeof selection.camionUnitarioSelection.services)[]).map(key => (
                                        <label key={key} className="flex items-center space-x-3 cursor-pointer text-base">
                                            <input type="checkbox" checked={selection.camionUnitarioSelection.services[key]} onChange={e => handleCamionUnitarioServiceChange(key, e.target.checked)} className="h-5 w-5 rounded" disabled={!selection.camionUnitarioSelection.type}/>
                                            <span className="capitalize">{key}</span>
                                        </label>
                                    ))}
                                </div>
                           </fieldset>
                        </>
                    )}
                </div>

                <div className="pt-6 border-t">
                    <div className="p-4 border rounded-lg bg-gray-50">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Resumen de Servicios Cotizados</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2">Servicio</th>
                                    <th className="p-2 text-right">Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requestedServices.map((s, i) => (
                                    <tr key={i} className="border-b border-gray-200">
                                        <td className="p-2">{s.description}</td>
                                        <td className={`p-2 text-right ${s.price < 0 ? 'text-green-600' : ''}`}>${s.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="text-right text-3xl font-black text-gray-800 my-6">
                    Total: ${total.toFixed(2)} MXN
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 no-print">
                    <button onClick={handleSaveQuotation} disabled={isSaving} className="btn-primary !bg-gray-600 hover:!bg-gray-800 w-full sm:w-auto disabled:opacity-50">Guardar Cotización</button>
                    <button onClick={() => handlePrint('printable-quotation')} className="btn-primary !bg-blue-600 hover:!bg-blue-800 w-full sm:w-auto">Imprimir Cotización</button>
                    <button onClick={() => onGenerateOrder(selection, (vehicleInfo.make || vehicleInfo.plates) ? vehicleInfo : undefined)} className="btn-primary w-full sm:w-auto">Generar Orden de Servicio</button>
                    </div>
                </div>
            </main>
        </div>
    </div>
  );
};


// --- Checklist Component ---
const ChecklistComponent: React.FC<{ vehicleSelection: VehicleSelection }> = ({ vehicleSelection }) => {
    const [checklistState, setChecklistState] = useState<Record<string, { entrada: boolean; salida: boolean }>>({});

    const generatedChecklist = useMemo(() => {
        const checklist: { title: string; steps: ChecklistStep[]; className?: string }[] = [];
        if(!vehicleSelection.trailers || vehicleSelection.trailers.length === 0) return checklist;

        checklist.push(SAFETY_GENERAL);

        vehicleSelection.trailers.forEach((trailer, index) => {
            if (trailer.type) {
                const trailerChecklist = CHECKLIST_MAPPING[trailer.type];
                if (trailerChecklist) {
                     checklist.push({ title: `Checklist para Remolque ${index + 1}: ${trailer.type}`, steps: [], className: 'bg-blue-100 border-blue-300 p-4 rounded-lg mt-6' });
                     checklist.push(...trailerChecklist);
                }
            }
        });

        return checklist;
    }, [vehicleSelection]);
    
    useEffect(() => {
        const initialState: Record<string, { entrada: boolean; salida: boolean }> = {};
        generatedChecklist.forEach(section => {
            section.steps.forEach(step => {
                initialState[step.id] = { entrada: false, salida: false };
            });
        });
        setChecklistState(initialState);
    }, [generatedChecklist]);
    
    const handleCheckChange = (stepId: string, type: 'entrada' | 'salida') => {
        setChecklistState(prev => ({
            ...prev,
            [stepId]: { ...prev[stepId], [type]: !prev[stepId][type] }
        }));
    };

    if (!vehicleSelection.trailers || vehicleSelection.trailers.length === 0) {
        return <p className="text-center text-gray-500">No se requiere checklist (sin remolques seleccionados).</p>
    }

    return (
        <div id="printable-checklists" className="space-y-6 printable-section">
            <h2 className="section-title">Checklists de Entrada y Salida</h2>
            {generatedChecklist.map((section, sectionIndex) => (
                <div key={sectionIndex} className={section.className || 'p-4 border rounded-lg'}>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{section.title}</h3>
                    {section.steps.length > 0 && (
                      <table className="w-full text-left">
                          <thead>
                              <tr className="border-b-2">
                                  <th className="p-2 w-3/5">Punto de Verificación</th>
                                  <th className="p-2 text-center">Entrada</th>
                                  <th className="p-2 text-center">Salida</th>
                              </tr>
                          </thead>
                          <tbody>
                              {section.steps.map((step, stepIndex) => (
                                  <tr key={step.id} className="border-b border-gray-200">
                                      <td className="p-2">{step.label}</td>
                                      <td className="p-2 text-center">
                                          <input type="checkbox" 
                                            checked={checklistState[step.id]?.entrada || false}
                                            onChange={() => handleCheckChange(step.id, 'entrada')}
                                            className="h-5 w-5" />
                                      </td>
                                      <td className="p-2 text-center">
                                          <input type="checkbox" 
                                            checked={checklistState[step.id]?.salida || false}
                                            onChange={() => handleCheckChange(step.id, 'salida')}
                                            className="h-5 w-5" />
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                    )}
                </div>
            ))}
        </div>
    );
};


// --- Service Order Component ---
const ServiceOrder: React.FC<{
    customer: CustomerData, 
    vehicleSelection: VehicleSelection | null, 
    priceList: PriceList,
    vehicleInfo: Omit<Vehicle, 'id'> | null,
    onUpdateCustomer: (customer: CustomerData) => void,
    onGoBack: () => void
}> = ({ customer, vehicleSelection, priceList, onUpdateCustomer, onGoBack, vehicleInfo }) => {
    const [technicianData, setTechnicianData] = useState({ name: '', area: '', phone: '' });
    const [vehicleData, setVehicleData] = useState(() => vehicleInfo || { type: 'Tractor' as VehicleType, make: '', model: '', plates: '', color: '', kms: '' });
    const inventoryItems = useMemo(() => ['Encendedor', 'Extinguidor', 'Llanta de Refacción', 'Antena', 'Tapetes', 'Herramientas', 'Gato', 'Tapones de Rueda', 'Tapón de Combustible', 'Señales', 'Llave de Maneral', 'Espejos Laterales', 'Radio / Stereo', 'Pasa corriente', 'Birlo de Seguridad', 'Limpiadores'], []);
    const [inventory, setInventory] = useState<Record<string, boolean>>(() => inventoryItems.reduce((acc, item) => ({...acc, [item]: false}), {}));
    const [vehicleCondition, setVehicleCondition] = useState('');

    const handleInventoryChange = (item: string) => {
        setInventory(prev => ({...prev, [item]: !prev[item]}));
    };

    const handleTechDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTechnicianData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleVehicleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setVehicleData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveVehicle = () => {
        if (!vehicleData.make || !vehicleData.plates) {
            alert('Por favor, ingrese al menos la Marca y las Placas del vehículo.');
            return;
        }
        const newVehicle: Vehicle = {
            id: `VEH-${Date.now()}`,
            ...vehicleData,
        };
        const updatedCustomer: CustomerData = {
            ...customer,
            vehicles: [...(customer.vehicles || []), newVehicle],
        };
        onUpdateCustomer(updatedCustomer);
        alert('Vehículo guardado en el perfil del cliente.');
    };

    const { requestedServices, totalBudget } = useMemo(() => {
      const services: { description: string; price: number }[] = [];
      let total = 0;
      if (!vehicleSelection) return { requestedServices: services, totalBudget: total };
      
      const { tractor, trailers, isVehiclePackage, additionalServices } = vehicleSelection;

      const isTractorComplete = tractor.exterior && tractor.interior;
      let tractorCost = 0;

      if (isTractorComplete) {
          tractorCost = priceList.tractocamion.packages.tractorComplete;
          services.push({ description: 'Paquete 1: Lavado Completo de Tractor', price: tractorCost });
      } else {
          if (tractor.exterior) {
              const price = priceList.tractocamion.tractor.exterior;
              tractorCost += price;
              services.push({ description: 'Servicio 1: Lavado de Tractor Exterior', price });
          }
          if (tractor.interior) {
              const price = priceList.tractocamion.tractor.interior;
              tractorCost += price;
              services.push({ description: 'Servicio 2: Aspirado y limpieza interior de Cabina', price });
          }
      }
      total += tractorCost;

      let trailerCost = 0;
      trailers.forEach((t, i) => {
          if (t.type) {
              const price = priceList.tractocamion.trailer[t.type];
              trailerCost += price;
              services.push({ description: `Lavado Remolque - ${t.type}`, price });
          }
      });
      total += trailerCost;

      if (isVehiclePackage && isTractorComplete && trailers.length > 0 && trailers[0].type) {
          const discount = priceList.tractocamion.packages.vehicleCompleteDiscount;
          total -= discount;
          services.push({ description: 'Descuento Paquete 2', price: -discount });
      }

      if (additionalServices.pulidoDetallado) {
          const price = priceList.tractocamion.additional.pulidoDetallado;
          total += price;
          services.push({ description: 'Adicional: Pulido Detallado', price });
      }
      if (additionalServices.detalleInteriorCabina) {
          const price = priceList.tractocamion.additional.detalleInteriorCabina;
          total += price;
          services.push({ description: 'Adicional: Detallado Interior de cabina', price });
      }

      return { requestedServices: services, totalBudget: total };
    }, [vehicleSelection, priceList]);

    return (
        <div className="p-4 md:p-8 rounded-3xl bg-white shadow-xl space-y-6">
            <div id="printable-service-order" className="printable-section">
                {/* Header */}
                <header className="flex justify-between items-start pb-4 border-b-2 border-black">
                    <div className="text-left">
                        <h2 className="text-3xl font-black text-gray-800">TRUCK WASH STATION</h2>
                        <p className="italic text-gray-600">"Cuidamos lo que te Mueve"</p>
                    </div>
                    <div className="text-right flex flex-col gap-2">
                        <div className="flex items-center gap-2 border border-black p-1">
                            <strong className="p-1">Fecha</strong>
                            <input type="date" defaultValue={new Date().toISOString().substring(0, 10)} className="border-l border-black p-1 w-32" />
                        </div>
                        <button onClick={onGoBack} className="btn-secondary no-print !py-2 !px-4 self-end">Regresar</button>
                    </div>
                </header>

                {/* Main Data Sections */}
                <section className="grid grid-cols-3 gap-px bg-black border border-black mt-4">
                    <div className="p-2 bg-white"><h3 className="font-bold">Datos del Cliente</h3>
                        <p>Nombre: {customer.customerName.fullName || 'Cliente General'}</p>
                        <p>Tel: {customer.contact.phone || 'N/A'}</p>
                        <p>Mail: {customer.contact.email || 'N/A'}</p>
                    </div>
                    <div className="p-2 bg-white"><h3 className="font-bold">Datos del Técnico</h3>
                        <p>Nombre: <input type="text" name="name" value={technicianData.name} onChange={handleTechDataChange} className="border-b border-gray-400 w-full" /></p>
                        <p>Área: <input type="text" name="area" value={technicianData.area} onChange={handleTechDataChange} className="border-b border-gray-400 w-full" /></p>
                        <p>Tel: <input type="text" name="phone" value={technicianData.phone} onChange={handleTechDataChange} className="border-b border-gray-400 w-full" /></p>
                    </div>
                    <div className="p-2 bg-white space-y-1"><h3 className="font-bold">Datos del Vehículo</h3>
                        <select name="type" value={vehicleData.type} onChange={handleVehicleDataChange} className="w-full border-b border-gray-400">
                          <option value="Tractor">Tractor</option>
                          <option value="Remolque">Remolque</option>
                          <option value="Camion">Camión</option>
                          <option value="Auto">Auto</option>
                          <option value="Pickup">Pickup</option>
                          <option value="Camioneta">Camioneta</option>
                        </select>
                        <p>Marca: <input type="text" name="make" value={vehicleData.make} onChange={handleVehicleDataChange} className="border-b border-gray-400 w-full" /></p>
                        <p>Modelo: <input type="text" name="model" value={vehicleData.model} onChange={handleVehicleDataChange} className="border-b border-gray-400 w-full" /></p>
                        <p>Placas: <input type="text" name="plates" value={vehicleData.plates} onChange={handleVehicleDataChange} className="border-b border-gray-400 w-full" /></p>
                        <p>Color: <input type="text" name="color" value={vehicleData.color} onChange={handleVehicleDataChange} className="border-b border-gray-400 w-full" /></p>
                        <p>KMS: <input type="text" name="kms" value={vehicleData.kms} onChange={handleVehicleDataChange} className="border-b border-gray-400 w-full" /></p>
                        <button onClick={handleSaveVehicle} className="btn-primary !py-1 !px-2 text-xs mt-2 w-full no-print">Guardar Vehículo en Perfil</button>
                    </div>
                </section>
                
                {/* Vehicle Condition & Inventory */}
                <section className="grid grid-cols-2 gap-4 py-4 border-b-2 border-black">
                    <div className="border border-black p-2">
                        <h3 className="font-bold text-center">Recepción de Vehículo - Inventario</h3>
                        <div className="grid grid-cols-3 gap-x-4 gap-y-1 mt-2">
                        {inventoryItems.map(item => (
                            <label key={item} className="flex items-center text-xs cursor-pointer">
                            <input type="checkbox" checked={inventory[item]} onChange={() => handleInventoryChange(item)} className="mr-2 h-3 w-3"/>{item}
                            </label>
                        ))}
                        </div>
                    </div>
                    <div className="border border-black p-2 flex flex-col">
                        <h3 className="font-bold text-center mb-2">Estado del Vehículo (Marcar daños)</h3>
                        <textarea
                            value={vehicleCondition}
                            onChange={(e) => setVehicleCondition(e.target.value)}
                            rows={5}
                            placeholder="Describa aquí cualquier daño, rayón, o condición especial del vehículo..."
                            className="w-full h-full bg-gray-50 rounded p-2 text-sm flex-grow"
                        ></textarea>
                    </div>
                </section>

                {/* Services and Authorization */}
                <section className="grid grid-cols-2 gap-px bg-black border border-black mt-px">
                    <div className="p-2 bg-white"><h3 className="font-bold">Servicios Solicitados</h3>
                        <table className="w-full mt-2 border-collapse text-xs">
                            <tbody>
                            {requestedServices.map((service, i) => (
                                <tr key={i}>
                                    <td className="border border-black p-1">{service.description}</td>
                                    <td className="border border-black p-1 w-24 text-right">${service.price.toFixed(2)}</td>
                                </tr>
                            ))}
                            {[...Array(Math.max(0, 5 - requestedServices.length))].map((_, i) => (
                                <tr key={`empty-${i}`}><td className="border border-black p-1 h-6"></td><td className="border border-black p-1 w-24">$</td></tr>
                            ))}
                            </tbody>
                        </table>
                        <p className="text-right font-bold mt-2">Total del Presupuesto: ${totalBudget.toFixed(2)}</p>
                    </div>
                    <div className="p-2 bg-white flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold">Autorización</h3>
                            <p className="text-xs mt-1">Estoy de acuerdo con las condiciones de venta y Autorizo por la presente hacer el trabajo de reparación con el material necesario, y concedo a la empresa el permiso para operación la unidad para efectos de inspección y prueba.</p>
                            <p className="text-xs mt-1 font-bold">Nota. El combustible utilizado corre por cuenta del cliente</p>
                        </div>
                        <div className="text-center mt-4 border-t-2 border-black pt-2">Nombre y Firma</div>
                    </div>
                </section>

                <div className="text-xs pt-4">
                    <h3 className="font-bold">Condiciones de Venta:</h3>
                    <ol className="list-decimal list-inside">
                        <li>Después de 5 días de terminado el trabajo la empresa cobrara una pensión por resguardo de $100.00 por día</li>
                        <li>Es necesario liquidar al 100% del servicio para poder entregar la unidad.</li>
                        <li>En caso de requerir servicio adicional el cliente sera notificado antes de realizar dicho servicio.</li>
                        <li>La empresa NO se hace responsable por artículos de valor no reportados al momento de recibir el vehículo.</li>
                        <li>Cualquier diagnostico y cotización que no sea autorizado tendrá un costo mínimo de $300.00</li>
                    </ol>
                </div>
            </div>
            
            <div className="pt-6 border-t no-print">
              {vehicleSelection && <ChecklistComponent vehicleSelection={vehicleSelection} />}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 no-print">
              <button onClick={() => handlePrint('printable-service-order')} className="btn-primary w-full sm:w-auto">Imprimir Orden</button>
              <button onClick={() => handlePrint('printable-checklists')} className="btn-primary !bg-blue-600 hover:!bg-blue-800 w-full sm:w-auto">Imprimir Checklists</button>
            </div>
        </div>
    );
};

// --- Price Settings Component ---
const PriceSettings: React.FC<{
    currentPrices: PriceList;
    onSave: (newPrices: PriceList) => void;
    onReset: () => void;
    onGoBack: () => void;
}> = ({ currentPrices, onSave, onReset, onGoBack }) => {
    const [editablePrices, setEditablePrices] = useState<PriceList>(currentPrices);
    const [activeTab, setActiveTab] = useState<'tractocamion' | 'camionUnitario' | 'lightVehicle'>('tractocamion');

    const handlePriceChange = (path: string[], value: string) => {
        const numericValue = parseFloat(value) || 0;
        setEditablePrices(prev => {
            const newPrices = JSON.parse(JSON.stringify(prev));
            let currentLevel: any = newPrices;
            for(let i = 0; i < path.length - 1; i++) {
                currentLevel = currentLevel[path[i]];
            }
            currentLevel[path[path.length - 1]] = numericValue;
            return newPrices;
        });
    };
    
    const handleSave = () => {
        onSave(editablePrices);
        alert('¡Precios guardados exitosamente!');
    };

    const renderPriceInputs = (data: object, path: string[] = []) => {
        return Object.entries(data).map(([key, value]) => {
            const currentPath = [...path, key];
            const formattedKey = key.replace(/([A-Z0-9])/g, ' $1').replace('rabon', 'Rabon').replace('torton', 'Torton');
            
            if (typeof value === 'object' && value !== null) {
                return (
                    <fieldset key={currentPath.join('-')} className="p-4 border rounded-lg bg-gray-100 md:col-span-2">
                        <legend className="text-lg font-semibold text-gray-800 px-2 capitalize">{formattedKey}</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                           {renderPriceInputs(value, currentPath)}
                        </div>
                    </fieldset>
                );
            }
            return (
                <div key={currentPath.join('-')}>
                    <label htmlFor={`price-${currentPath.join('-')}`} className="block text-sm font-medium text-gray-700 capitalize">
                        {formattedKey}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                        <input
                            type="number"
                            id={`price-${currentPath.join('-')}`}
                            value={value}
                            onChange={(e) => handlePriceChange(currentPath, e.target.value)}
                            className="w-full p-3 pl-7 border border-gray-300 rounded-lg"
                            placeholder="0.00"
                        />
                    </div>
                </div>
            );
        });
    };
    
    const priceCategories: { key: keyof PriceList; title: string }[] = [
        { key: 'tractocamion', title: 'Tractocamiones' },
        { key: 'camionUnitario', title: 'Camiones Unitarios (Torton y Rabon)' },
        { key: 'lightVehicle', title: 'Autos, Pickups y Camionetas' }
    ];

    return (
        <div className="p-8 rounded-3xl bg-white shadow-xl space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="section-title">Ajustes de Precios</h2>
                <button onClick={onGoBack} className="btn-secondary ml-4">Regresar</button>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {priceCategories.map(cat => (
                         <button 
                            key={cat.key}
                            onClick={() => setActiveTab(cat.key)} 
                            className={`${activeTab === cat.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {cat.title}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="space-y-6">
                {renderPriceInputs(editablePrices[activeTab], [activeTab])}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <button onClick={handleSave} className="btn-primary w-full sm:w-auto">Guardar Cambios</button>
                <button onClick={onReset} className="btn-secondary !bg-red-600 hover:!bg-red-800 w-full sm:w-auto">Restaurar Precios por Defecto</button>
            </div>
        </div>
    );
};


function App() {
  type View = 'home' | 'register' | 'search' | 'customerProfile' | 'quotation' | 'serviceOrder' | 'priceSettings';
  const [viewHistory, setViewHistory] = useState<View[]>(['home']);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [activeVehicleSelection, setActiveVehicleSelection] = useState<VehicleSelection | null>(null);
  const [activeQuotation, setActiveQuotation] = useState<Quotation | null>(null);
  const [priceList, setPriceList] = useState<PriceList>(DEFAULT_PRICE_LIST);
  const [activeVehicleInfo, setActiveVehicleInfo] = useState<Omit<Vehicle, 'id'> | null>(null);
  
  useEffect(() => {
    const savedPrices = localStorage.getItem('appPriceList');
    if (savedPrices) {
        try {
            const parsedPrices = JSON.parse(savedPrices);
            // Deep merge to ensure new price structures are added if not present in localStorage
            const mergedPrices: PriceList = {
                ...DEFAULT_PRICE_LIST,
                ...parsedPrices,
                tractocamion: { ...DEFAULT_PRICE_LIST.tractocamion, ...(parsedPrices.tractocamion || {}) },
                camionUnitario: { ...DEFAULT_PRICE_LIST.camionUnitario, ...(parsedPrices.camionUnitario || {}) },
                lightVehicle: { ...DEFAULT_PRICE_LIST.lightVehicle, ...(parsedPrices.lightVehicle || {}) }
            };
            setPriceList(mergedPrices);
        } catch (e) {
            console.error("Failed to parse saved prices, using defaults.", e);
            setPriceList(DEFAULT_PRICE_LIST);
        }
    }
  }, []);

  const currentView = viewHistory[viewHistory.length - 1];

  const handleRegister = (data: CustomerData) => {
    const cleanedData = JSON.parse(JSON.stringify(data));

    const fillEmpty = (obj: any) => {
        if (!obj || Array.isArray(obj)) return;
        Object.keys(obj).forEach(key => {
            if (key === 'vehicles' || key === 'id') return;
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                fillEmpty(obj[key]);
            } else if (obj[key] === '' || obj[key] === null) {
                obj[key] = 'N/A';
            }
        });
    };

    fillEmpty(cleanedData);
    setCustomers(prev => [...prev.filter(c => c.id !== cleanedData.id), cleanedData]);
    setCustomerData(cleanedData);
    setViewHistory(prev => [...prev, 'customerProfile']);
  };
  
  const handleContinueWithoutClient = () => {
    const generalCustomer: CustomerData = {
      id: 'CUST-GENERAL',
      ...initialCustomerData,
      customerName: { ...initialCustomerData.customerName, fullName: 'Cliente General' },
      billingInfo: { ...initialCustomerData.billingInfo, rfc: 'XAXX010101000' }
    };
    setCustomerData(generalCustomer);
    setActiveVehicleSelection(null);
    setActiveQuotation(null);
    setViewHistory(prev => [...prev, 'customerProfile']);
  };

  const handleNavigate = (view: View) => {
    setViewHistory(prev => [...prev, view]);
  };
  
  const handleQuickQuote = () => {
    const generalCustomer: CustomerData = {
      id: 'CUST-GENERAL',
      ...initialCustomerData,
      customerName: { ...initialCustomerData.customerName, fullName: 'Cliente General' },
      billingInfo: { ...initialCustomerData.billingInfo, rfc: 'XAXX010101000' }
    };
    setCustomerData(generalCustomer);
    setActiveVehicleSelection(null);
    setActiveQuotation(null);
    setViewHistory(['home', 'quotation']);
  };

  const handleGoBack = () => {
    if (viewHistory.length > 1) {
        setViewHistory(prev => prev.slice(0, -1));
    }
  };
  
  const handleSaveQuotation = (quotation: Quotation) => {
    setQuotations(prev => [...prev.filter(q => q.id !== quotation.id), quotation]);
  };
  
  const handleGenerateOrder = (selection: VehicleSelection, vehicleInfo?: Omit<Vehicle, 'id'>) => {
    setActiveVehicleSelection(selection);
    setActiveVehicleInfo(vehicleInfo || null);
    setViewHistory(prev => [...prev, 'serviceOrder']);
  };
  
  const handleSelectCustomer = (customer: CustomerData) => {
    setCustomerData(customer);
    setActiveVehicleSelection(null);
    setActiveQuotation(null);
    setViewHistory(prev => [...prev, 'customerProfile']);
  };
  
  const handleViewQuotation = (quotation: Quotation) => {
    const customer = customers.find(c => c.id === quotation.customerId);
    const generalCustomer: CustomerData = {
        id: 'CUST-GENERAL', ...initialCustomerData,
        customerName: { ...initialCustomerData.customerName, fullName: 'Cliente General' },
        billingInfo: { ...initialCustomerData.billingInfo, rfc: 'XAXX010101000' }
    };
    const targetCustomer = customer || (quotation.customerId === 'CUST-GENERAL' ? generalCustomer : null);

    if(targetCustomer) {
        setCustomerData(targetCustomer);
        setActiveQuotation(quotation);
        const newHistory = [...viewHistory];
        if (newHistory[newHistory.length - 1] !== 'customerProfile') {
            newHistory.push('customerProfile');
        }
        newHistory.push('quotation');
        setViewHistory(newHistory);
    } else {
        alert('No se encontró el cliente para esta cotización.')
    }
  };

  const handlePriceUpdate = (newPrices: PriceList) => {
    setPriceList(newPrices);
    localStorage.setItem('appPriceList', JSON.stringify(newPrices));
  };
  
  const handlePriceReset = () => {
    if(window.confirm('¿Estás seguro de que quieres restaurar todos los precios a sus valores por defecto?')) {
        setPriceList(DEFAULT_PRICE_LIST);
        localStorage.removeItem('appPriceList');
        alert('Precios restaurados.');
    }
  };
  
  const handleDeleteCustomer = (customerId: string) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
    setQuotations(prev => prev.filter(q => q.customerId !== customerId));
    setViewHistory(['home', 'search']);
  };

  const handleDeleteQuotation = (quotationId: string) => {
    setQuotations(prev => prev.filter(q => q.id !== quotationId));
  };

  const handleUpdateCustomer = (updatedCustomer: CustomerData) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setCustomerData(updatedCustomer);
  };


  const renderContent = () => {
    switch(currentView) {
      case 'home':
        return <Home onNavigate={(v) => handleNavigate(v)} onQuickQuote={handleQuickQuote} />;
      case 'register':
        return <CustomerRegistrationForm onRegister={handleRegister} onContinueWithoutClient={handleContinueWithoutClient} onGoBack={handleGoBack} />;
      case 'search':
        return <SearchComponent customers={customers} quotations={quotations} onSelectCustomer={handleSelectCustomer} onViewQuotation={handleViewQuotation} onGoBack={handleGoBack} />
      case 'priceSettings':
        return <PriceSettings currentPrices={priceList} onSave={handlePriceUpdate} onReset={handlePriceReset} onGoBack={handleGoBack} />
      case 'customerProfile':
        if (customerData) {
          return <CustomerProfile 
            customer={customerData} 
            quotations={quotations}
            onCreateNew={(v) => { setActiveVehicleSelection(null); setActiveQuotation(null); setActiveVehicleInfo(null); setViewHistory(prev => [...prev, v]); }} 
            onViewQuotation={handleViewQuotation}
            onDeleteCustomer={handleDeleteCustomer}
            onDeleteQuotation={handleDeleteQuotation}
            onGoBack={handleGoBack} 
            />;
        }
        break;
      case 'quotation':
        if (customerData) {
          return <QuotationTool customer={customerData} priceList={priceList} initialQuotation={activeQuotation || undefined} onSave={handleSaveQuotation} onGenerateOrder={handleGenerateOrder} onGoBack={handleGoBack} />;
        }
        break;
      case 'serviceOrder':
         if (customerData) {
          return <ServiceOrder customer={customerData} vehicleSelection={activeVehicleSelection} priceList={priceList} onUpdateCustomer={handleUpdateCustomer} onGoBack={handleGoBack} vehicleInfo={activeVehicleInfo} />;
        }
        break;
      default:
        setViewHistory(['home']);
        return null;
    }

    if (!customerData && (currentView === 'customerProfile' || currentView === 'quotation' || currentView === 'serviceOrder')) {
      setViewHistory(['home']);
      return null;
    }
    return null;
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
        {currentView === 'home' ? (
             <main>
                {renderContent()}
            </main>
        ) : (
            <>
                <header className="text-center no-print">
                    <h1 className="header-title">TRUCK WASH STATION</h1>
                    <p className="header-subtitle">Sistema de Gestión de Servicios</p>
                </header>
                <main>
                    {renderContent()}
                </main>
            </>
        )}
    </div>
  );
}

export default App;
