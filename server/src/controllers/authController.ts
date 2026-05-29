import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { sendSuccess, sendError } from '../utils/response';
import { AuthRequest } from '../types';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) return sendError(res, 'Email and password required', 400);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return sendError(res, 'Invalid credentials', 401);
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return sendError(res, 'Invalid credentials', 401);
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return sendSuccess(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) return sendError(res, 'All fields required', 400);
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return sendError(res, 'Email already registered', 409);
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashed, name } });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  return sendSuccess(res, { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } }, 'Registered', 201);
};

export const me = async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, name: true, email: true, role: true } });
  return sendSuccess(res, user);
};