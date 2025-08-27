FROM node:18-alpine

WORKDIR /app

# Abhängigkeiten installieren
COPY package*.json ./
RUN npm install

# Anwendung kopieren
COPY . .

# Port freigeben
EXPOSE 3000

CMD ["node", "server.js"]