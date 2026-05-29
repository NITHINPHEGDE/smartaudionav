import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, message = 'Success', status = 200) => {
  const response: ApiResponse<T> = { success: true, data, message };
  return res.status(status).json(response);
};

export const sendError = (res: Response, error: string, status = 500) => {
  const response: ApiResponse = { success: false, error };
  return res.status(status).json(response);
};