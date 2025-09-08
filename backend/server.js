const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { connectToDatabase } = require("./db.js");
const app = express();

require('dotenv').config();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

const IMAGE_DIRECTORY = '/app/uploads/images';
const secretKey = process.env.JWT_SECRET

// Multer Konfiguration für Windows
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGE_DIRECTORY);
  },
  filename: function (req, file, cb) {
    // ShareX-kompatibler Dateiname
    const originalName = file.originalname;
    const safeName = originalName.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|bmp|tiff|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  console.log(extname);
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Nur Bilddateien sind erlaubt!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB Limit
  }
});

function authenticateToken(req, res, next) {
  const tokenFromCookie = req.cookies.token;
  if (!tokenFromCookie){
    return res.status(401).json({success: false, message: "Token wurde nicht übermittelt."});
  }
  try {
    const decoded = jwt.verify(tokenFromCookie, secretKey);
    req.user = decoded.username;
    req.id = decoded.id;
    next();
  } catch (error) {
    console.error(`Fehler in Middleware "authenticateToken": ${error}`);
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      res.clearCookie('token');
    }
    if (error.message.includes("jwt malformed")) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger oder abgelaufener Token wurde übermittelt."
      })
    }
    res.status(500).json({
      success: false, 
      message: "Ungültiger oder abgelaufener Token wurde übermittelt."
    })
  }
}

function parseFilename(filename) {
  // Dateinamen ohne Extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  const parts = nameWithoutExt.split(/[_:]+/);
  const extractedTime = parts[2];
  const extractedDate = parts[1];

  return {
    original: filename,
    name: parts[0] || '', // "Code"
    date: extractedDate || '', // "29-08-25"
    time: extractedTime || '', // "12-02"
  };
}

async function dbPictureMeta(filename) {
  const meta = parseFilename(filename);
  const generatedFilepath = "http://machinezr.de/images/" + filename;
  try {
    const connection = await connectToDatabase();
    const [result] = await connection.execute(
      "INSERT INTO pictures (title, file_path, creation_date, creation_time) VALUES (?, ?, ?, ?);",
      [meta.name, generatedFilepath, meta.date, meta.time]
    );
    await connection.end();
    console.log('Datenbankeintrag erfolgreich als ID:', result.insertId);
  } catch (error) {
    console.error('Datenbankfehler:', error);
  }
}

app.get("/api/check-auth", authenticateToken, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Token Verifizierung erfolgreich"
    })
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Token Verifizierung fehlgeschlagen"
    })
  }
})

app.post('/api/pictures/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }
    const imageUrl = `http://machinezr.de/images/${req.file.filename}`;
    res.send(imageUrl);
    await dbPictureMeta(req.file.filename);
    console.log(`Upload successful: ${imageUrl}`);

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).send('Upload failed: ' + error.message);
  }
});

app.delete('/api/pictures/delete/:id', authenticateToken, async (req, res) => {
  const pictureId = req.params.id;
  console.log(pictureId);
  try {
    const connection = await connectToDatabase();
    const [result] = await connection.execute("DELETE FROM pictures WHERE id = ?;", [pictureId]);
    await connection.end();
    res.status(200).json({
      success: true,
      message: "Bild erfolgreich gelöscht"
    });
  } catch (error) {
    console.error('Datenbankfehler:', error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Löschen des Bildes"
    });
  }
});

app.use('/images', express.static(IMAGE_DIRECTORY));

app.get("/api/pictures/all", authenticateToken, async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [result] = await connection.execute("SELECT * FROM pictures ORDER BY creation_date DESC, creation_time DESC;");
    await connection.end();
    res.status(200).json({
      success: true,
      message: "Bilder erfolgreich geladen",
      pictures: result
    });
  } catch (error) {
    console.error('Fehler beim Laden der Bilder:', error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Bilder..."
    });
  }
})

app.get("/api/logout", (req, res) => {
  res.clearCookie('token').json({
    success: true,
    message: "Abmeldung erfolgreich."
  });
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username === undefined || password === undefined) {
      return res.status(400).json({
        success: false,
        message: "Kein Benutzername oder Passwort übermittelt."
      });
    }
    const connection = await connectToDatabase();
    // Überprüfe, ob Username existiert
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE user_name = ?', [username]
    );
    await connection.end();
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Es existiert kein Benutzer mit diesem Benutzernamen."
      });
    }
    const user = existingUsers[0];
    const passwordHash = user.password_hash;
    // Ab hier: Passwort-Hash überprüfen
    const passwordCorrect = await bcrypt.compare(password, passwordHash);
    if (passwordCorrect === false) {
      return res.status(401).json({
        success: false,
        message: "Das eingegebene Passwort ist nicht korrekt."
      });
    }
    // Objekt erstellen, das in unserem token mit jsonwebtoken gesigned wird
    const tokenUser = {
      id: user.user_id,
      username: user.user_name,
    }
    //erstellen des verschlüsselten Tokens mit jwt.sign
    const token = jwt.sign(tokenUser, secretKey, { expiresIn: '1h' });
    //antwort ans frontend inklusive des erstellten, verschlüsselten tokens
    res.status(200)
      .cookie('token', token, { httpOnly: true, maxAge: 3600000 }) // 1 Stunde Gültigkeit
      .json({
        success: true,
        message: `Anmeldung als ${username} erfolgreich.`,
      })

  } catch (error) {
    console.error(`Fehler in Route "/api/login": ${error}`);
    res.status(500).json({
      success: false,
      message: "Interner Serverfehler, Systemadministrator kontaktieren."
    })
  }
});

app.post("/api/register", async (req, res) => {
  try {
    // Username und Passwort auslesen
    const { username, password } = req.body;
    if (username === undefined || password === undefined) {
      return res.status(400).json({ error: "Username oder Passwort nicht übergeben." });
    }
    const connection = await connectToDatabase();
    // Überprüfe, ob Username schon vergeben
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE user_name = ?', [username]
    );
    if (existingUsers.length > 0) {
      return res.status(500).json({
        success: false,
        message: "Username existiert schon."
      });
    }
    // Ab hier: User erstellen
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const [newUser] = await connection.execute(
      'INSERT INTO users (user_name, password_hash) VALUES (?, ?)', [username, hashedPassword]
    );
    await connection.end();
    res.status(201).json({
      success: true,
      message: `User ${username} erfolgreich erstellt.`,
    })
  } catch (error) {
    return res.status(500).json({ error: "Fehler beim Erstellen des Users." });
  }
});



app.listen(3000, () => {
  console.log(`Server läuft unter http://localhost:3000`);
})