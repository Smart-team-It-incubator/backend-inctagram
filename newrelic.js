console.log("New Relic configuration is loaded");

if (!process.env.NEW_RELIC_APP_NAME || !process.env.NEW_RELIC_LICENSE_KEY) {
    console.error('ERROR: NEW_RELIC_APP_NAME or NEW_RELIC_LICENSE_KEY is missing!');
    process.exit(1);
  }

'use strict';
export const config = {
  app_name: [process.env.NEW_RELIC_APP_NAME],  // Название вашего приложения в New Relic
  license_key: process.env.NEW_RELIC_LICENSE_KEY,  // Ваш лицензионный ключ New Relic
  distributed_tracing: {
    enabled: true,
  },
  logging: {
    level: 'debug',
  },
  application_logging: {
    enabled: true,
    forwarding: {
      enabled: true,
      max_samples_stored: 10000,
    },
  },
  allow_all_headers: true,
};