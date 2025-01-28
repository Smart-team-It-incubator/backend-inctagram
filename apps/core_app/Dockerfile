# Указываем базовый образ
FROM node:20.11-alpine

# Аргументы сборки
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port

# Устанавливаем пользователя node
USER node

# Создаем директорию приложения
RUN mkdir -p /home/node/dist/${SERVICE}

WORKDIR /home/node/dist/${SERVICE}

# Устанавливаем зависимости
COPY --chown=node package*.json ./
RUN npm install --force

# Копируем исходный код приложения
COPY --chown=node . .

# Собираем приложение
RUN npm run libs:builds
RUN npm run generate:core_app
RUN npm run build:${SERVICE}

# Добавляем скрипт для проверки порта
USER root
RUN apk add --no-cache bash curl

COPY --chown=node ./check-port.sh /usr/local/bin/check-port.sh
RUN chmod +x /usr/local/bin/check-port.sh

# Открываем порт
EXPOSE ${PORT}

# Команда запуска с проверкой порта
CMD /usr/local/bin/check-port.sh 587 && npm run start:core_app