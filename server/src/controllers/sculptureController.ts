import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { generateQRCode } from '../utils/qrGenerator';

const prisma = new PrismaClient();

export const getSculptures = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.query;
    const sculptures = await prisma.sculpture.findMany({
      where: { isActive: true, ...(placeId ? { placeId: String(placeId) } : {}) },
      include: { qrCode: true, place: true, audioGuides: { include: { language: true } } },
      orderBy: { orderIndex: 'asc' },
    });
    return sendSuccess(res, sculptures);
  } catch (e: any) {
    return sendError(res, e.message || 'Failed to get sculptures');
  }
};

export const getSculpture = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const sculpture = await prisma.sculpture.findUnique({
      where: { id },
      include: { qrCode: true, place: true, audioGuides: { include: { language: true } } },
    });
    if (!sculpture) return sendError(res, 'Sculpture not found', 404);
    return sendSuccess(res, sculpture);
  } catch (e: any) {
    return sendError(res, e.message || 'Failed to get sculpture');
  }
};

export const getSculptureByQR = async (req: Request, res: Response) => {
  try {
    const qrValue = decodeURIComponent(String(req.params.qrValue));
    const qr = await prisma.qRCode.findUnique({
      where: { qrValue },
      include: {
        sculpture: {
          include: {
            place: true,
            qrCode: true,
            audioGuides: { include: { language: true } },
          },
        },
      },
    });
    if (!qr) return sendError(res, 'QR code not found', 404);
    return sendSuccess(res, qr.sculpture);
  } catch (e: any) {
    return sendError(res, e.message || 'Failed to find QR');
  }
};

export const createSculpture = async (req: Request, res: Response) => {
  try {
    console.log('CREATE SCULPTURE body:', req.body);

    const { placeId, name, historicalInfo, significance, architecture, nextSculptureId, orderIndex } = req.body;

    if (!placeId || !name) {
      return sendError(res, 'placeId and name are required', 400);
    }

    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        if (file.mimetype.startsWith('image/')) {
          images.push(`${process.env.BASE_URL}/uploads/images/${file.filename}`);
        }
      }
    }

    const sculpture = await prisma.sculpture.create({
      data: {
        placeId,
        name,
        historicalInfo: historicalInfo || '',
        significance: significance || '',
        architecture: architecture || '',
        images,
        orderIndex: Number(orderIndex) || 1,
        nextSculptureId: nextSculptureId && nextSculptureId.trim() !== '' ? nextSculptureId : null,
      },
    });

    console.log('Sculpture created:', sculpture.id, '— generating QR...');

    const { qrValue, qrImageBase64 } = await generateQRCode(sculpture.id);
    await prisma.qRCode.create({
      data: { sculptureId: sculpture.id, qrValue, qrImageBase64 },
    });

    console.log('QR generated:', qrValue);

    const result = await prisma.sculpture.findUnique({
      where: { id: sculpture.id },
      include: { qrCode: true },
    });

    return sendSuccess(res, result, 'Sculpture created with QR', 201);
  } catch (e: any) {
    console.error('createSculpture error:', e);
    return sendError(res, e.message || 'Failed to create sculpture');
  }
};

export const updateSculpture = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { name, historicalInfo, significance, architecture, nextSculptureId, orderIndex } = req.body;

    const images: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        if (file.mimetype.startsWith('image/')) {
          images.push(`${process.env.BASE_URL}/uploads/images/${file.filename}`);
        }
      }
    }

    const sculpture = await prisma.sculpture.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(historicalInfo !== undefined && { historicalInfo }),
        ...(significance !== undefined && { significance }),
        ...(architecture !== undefined && { architecture }),
        nextSculptureId: nextSculptureId && nextSculptureId.trim() !== '' ? nextSculptureId : null,
        orderIndex: Number(orderIndex) || 1,
        ...(images.length > 0 ? { images } : {}),
      },
      include: { qrCode: true },
    });

    return sendSuccess(res, sculpture, 'Sculpture updated');
  } catch (e: any) {
    console.error('updateSculpture error:', e);
    return sendError(res, e.message || 'Failed to update sculpture');
  }
};

export const deleteSculpture = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    await prisma.sculpture.update({ where: { id }, data: { isActive: false } });
    return sendSuccess(res, null, 'Sculpture deleted');
  } catch (e: any) {
    return sendError(res, e.message || 'Failed to delete sculpture');
  }
};

export const regenerateQR = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const { qrValue, qrImageBase64 } = await generateQRCode(id);
    const qr = await prisma.qRCode.upsert({
      where: { sculptureId: id },
      update: { qrValue, qrImageBase64 },
      create: { sculptureId: id, qrValue, qrImageBase64 },
    });
    return sendSuccess(res, qr, 'QR regenerated');
  } catch (e: any) {
    return sendError(res, e.message || 'Failed to regenerate QR');
  }
};