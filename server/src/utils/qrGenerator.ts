import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';

export const generateQRCode = async (sculptureId: string): Promise<{ qrValue: string; qrImageBase64: string }> => {
  const qrValue = `SMART_NAV:SCULPTURE:${sculptureId}:${uuidv4()}`;
  const qrImageBase64 = await QRCode.toDataURL(qrValue, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    width: 512,
    margin: 2,
    color: { dark: '#1a1a2e', light: '#ffffff' },
  });
  return { qrValue, qrImageBase64 };
};