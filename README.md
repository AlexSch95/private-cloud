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
- Nginx (Reverse Proxy)

### Backend
- Node.js & Express.js
- MySQL 8.0
- JWT (Authentication)
- bcrypt (Password Hashing)

### Deployment
- Docker & Docker Compose
- SSL/TLS Encryption
- Environment Variables
- Reverse Proxy Configuration

## 🗂️ Projektstruktur
```
private-cloud/
├── frontend/                 # Frontend-Anwendung
│   ├── assets/              # Statische Ressourcen
│   │   ├── img/            # Bilder
│   │   └── styles/         # CSS-Dateien
│   ├── scripts/            # JavaScript-Module
│   ├── *.html             # HTML-Seiten
│   ├── Dockerfile         # Frontend-Container
│   ├── nginx.dev.conf     # Nginx-Konfiguration ohne SSL (für Dev)
│   └── nginx.conf         # Nginx-Konfiguration
│
├── backend/                 # Backend-Server
│   ├── uploads/            # Upload-Verzeichnis
│   ├── server.js          # Express-Server
│   ├── db.js             # Datenbankanbindung
│   └── Dockerfile        # Backend-Container
│
├── db/                     # Datenbank
│   └── init.sql          # DB-Initialisierung
│
└── docker-compose.yml      # Container-Orchestrierung
```

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
- JWT-basierte Sitzungsverwaltung
- Geschützte API-Endpunkte
- Sicheres File-Upload-System (Upload-Route für ShareX Custom Uploader)

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


Kontakt: 95.schulz@googlemail.com
