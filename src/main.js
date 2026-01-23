const taskSection = document.getElementById("task-section");
const addTaskButton = document.getElementById("add-task-btn");
const removeTaskButton = document.getElementById("remove-task-btn");
const generateButton = document.getElementById("generate-shape-btn")
const rotateShapeButton = document.getElementById("rotate-shape-btn");
// const resultsDiv = document.getElementById("results-container");

const svgNS = "http://www.w3.org/2000/svg";
const shapeSVG = document.getElementById("shape-svg");
const radius = 120;
const center = { x: 200, y: 200 }
let vertices = [];
let segments = [];

let sides = 0;
let currentAngle = 0;
let targetAngle = 0;
let fullRotations = 0;
let isSpinning = false;

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

function calculateVertices() {
    vertices = [];
    let k = 0;
    const anglePerSide = (2 * Math.PI) / sides;
    // ensures even-sided shapes start off with a side at the bottom
    const evenSideOffset = (sides % 2 == 0) ? (anglePerSide / 2) : 0; 
    while (k < sides) {
        // using pi instead of 180 since cos() and sin() need radians
        const angle = ((k / sides) * 2 * Math.PI) - Math.PI / 2 + evenSideOffset;
        vertices.push({
            x: center.x + radius * Math.cos(angle),
            y: center.y + radius * Math.sin(angle)
        });
        k += 1;
    }
}

function calculateLineSegments(vertices) {
    // calculate the attributes for each line segment based on each vertex as a starting point
    segments = [];
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
}

function drawLineSegments() {
    i = 0;
    while (i < segments.length) {
        const segment = segments[i];
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", segment.x1);
        line.setAttribute("y1", segment.y1);
        line.setAttribute("x2", segment.x2);
        line.setAttribute("y2", segment.y2);
        line.setAttribute("stroke-width", "5");
        if (segment.task % 3 == 0) {
            line.setAttribute("stroke", "green");
        }
        else if (segment.task % 2 == 0) {
            line.setAttribute("stroke", "blue");
        } else {
            line.setAttribute("stroke", "red");
        }
        shapeSVG.appendChild(line);
        i += 1;
    }
}

function drawVertices() {
    i = 0;
    while (i < vertices.length) {
        vertex = vertices[i];
        const circle = document.createElementNS(svgNS, "circle");
        circle.setAttribute("cx", vertex.x);
        circle.setAttribute("cy", vertex.y);
        circle.setAttribute("r", "5");
        circle.setAttribute("fill", "black");
        circle.setAttribute("stroke-width", "2.5");
        circle.setAttribute("stroke", "black");
        shapeSVG.appendChild(circle);
        i += 1;
    }
}

function generateShape() {
    if (shapeSVG.hasChildNodes()) {
        while (shapeSVG.firstChild) {
            shapeSVG.removeChild(shapeSVG.firstChild);
        }
    }

    // reset the SVG's rotation
    shapeSVG.setAttribute("transform", `rotate(0, ${center.x}, ${center.y})`);

    calculateVertices();
    calculateLineSegments(vertices);
    drawLineSegments();
    drawVertices();
}

function rotateShape() {
    const anglePerSide = Math.round(360 / sides);
    const randomSide = Math.floor(Math.random() * sides);

    // reset
    shapeSVG.setAttribute("transform", `rotate(0, ${center.x}, ${center.y})`);
    currentAngle = 0;

    fullRotations = 2 + Math.floor(Math.random() * 2);
    targetAngle = currentAngle + (fullRotations * 360) + 360 - (randomSide * anglePerSide);
    isSpinning = true;

    animate();
}

function animate() {
    if (!isSpinning) return;

    const distanceToTarget = targetAngle - currentAngle;

    if (Math.abs(distanceToTarget) < 0.1) {
        currentAngle = targetAngle;
        isSpinning = false;
    } else {
        currentAngle += distanceToTarget * 0.025;
    }

    shapeSVG.setAttribute('transform', `rotate(${currentAngle}, ${center.x}, ${center.y})`);

    if (isSpinning) {
        requestAnimationFrame(animate);
    }
}


countTasks();
addTaskButton.addEventListener("click", addTask);
removeTaskButton.addEventListener("click", removeTask);
generateButton.addEventListener("click", generateShape);
rotateShapeButton.addEventListener("click", rotateShape);