import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getAudioGuides = async (req: Request, res: Response) => {
  const sculptureId = String(req.params.sculptureId);
  const guides = await prisma.audioGuide.findMany({ where: { sculptureId }, include: { language: true } });
  return sendSuccess(res, guides);
};

export const uploadAudio = async (req: Request, res: Response) => {
  const { sculptureId, languageId, textContent } = req.body;
  if (!sculptureId || !languageId || !req.file) return sendError(res, 'sculptureId, languageId, and audio file required', 400);
  const audioUrl = `${process.env.BASE_URL}/uploads/audio/${req.file.filename}`;
  const guide = await prisma.audioGuide.upsert({
    where: { sculptureId_languageId: { sculptureId, languageId } },
    update: { audioUrl, textContent: textContent || '' },
    create: { sculptureId, languageId, audioUrl, textContent: textContent || '' },
    include: { language: true },
  });
  return sendSuccess(res, guide, 'Audio uploaded');
};

export const deleteAudio = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await prisma.audioGuide.delete({ where: { id } });
  return sendSuccess(res, null, 'Audio deleted');
};

export const getLanguages = async (_req: Request, res: Response) => {
  const languages = await prisma.language.findMany({ where: { isActive: true } });
  return sendSuccess(res, languages);
};