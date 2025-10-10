/**
 * @jest-environment jsdom
 */

// Mock DOM erst vor dem Import
document.body.innerHTML = `
  <div id="projectContainer"></div>
  <div id="maximizedProjectContainer"></div>
`;

import { renderProjects } from "../projects.js";

describe("renderProjects", () => {
  let projectContainer;

  beforeEach(() => {
    projectContainer = document.getElementById("projectContainer");
    // Container vor jedem Test leeren
    projectContainer.innerHTML = "";
  });

  test("sollte Projekte korrekt rendern", () => {
    // Test-Daten vorbereiten
    const testProjects = [
      {
        project_id: 1,
        title: "Test Projekt 1",
        description: "Beschreibung für Test Projekt 1",
        images: "[\"https://example.com/image1.jpg\"]"
      },
      {
        project_id: 2,
        title: "Test Projekt 2",
        description: "Beschreibung für Test Projekt 2",
        images: "[\"https://example.com/image2.jpg\"]"
      }
    ];

    // Funktion aufrufen
    renderProjects(testProjects, projectContainer);

    // Überprüfen dass die richtige Anzahl von Projekt-Cards erstellt wurde
    const projectCards = projectContainer.querySelectorAll(".project-mini-card");
    expect(projectCards).toHaveLength(2);

    // Überprüfen dass die erste Projekt-Card korrekte Daten enthält
    const firstCard = projectCards[0];
    expect(firstCard.dataset.projectid).toBe("1");
    expect(firstCard.querySelector("#previewTitle-1")).toHaveTextContent("Test Projekt 1");
    expect(firstCard.querySelector("#previewDescription-1")).toHaveTextContent("Beschreibung für Test Projekt 1");
    expect(firstCard.querySelector(".projectPic")).toHaveAttribute("src", "https://example.com/image1.jpg");

    // Überprüfen dass die zweite Projekt-Card korrekte Daten enthält  
    const secondCard = projectCards[1];
    expect(secondCard.dataset.projectid).toBe("2");
    expect(secondCard.querySelector("#previewTitle-2")).toHaveTextContent("Test Projekt 2");
    expect(secondCard.querySelector("#previewDescription-2")).toHaveTextContent("Beschreibung für Test Projekt 2");
    expect(secondCard.querySelector(".projectPic")).toHaveAttribute("src", "https://example.com/image2.jpg");
  });

  test("sollte leeren Container bei leerem Array erstellen", () => {
    // Leeres Array testen
    renderProjects([], projectContainer);

    // Container sollte leer sein (innerHTML wird auf \"\" gesetzt)
    expect(projectContainer.innerHTML).toBe("");
    expect(projectContainer.children).toHaveLength(0);
  });
});
