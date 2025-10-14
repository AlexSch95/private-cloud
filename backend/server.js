const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { connectToDatabase } = require("./db.js");
const app = express();

require("dotenv").config();


app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());

// desc: Directories werden festgelegt und konstanten aus .env geladen
const PROJECTIMAGE_DIRECTORY = "/app/uploads/projectimages";
const secretKey = process.env.JWT_SECRET;

// desc: Middleware zur Token-Authentifizierung
function authenticateToken(req, res, next) {
  const tokenFromCookie = req.cookies.token;
  if (!tokenFromCookie) {
    return res.status(401).json({ success: false, message: "Bitte anmelden." });
  }
  try {
    const decoded = jwt.verify(tokenFromCookie, secretKey);
    req.user = decoded.username;
    req.id = decoded.id;
    next();
  } catch (error) {
    console.error(`Fehler in Middleware "authenticateToken": ${error}`);
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      res.clearCookie("token");
    }
    if (error.message.includes("jwt malformed")) {
      return res.status(400).json({
        success: false,
        message: "Ungültiger oder abgelaufener Token wurde übermittelt."
      });
    }
    res.status(500).json({
      success: false,
      message:
        "Es besteht ein Problem mit dem Session-Cookie. Bitte melden Sie sich erneut an oder kontaktieren Sie einen Administrator"
    });
  }
}

// desc: Auth-Check Route die im Frontend zum Redirect auf Login führt
app.get("/api/check-auth", authenticateToken, (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Token Verifizierung erfolgreich"
    });
  } catch (error) {
    console.error(`Fehler in Route "/api/check-auth": ${error}`);
    res.status(400).json({
      success: false,
      message: "Token Verifizierung fehlgeschlagen"
    });
  }
});

// desc: Route um alle Projekte zu laden
app.get("/api/projects/all", async (req, res) => {
  try {
    const connection = await connectToDatabase();
    const [result] = await connection.execute(
      "SELECT * FROM projects ORDER BY project_id DESC;"
    );
    await connection.end();
    res.status(200).json({
      success: true,
      message: "Projekte erfolgreich geladen",
      projects: result
    });
  } catch (error) {
    console.error("Fehler beim Laden der Projekte (/api/projects/all):", error);
    res.status(500).json({
      success: false,
      message: "Fehler beim Laden der Projekte..."
    });
  }
});

// desc: Projekt hinzufügen Route
app.post("/api/projects/add", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      description,
      status,
      readmeLink,
      githubLink,
      images,
      techstack
    } = req.body;
    const connection = await connectToDatabase();
    const [result] = await connection.execute(
      "INSERT INTO projects (title, description, status, readmeLink, githubLink, images, techstack) VALUES (?, ?, ?, ?, ?, ?, ?);",
      [
        title,
        description,
        status,
        readmeLink,
        githubLink,
        JSON.stringify(images),
        JSON.stringify(techstack)
      ]
    );
    await connection.end();
    res.status(201).json({
      success: true,
      message: "Projekt erfolgreich hinzugefügt mit der ID " + result.insertId,
      projectId: result.insertId
    });
  } catch (error) {
    console.error(
      "Fehler beim Hinzufügen des Projekts (/api/projects/add):",
      error
    );
    res.status(500).json({
      success: false,
      message: "Fehler beim Hinzufügen des Projekts"
    });
  }
});

// desc: ermöglicht direct URL zu den Bildern
app.use("/projectimages", express.static(PROJECTIMAGE_DIRECTORY));

// desc: logout route, löscht cookie
app.get("/api/logout", (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Abmeldung erfolgreich."
  });
});

// desc: Login Route, erstellt JWT Token und sendet diesen als HttpOnly Cookie
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
      "SELECT * FROM users WHERE user_name = ?",
      [username]
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
      username: user.user_name
    };
    //erstellen des verschlüsselten Tokens mit jwt.sign
    const token = jwt.sign(tokenUser, secretKey, { expiresIn: "1h" });
    //antwort ans frontend inklusive des erstellten, verschlüsselten tokens
    res
      .status(200)
      .cookie("token", token, { httpOnly: true, maxAge: 3600000 }) // 1 Stunde Gültigkeit
      .json({
        success: true,
        message: `Anmeldung als ${username} erfolgreich.`
      });
  } catch (error) {
    console.error(`Fehler in Route "/api/login": ${error}`);
    res.status(500).json({
      success: false,
      message: "Interner Serverfehler, Systemadministrator kontaktieren."
    });
  }
});

// app.post("/api/register", async (req, res) => {
//   try {
//     // Username und Passwort auslesen
//     const { username, password } = req.body;
//     if (username === undefined || password === undefined) {
//       return res.status(400).json({ error: "Username oder Passwort nicht übergeben." });
//     }
//     const connection = await connectToDatabase();
//     // Überprüfe, ob Username schon vergeben
//     const [existingUsers] = await connection.execute(
//       "SELECT * FROM users WHERE user_name = ?", [username]
//     );
//     if (existingUsers.length > 0) {
//       return res.status(500).json({
//         success: false,
//         message: "Username existiert schon."
//       });
//     }
//     // Ab hier: User erstellen
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);
//     await connection.execute("INSERT INTO users (user_name, password_hash) VALUES (?, ?)", [username, hashedPassword]
//     );
//     await connection.end();
//     res.status(201).json({
//       success: true,
//       message: `User ${username} erfolgreich erstellt.`,
//     });
//   } catch (error) {
//     console.error(`Fehler in Route "/api/register": ${error}`);
//     return res.status(500).json({ error: "Fehler beim Erstellen des Users." });
//   }
// });

if (require.main === module) {
  app.listen(3000, () => {
    console.info("Backend läuft auf Port 3000");
  });
}

module.exports = app;
