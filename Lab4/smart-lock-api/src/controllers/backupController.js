import * as backupService from '../services/backupService.js';
import fs from 'fs/promises';

export const downloadBackup = async (req, res, next) => {
  try {
    const backupData = await backupService.createBackup();
 
    const date = new Date().toISOString().split('T')[0];
    const filename = `smart-lock-backup-${date}.json`;

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    res.json(backupData);
  } catch (error) {
    next(error);
  }
};

export const uploadBackup = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    
    let fileContent;
    if (req.file.buffer) {
        fileContent = req.file.buffer.toString('utf8');
    } else {
        fileContent = await fs.readFile(req.file.path, 'utf8');
        await fs.unlink(req.file.path);
    }

    const backupData = JSON.parse(fileContent);
    const result = await backupService.restoreBackup(backupData);

    res.json({ message: 'Backup restored successfully', details: result });
  } catch (error) {
    next(error);
  }
};