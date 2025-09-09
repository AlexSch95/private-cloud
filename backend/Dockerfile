# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN mkdir -p uploads/images && \
    chmod -R 755 uploads
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]