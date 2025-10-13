## 📋 Übersicht
Eine selbst gehostete Webanwendung zur Visualisierung meines Techstacks und meiner privaten Projekte. Das Projekt bietet eine intuitive Weboberfläche mit Authentifizierung und modernem Design.

## ✨ Hauptfunktionen
- 🔐 Sicheres Login-System mit JWT-Authentifizierung
- 👀 Projektübersicht
- ⚙️ Verwaltung der hinterlegten Projekte

## 🛠️ Technologie-Stack

### Frontend
- HTML5 & CSS3 (Modern Design)
- JavaScript (ES6+, Module System)
- Bootstrap 5 (Responsive Framework)
- FontAwesome & Bootstrap Icons

### Backend
- Node.js & Express.js
- MySQL 8.0
- JSON-Web-TOken (Authentifizierung)
- bcrypt (Password Hashing)

### Deployment
- CI/CD Pipeline mit Linting, Tests und automatischem Deployment
- Docker & Docker Compose für Nginx, Datenbank und Backend
- SSL/TLS Encryption (HTTPS)
- Umgebungsvariablen
- Reverse Proxy Configuration

## 🚀 Installation & Setup

1. Repository klonen:
```bash
git clone https://github.com/yourusername/private-cloud.git
cd private-cloud
```

2. Umgebungsvariablen konfigurieren (Beispiel für Local Developement):
```bash
echo "DB_HOST=mysql
DB_USER=portfolio_user
DB_PASSWORD=developement_db_pw
DB_NAME=portfolio_db
DB_ROOT_PASSWORD=developement_db_root_pw
JWT_SECRET=developement_jwt_secret
NGINX_CONF=nginx.dev.conf
FRONTEND_URL=http://localhost" > .env
```

3. Docker-Container starten:
```bash
docker-compose up -d
```

## 🔒 Sicherheitsfeatures

- HTTPS-Verschlüsselung durch SSL/TLS
- Sichere Passwortspeicherung mit bcrypt
- JWT-basierte Sitzungsverwaltung mit HTTP-Only Cookies
- Geschützte API-Endpunkte

## 💻 Entwicklung

### Frontend-Entwicklung
- Vanilla.JS
- Modulares Design für bessere Wartbarkeit
- Responsive Design mit Bootstrap 5
- Dark Mode als Standard

### Backend-Entwicklung
- RESTful API-Design
- Sichere Authentifizierung
- Strukturierte Datenbankanbindung

## 🌐 Deployment

Das Projekt ist für DockerCompose-basiertes Deployment optimiert 

Live erreichbar unter: https://machinezr.de
Kontakt: 95.schulz@googlemail.com
