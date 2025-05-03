import { promises as fs } from 'fs';
import path from 'path';
import { logger } from './logger';

export const ensureDirectoryExists = async (directoryPath: string): Promise<void> => {
  try {
    await fs.mkdir(directoryPath, { recursive: true });
    logger.info(`Directory created or already exists: ${directoryPath}`);
  } catch (error) {
    logger.error(`Failed to create directory: ${directoryPath}`, { error });
    throw error;
  }
};

export const readJsonFile = async <T>(filePath: string): Promise<T> => {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (error) {
    logger.error(`Error reading JSON file: ${filePath}`, { error });
    throw error;
  }
};

export const writeJsonFile = async <T>(filePath: string, data: T): Promise<void> => {
  try {
    const dirPath = path.dirname(filePath);
    await ensureDirectoryExists(dirPath);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    logger.info(`File written successfully: ${filePath}`);
  } catch (error) {
    logger.error(`Error writing JSON file: ${filePath}`, { error });
    throw error;
  }
}; 