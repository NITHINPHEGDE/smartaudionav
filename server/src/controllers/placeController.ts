import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';

const prisma = new PrismaClient();

export const getPlaces = async (_req: Request, res: Response) => {
  const places = await prisma.touristPlace.findMany({ where: { isActive: true }, include: { _count: { select: { sculptures: true } } }, orderBy: { createdAt: 'desc' } });
  return sendSuccess(res, places);
};

export const getPlace = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const place = await prisma.touristPlace.findUnique({ where: { id }, include: { sculptures: { where: { isActive: true }, orderBy: { orderIndex: 'asc' }, include: { qrCode: true } } } });
  if (!place) return sendError(res, 'Place not found', 404);
  return sendSuccess(res, place);
};

export const createPlace = async (req: Request, res: Response) => {
  const { name, location, description } = req.body;
  if (!name || !location || !description) return sendError(res, 'All fields required', 400);
  const imageUrl = req.file ? `${process.env.BASE_URL}/uploads/images/${req.file.filename}` : null;
  const place = await prisma.touristPlace.create({ data: { name, location, description, imageUrl } });
  return sendSuccess(res, place, 'Place created', 201);
};

export const updatePlace = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const { name, location, description } = req.body;
  const imageUrl = req.file ? `${process.env.BASE_URL}/uploads/images/${req.file.filename}` : undefined;
  const place = await prisma.touristPlace.update({ where: { id }, data: { name, location, description, ...(imageUrl && { imageUrl }) } });
  return sendSuccess(res, place);
};

export const deletePlace = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await prisma.touristPlace.update({ where: { id }, data: { isActive: false } });
  return sendSuccess(res, null, 'Place deleted');
};