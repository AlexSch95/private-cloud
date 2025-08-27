# backend/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Pakete zuerst kopieren für besseres Caching
COPY package*.json ./
RUN npm install

# Anwendungscode kopieren
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]