console.log("amongus");
const svgNS = "http://www.w3.org/2000/svg";

const addTaskButton = document.getElementById("add-task-btn");
const removeTaskButton = document.getElementById("remove-task-btn");
const taskSection = document.getElementById("task-section");
const shapeSVG = document.getElementById("shape-svg");
const submitButton = document.getElementById("generate-shape-btn")
let sides = 0;
const radius = 120;
const center = { x: 200, y: 200 }

function countTasks() {
    for (const child of taskSection.children) {
        if (child.className === "task") {
            sides += 1;
        }
    }

    console.log(`Task Count: ${sides}`);
}

function addTask() {
    sides += 1;

    let taskDiv = document.createElement("div");
    taskDiv.setAttribute("class", "task");

    let taskLabel = document.createElement("label");
    taskLabel.setAttribute("for", `task-${sides}`);
    taskLabel.textContent = `Task: `;

    let taskInput = document.createElement("input");
    taskInput.setAttribute("type", "text");
    taskInput.setAttribute("id", `task-${sides}`);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(taskDiv).appendChild(taskLabel).appendChild(taskInput);
    taskSection.appendChild(fragment);
}

function removeTask() {
    const lastTaskElement = taskSection.lastElementChild;
    console.log(lastTaskElement);
    if (lastTaskElement !== null && sides > 3) {
        taskSection.removeChild(lastTaskElement);
        sides -= 1;
    }
}

function generateShape() {
    if (shapeSVG.hasChildNodes()) {
        while (shapeSVG.firstChild) {
            shapeSVG.removeChild(shapeSVG.firstChild);
        }
    }

    vertices = []
    segments = []
    // calculate the coordinates of the shape's vertices + store in a list
    let k = 0;
    while (k < sides) {
        const angle = ((k / sides) * 2 * Math.PI) - Math.PI / 2; // moves anchor point to the top
        vertices.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        });
        console.log(`Vertex ${k}: (${vertices[k].x}, ${vertices[k].y})`);
        k += 1;
    }
    // calculate the attributes for each line segment based on each vertex as a starting point
    let i = 0;
    while (i < vertices.length) {
        v1 = vertices[i];
        const v2 = vertices[(i + 1) % vertices.length]
        segments.push({
            x1: v1.x,
            y1: v1.y,
            x2: v2.x,
            y2: v2.y,
            task: i + 1
        });
        i += 1;
    }

    // add each line to the SVG element
    i = 0;
    while (i < segments.length) {
        segment = segments[i];
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", segment.x1);
        line.setAttribute("y1", segment.y1);
        line.setAttribute("x2", segment.x2);
        line.setAttribute("y2", segment.y2);
        line.setAttribute("stroke-width", "5");
        line.setAttribute("stroke", "#7a93ba");
        shapeSVG.appendChild(line);
        i += 1;
    }

    // draw vertices
    i = 0;
    while (i < vertices.length) {
        vertex = vertices[i];
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", vertex.x);
        circle.setAttribute("cy", vertex.y);
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "#7a93ba");
        circle.setAttribute("stroke-width", "2.5");
        circle.setAttribute("stroke", "black");
        shapeSVG.appendChild(circle);
        i += 1;
    }
}

countTasks();
addTaskButton.addEventListener("click", addTask);
removeTaskButton.addEventListener("click", removeTask);
// window.onsubmit = generateShape;
submitButton.addEventListener("click", generateShape);