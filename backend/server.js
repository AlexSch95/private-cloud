const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const { connectToDatabase } = require("./db.js");

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(cors());

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




app.listen(3000, () => {
    console.log(`Server läuft unter http://localhost:3000`);
})