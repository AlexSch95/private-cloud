const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { connectToDatabase } = require("./db.js");

const app = express();
app.use(morgan("dev"));
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost',          // Für Localhost ohne Port
    'http://localhost:80',       // Für Localhost mit Port 80
    'http://localhost:3000',     // Für Direct Backend Access
    'http://frontend',           // Docker Service Name
    'http://frontend:80',        // Docker Service mit Port
    'http://machinezr.de',       // Deine Domain
    'http://www.machinezr.de',   // WWW Subdomain
    'http://127.0.0.1:80',       // IP mit Port
    'http://127.0.0.1'           // IP ohne Port
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get("/api/check", async (req, res) => {
try {
    res.status(200).json({
        success: true,
        message: "Verbindung zum Backend läuft..."
    });
} catch (error) {
    res.status(500).json({
        success: false,
        message: "Fehler beim Laden der Bilder..."
    });
}
})

app.get("/api/pictures/all", async (req, res) => {
    try {
        const connection = await connectToDatabase();
        const [result] = await connection.execute("SELECT * FROM pics;");
        await connection.end();
        res.status(200).json({
            success: true, 
            message: "Bilder erfolgreich geladen", 
            pictures: result});
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Fehler beim Laden der Bilder..."
        });
    }
})




app.listen(3000, '0.0.0.0', () => {
    console.log(`Server läuft unter http://0.0.0.0:3000`);
})