// cron/maintenanceJob.ts

import cron from 'node-cron';
import MaintenanceController from '../controllers/fleetController/maintenanceController';

export function scheduleMaintenanceAlerts() {
  cron.schedule('0 9 * * *', async () => {
    console.log('Running maintenance check at 9 AM...');
    await MaintenanceController.sendDueMaintenanceAlerts();
  });
}
