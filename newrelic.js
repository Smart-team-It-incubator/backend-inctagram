import * as dotenv from 'dotenv';
dotenv.config();

console.log("inctagram:", process.env.NEW_RELIC_APP_NAME);
if (!process.env.NEW_RELIC_APP_NAME || !process.env.NEW_RELIC_LICENSE_KEY) {
    console.error('ERROR: NEW_RELIC_APP_NAME or NEW_RELIC_LICENSE_KEY is missing!');
    process.exit(1);
  }

'use strict';
exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME],  // Название вашего приложения в New Relic
  license_key: process.env.NEW_RELIC_LICENSE_KEY,  // Ваш лицензионный ключ New Relic
  logging: {
    level: 'info',  // Уровень логирования (можно поменять на 'debug', 'warn', 'error')
  },
};