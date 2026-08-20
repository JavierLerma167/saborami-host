// Tipo para los datos del usuario en Firestore
export interface UserData {
  username: string;
  email: string;
  phone: string;
  createdAt: string;
  uid: string;
  [key: string]: unknown;
}

// Tipo para las cartas
export interface Carta {
  id: string;
  remitenteId: string;
  remitenteNombre: string;
  destinatarioId: string;
  destinatarioEmail: string;
  asunto: string;
  contenido: string;
  fecha: Date | string;
  leida: boolean;
  importante: boolean;
  diseñoSobre: string; // 'classic' | 'modern' | 'vintage' | 'elegant'
  colorSobre: string; // Color del sobre seleccionado
}