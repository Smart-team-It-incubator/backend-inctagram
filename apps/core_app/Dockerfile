# Check out https://hub.docker.com/_/node to select a new base image
FROM node:20.11-alpine
ARG port
ARG service
ENV SERVICE=$service
ENV PORT=$port
# Set to a non-root built-in user `node`

USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/dist/${SERVICE}

WORKDIR /home/node/dist/${SERVICE}

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)



COPY --chown=node package*.json ./
RUN mkdir -p /home/node/.npm && chown -R node:node /home/node/.npm
USER root
RUN npm install --force
USER node

# Bundle app source code
COPY --chown=node . .

RUN npm run libs:builds
# Очистка кешированных и устаревших файлов Prisma перед генерацией
RUN npx prisma format --schema=./apps/core_app/prisma/schema.prisma
RUN npm run generate:core_app
RUN npm run build:${SERVICE}

# Bind to all network interfaces so that it can be mapped to the host OS

EXPOSE ${PORT}

CMD npm run 'start:core_app'
