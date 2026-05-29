import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const getBookmarks = async (req: AuthRequest, res: Response) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: req.user!.id },
    include: { sculpture: { include: { place: true, qrCode: true, audioGuides: { include: { language: true } } } } },
    orderBy: { createdAt: 'desc' },
  });
  return sendSuccess(res, bookmarks);
};

export const addBookmark = async (req: AuthRequest, res: Response) => {
  const { sculptureId } = req.body;
  if (!sculptureId) return sendError(res, 'sculptureId required', 400);
  const bookmark = await prisma.bookmark.upsert({
    where: { userId_sculptureId: { userId: req.user!.id, sculptureId } },
    update: {},
    create: { userId: req.user!.id, sculptureId },
  });
  return sendSuccess(res, bookmark);
};

export const removeBookmark = async (req: AuthRequest, res: Response) => {
  const sculptureId = String(req.params.sculptureId);
  await prisma.bookmark.deleteMany({ where: { userId: req.user!.id, sculptureId } });
  return sendSuccess(res, null, 'Bookmark removed');
};