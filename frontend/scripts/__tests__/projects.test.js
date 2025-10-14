/**
 * @jest-environment jsdom
 */
import { renderProjects, projectMaximize } from "../projects.js";

global.fetch = jest.fn();
global.marked = {
  parse: jest.fn((markdown) => markdown)
};
global.Image = class {
  set src(_) { setTimeout(() => this.onload && this.onload(), 0); }
};

document.body.innerHTML = `
  <div id="projectContainer"></div>
  <div id="maximizedProjectContainer"></div>
`;


describe("Renderfunktionen", () => {
  let projectContainer;

  beforeEach(() => {
    projectContainer = document.getElementById("projectContainer");
    projectContainer.innerHTML = "";
  });

  test("Rendert für jedes Projekt eine Karte (funktion: renderProjects)", async () => {
    //desc: definiere projektdaten
    const testProjects = [
      {
        project_id: 1,
        title: "Test Projekt 1",
        description: "Beschreibung für Test Projekt 1",
        images: '["https://example.com/image1.jpg"]'
      },
      {
        project_id: 2,
        title: "Test Projekt 2",
        description: "Beschreibung für Test Projekt 2",
        images: '["https://example.com/image2.jpg"]'
      }
    ];

    //desc: Aufruf der Funktion mit testdaten und dem mock-container
    await renderProjects(testProjects, projectContainer);

    //desc: prüft ob 2 Projekt karten erstellt wurden
    const projectCards = projectContainer.querySelectorAll(".project-mini-card");
    expect(projectCards).toHaveLength(2);

    //desc: prüfen ob die daten in den Karten richtig hinterlegt sind
    const firstCard = projectCards[0];
    expect(firstCard.dataset.projectid).toBe("1");
    expect(firstCard.querySelector("#previewTitle-1")).toHaveTextContent("Test Projekt 1");
    expect(firstCard.querySelector("#previewDescription-1")).toHaveTextContent("Beschreibung für Test Projekt 1");
    expect(firstCard.querySelector(".projectPic")).toHaveAttribute("src", "https://example.com/image1.jpg");

    const secondCard = projectCards[1];
    expect(secondCard.dataset.projectid).toBe("2");
    expect(secondCard.querySelector("#previewTitle-2")).toHaveTextContent("Test Projekt 2");
    expect(secondCard.querySelector("#previewDescription-2")).toHaveTextContent("Beschreibung für Test Projekt 2");
    expect(secondCard.querySelector(".projectPic")).toHaveAttribute("src", "https://example.com/image2.jpg");
  });

  test("Wenn keine Projekte geladen werden soll der Container leer sein", () => {
    renderProjects([], projectContainer);
    expect(projectContainer.innerHTML).toBe("");
    expect(projectContainer.children).toHaveLength(0);
  });
});

describe("Große Projektansicht (funktion: projectMaximize)", () => {
  let maximizedProjectContainer;

  beforeEach(() => {
    maximizedProjectContainer = document.getElementById("maximizedProjectContainer");
    maximizedProjectContainer.innerHTML = "";

    fetch.mockClear();
    fetch.mockResolvedValue({
      ok: true,
      text: () => Promise.resolve("Mock Readme")
    });
  });

  test("Sollte das Projekt in der großen Ansicht korrekt rendern, mit der Readme als Beschreibung (statt dem Fallback auf project.description)", async () => {
    //desc: test daten vorbereiten
    const testProject = {
      project_id: 1,
      title: "Test Projekt 1",
      description: "Beschreibung für Test Projekt 1",
      images: '["https://example.com/image1.jpg", "https://example.com/image1b.jpg"]',
      techstack: '["JavaScript", "HTML", "CSS"]',
      readmeLink: "./mockReadme.md",
      githubLink: "https://github.com/test-projekt-1",
      status: "Abgeschlossen"
    };

    await projectMaximize(testProject, maximizedProjectContainer);

    // desc: ergebnisse überprüfen
    expect(maximizedProjectContainer.querySelector("#maximizedProjectTitle")).toHaveTextContent("Test Projekt 1");
    expect(maximizedProjectContainer.querySelector("#maximizedProjectStatus")).toHaveTextContent("Abgeschlossen");
    expect(maximizedProjectContainer.querySelector("#maximizedProjectDescription")).toHaveTextContent("Mock Readme");
    expect(maximizedProjectContainer.querySelectorAll(".project-card img")).toHaveLength(2);
    expect(maximizedProjectContainer.querySelectorAll(".project-card img")[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
    expect(maximizedProjectContainer.querySelectorAll(".project-card img")[1]).toHaveAttribute("src", "https://example.com/image1b.jpg");
    expect(maximizedProjectContainer.querySelectorAll(".badge")).toHaveLength(3);
    expect(maximizedProjectContainer.querySelectorAll(".badge")[0]).toHaveTextContent("JavaScript");
    expect(maximizedProjectContainer.querySelectorAll(".badge")[1]).toHaveTextContent("HTML");
    expect(maximizedProjectContainer.querySelectorAll(".badge")[2]).toHaveTextContent("CSS");
    expect(maximizedProjectContainer.querySelector("#previewGithubLink")).toHaveAttribute("href", "https://github.com/test-projekt-1");
  });

  //desc: edge case falls keine github readme eingetragen ist
  test("Sollte das Projekt in der großen Ansicht korrekt rendern, mit Beschreibung statt Github Readme", () => {
    //desc: test daten vorbereiten
    const testProject = {
      project_id: 1,
      title: "Test Projekt 1",
      description: "Beschreibung für Test Projekt 1",
      images: '["https://example.com/image1.jpg", "https://example.com/image1b.jpg"]',
      techstack: '["JavaScript", "HTML", "CSS"]',
      readmeLink: "",
      githubLink: "https://github.com/test-projekt-1",
      status: "Abgeschlossen"
    };

    projectMaximize(testProject, maximizedProjectContainer);

    expect(maximizedProjectContainer.querySelector("#maximizedProjectTitle")).toHaveTextContent("Test Projekt 1");
    expect(maximizedProjectContainer.querySelector("#maximizedProjectStatus")).toHaveTextContent("Abgeschlossen");
    expect(maximizedProjectContainer.querySelector("#maximizedProjectDescription")).toHaveTextContent("Beschreibung für Test Projekt 1");
    expect(maximizedProjectContainer.querySelectorAll(".project-card img")).toHaveLength(2);
    expect(maximizedProjectContainer.querySelectorAll(".project-card img")[0]).toHaveAttribute("src", "https://example.com/image1.jpg");
    expect(maximizedProjectContainer.querySelectorAll(".project-card img")[1]).toHaveAttribute("src", "https://example.com/image1b.jpg");
    expect(maximizedProjectContainer.querySelectorAll(".badge")).toHaveLength(3);
    expect(maximizedProjectContainer.querySelectorAll(".badge")[0]).toHaveTextContent("JavaScript");
    expect(maximizedProjectContainer.querySelectorAll(".badge")[1]).toHaveTextContent("HTML");
    expect(maximizedProjectContainer.querySelectorAll(".badge")[2]).toHaveTextContent("CSS");
    expect(maximizedProjectContainer.querySelector("#previewGithubLink")).toHaveAttribute("href", "https://github.com/test-projekt-1");
  });
});