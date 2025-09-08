FROM nginx:alpine
# Nginx-Konfiguration kopieren
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Frontend-Dateien kopieren
COPY . /usr/share/nginx/html
EXPOSE 80