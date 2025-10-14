const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const request = require("supertest");

jest.mock("../db.js", () => {
    // execute-Mock mit zwei Aufrufen: einmal für GET, einmal für POST
    const execute = jest
        .fn()
        // Für GET /api/projects/all
        .mockResolvedValueOnce([
            [
                {
                    project_id: 1,
                    title: "Testprojekt",
                    description: "Beschreibung des Projekts",
                    images: JSON.stringify(["bild1.png", "bild2.png"]),
                    githubLink: "https://github.com/beispiel/testprojekt",
                    readmeLink: "https://github.com/beispiel/testprojekt/README.md",
                    status: "in Bearbeitung",
                    techstack: JSON.stringify(["Node.js", "Express", "MySQL"])
                },
                {
                    project_id: 2,
                    title: "Zweites Projekt",
                    description: "Beschreibung des zweiten Projekts",
                    images: JSON.stringify(["bild3.png", "bild4.png"]),
                    githubLink: "https://github.com/beispiel/zweites-projekt",
                    readmeLink: "https://github.com/beispiel/zweites-projekt/README.md",
                    status: "abgeschlossen",
                    techstack: JSON.stringify(["React", "Node.js"])
                }
            ]
        ])
        // Für POST /api/projects/add
        .mockResolvedValueOnce([{ insertId: 42 }]);
    return {
        connectToDatabase: jest.fn().mockResolvedValue({
            execute,
            end: jest.fn().mockResolvedValue(),
        }),
    };
});

const app = require("../server");

//desc: mock für die auth token Route
beforeAll(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
    const router = app.router;
    router.stack.forEach((layer) => {
        if (
            layer.route &&
            layer.route.path === "/api/projects/add" &&
            layer.route.methods.post
        ) {
            layer.route.stack.forEach((routeLayer) => {
                if (routeLayer.name === "authenticateToken") {
                    routeLayer.handle = (req, res, next) => next();
                }
            });
        }
    });
});

describe("GET /api/projects/all", () => {
    test("sollte alle Projekte zurückgeben", async () => {
        const response = await request(app).get("/api/projects/all");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("success", true);
        expect(Array.isArray(response.body.projects)).toBe(true);
        expect(response.body.projects[0]).toHaveProperty("title", "Testprojekt");
        expect(response.body.projects[1]).toHaveProperty("title", "Zweites Projekt");
        expect(response.body.projects.length).toBe(2);
    });
});

describe("POST /api/projects/add", () => {
    test("sollte ein Projekt erfolgreich hinzufügen", async () => {
        const newProject = {
            title: "Neues Projekt",
            description: "Beschreibung",
            status: "neu",
            readmeLink: "https://github.com/beispiel/neues-projekt/README.md",
            githubLink: "https://github.com/beispiel/neues-projekt",
            images: ["bild5.png"],
            techstack: ["Node.js", "Express"]
        };

        const response = await request(app)
            .post("/api/projects/add")
            .send(newProject);

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("success", true);
        expect(response.body).toHaveProperty("projectId", 42);
        expect(response.body.message).toContain("Projekt erfolgreich hinzugefügt");
    });
});