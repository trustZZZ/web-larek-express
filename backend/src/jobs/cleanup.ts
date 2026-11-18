// src/jobs/cleanup.ts
import cron from 'node-cron';
import fs from 'fs/promises';
import path from 'path';
import { jobLogger } from '../utils/jobLogger'; // Импортируем наш новый логгер

const TEMP_DIR = path.join(__dirname, '../../uploads/temp');

export const startCleanupJob = () => {
  // Расписание: каждый день в 03:00
  cron.schedule('0 3 * * *', () => {
    jobLogger.info('[CRON] Запуск очистки временных файлов...');

    fs.readdir(TEMP_DIR)
      .then((files) => {
        const now = Date.now();
        const oneHourMs = 60 * 60 * 1000;

        const cleanupPromises = files.map((file) => {
          const filePath = path.join(TEMP_DIR, file);
          return fs.stat(filePath)
            .then((stats) => {
              if (now - stats.ctimeMs > oneHourMs) {
                return fs.unlink(filePath)
                  .then(() => {
                    jobLogger.info(`[CRON] Удален старый файл: ${file}`);
                  });
              }
              return Promise.resolve();
            })
            .catch((err) => {
              jobLogger.error(`[CRON] Ошибка при обработке файла ${file}:`, err);
              return Promise.resolve();
            });
        });

        return Promise.all(cleanupPromises);
      })
      .then(() => {
        jobLogger.info('[CRON] Очистка завершена.');
      })
      .catch((err) => {
        jobLogger.error('[CRON] Критическая ошибка при очистке:', err);
      });
  });
};
