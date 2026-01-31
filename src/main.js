import { vec2, mat2 } from "gl-matrix";

const taskSection = document.getElementById("task-section");
const addTaskButton = document.getElementById("add-task-btn");
const removeTaskButton = document.getElementById("remove-task-btn");
const generateButton = document.getElementById("generate-shape-btn")
const rotateShapeButton = document.getElementById("rotate-shape-btn");
const resultsDiv = document.getElementById("results-container");

const svgNS = "http://www.w3.org/2000/svg";
const shapeSVG = document.getElementById("shape-svg");
const debugSVG = document.getElementById("debug-svg");
let tasks;
let shape; // current system is only designed to handle 1 shape at a time
let vertexMap = new Map(); // maps a vertex to its transformed version

class Shape {
    // haha what happened to encapsulation...
    center;
    radius = 0;
    sides = 0;
    vertices = [];
    segments = [];

    currentAngle = 0;
    targetAngle = 0;
    fullRotations = 0;
    isSpinning = false;

    constructor(center, radius, sides) {
        if (center instanceof Point && Number.isFinite(radius) && Number.isFinite(sides)) {
            this.center = center;
            this.radius = radius;
            this.sides = sides;
        }
    }

    calculateVertices() {
        this.vertices = []; // reset it
        let k = 0;
        const anglePerSide = (2 * Math.PI) / this.sides;
        // ensures even-sided shapes start off with a side at the bottom
        const evenSideOffset = (this.sides % 2 == 0) ? (anglePerSide / 2) : 0; 
        while (k < this.sides) {
            // using pi instead of 180 since cos() and sin() need radians
            const angle = ((k / this.sides) * 2 * Math.PI) - Math.PI / 2 + evenSideOffset;
            const x = this.center.x + this.radius * Math.cos(angle);
            const y = this.center.y + this.radius * Math.sin(angle);
            this.vertices.push(new Point(x, y));
            k += 1;
        }
        console.log(`${this.vertices.length} Points created`);
    }

    calculateLineSegments() {
        // calculate the attributes for each line segment based on each vertex as a starting point
        this.segments = [];
        let i = 0;
        while (i < this.vertices.length) {
            const v1 = this.vertices[i];
            const v2 = this.vertices[(i + 1) % this.vertices.length]
            this.segments.push(new LineSegment(v1.x, v1.y, v2.x, v2.y, i+1));
            i += 1;
        }
        console.log(`${this.segments.length} LineSegments created`);
    }
}

class Point {
    x;
    y;

    constructor(x, y) {
        if (Number.isFinite(x) && Number.isFinite(y)) {
            this.x = x;
            this.y = y;
        } else {
            throw new TypeError("Invalid coordinates provided for point.");
        }
    }

    [Symbol.toPrimitive]() {
        return `Point: (x = ${this.x}, y = ${this.y})`;
    }

    static deserialize(string) {
        const re = /^Point: \(x = (?<x>\d+\.?\d*), y = (?<y>\d+\.?\d*)\)$/;
        const result = re.exec(string);
        return new Point(Number(result.groups.x), Number(result.groups.y));
    }
}

class LineSegment {
    v1;
    v2;
    task;

    constructor(x1, y1, x2, y2, task) {
        this.v1 = new Point(x1, y1);
        this.v2 = new Point(x2, y2);
        this.task = task;
    }

    [Symbol.toPrimitive]() {
        return `Line Segment: 1 - [${this.v1}], 2 - [${this.v2}])`;
    }
}

function countTasks() {
    let tasks = 0;
    for (const child of taskSection.children) {
        if (child.className === "task") {
            tasks += 1;
        }
    }

    console.log(`Task Count: ${tasks}`);
    return tasks;
}

function addTask() {
    tasks += 1;

    let taskDiv = document.createElement("div");
    taskDiv.setAttribute("class", "task");

    let taskLabel = document.createElement("label");
    taskLabel.setAttribute("for", `task-${tasks}`);
    taskLabel.textContent = `Task: `;

    let taskInput = document.createElement("input");
    taskInput.setAttribute("type", "text");
    taskInput.setAttribute("id", `task-${tasks}`);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(taskDiv).appendChild(taskLabel).appendChild(taskInput);
    taskSection.appendChild(fragment);
}

function removeTask() {
    const lastTaskElement = taskSection.lastElementChild;
    console.log(lastTaskElement);
    if (lastTaskElement !== null && tasks > 3) {
        taskSection.removeChild(lastTaskElement);
        tasks -= 1;
    }
}

function drawVertices(vertices) {
    let i = 0;
    while (i < vertices.length) {
        const vertex = vertices[i];
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

function drawLineSegments(segments) {
    let i = 0;
    while (i < segments.length) {
        const segment = segments[i];
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", segment.v1.x);
        line.setAttribute("y1", segment.v1.y);
        line.setAttribute("x2", segment.v2.x);
        line.setAttribute("y2", segment.v2.y);
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

function generateShape() {
    if (shapeSVG.hasChildNodes()) {
        while (shapeSVG.firstChild) {
            shapeSVG.removeChild(shapeSVG.firstChild);
        }
    }

    if (debugSVG.hasChildNodes()) {
        while (debugSVG.firstChild) {
            debugSVG.removeChild(debugSVG.firstChild);
        }
    }

    const center = new Point(0, 0);
    shape = new Shape(center, 75, countTasks());

    // reset the SVG's rotation
    shapeSVG.setAttribute("transform", `rotate(0, ${shape.center.x}, ${shape.center.y})`);

    console.log(`Generating a shape with ${shape.sides} sides`);
    shape.calculateVertices();
    shape.calculateLineSegments();
    drawLineSegments(shape.segments);
    drawVertices(shape.vertices); // so they appear on top of the lines
}

function rotateShape(shape) {
    if (debugSVG.hasChildNodes()) {
        while (debugSVG.firstChild) {
            debugSVG.removeChild(debugSVG.firstChild);
        }
    }

    const anglePerSide = Math.round(360 / shape.sides);
    const randomSide = Math.floor(Math.random() * shape.sides);

    // reset
    shapeSVG.setAttribute("transform", `rotate(0, ${shape.center.x}, ${shape.center.y})`);
    shape.currentAngle = 0;

    shape.fullRotations = 2 + Math.floor(Math.random() * 2);
    shape.targetAngle = (shape.fullRotations * 360) + 360 - (randomSide * anglePerSide);
    console.log(`Current Angle: ${shape.currentAngle}, Target Angle: ${shape.targetAngle}`);
    shape.isSpinning = true;

    findLandingSide(shape);
    animate(shape);
}

function animate(shape) {
    if (!shape.isSpinning) return;

    const distanceToTarget = shape.targetAngle - shape.currentAngle;

    if (Math.abs(distanceToTarget) < 0.1) {
        shape.currentAngle = shape.targetAngle;
        shape.isSpinning = false;
    } else {
        shape.currentAngle += distanceToTarget * 0.025;
    }

    shapeSVG.setAttribute('transform', `rotate(${shape.currentAngle}, ${shape.center.x}, ${shape.center.y})`);

    if (shape.isSpinning) {
        requestAnimationFrame(() => { animate(shape) });
    }
}

function findLandingSide(shape) {
    // create transformation matrix based on the target angle
    const targetRadians = shape.targetAngle * (Math.PI / 180);
    console.log(`Degrees (${shape.targetAngle}) to Radians (${targetRadians})`);
    let tmatrix = mat2.fromValues(Math.cos(targetRadians), Math.sin(targetRadians), -Math.sin(targetRadians), Math.cos(targetRadians)); // column-major
    console.log(tmatrix[0]);

    let transformedVertices = [];

    // apply the transformation matrix to each vertex
    shape.vertices.forEach((oldVertex) => {
        const oldVector = vec2.fromValues(oldVertex.x, oldVertex.y);
        const result = vec2.create();
        vec2.transformMat2(result, oldVector, tmatrix);

        const newVertex = new Point(result[0], result[1]);
        transformedVertices.push(newVertex);
        console.log(`Old = [${oldVertex}] -- New = [${newVertex}]`);
        vertexMap.set(`${oldVertex}`, `${newVertex}`); // serialization
    });

    console.log(vertexMap);

    // DEBUGGING - drawing the lines with the new vertices to see if they overlay the rotated shape
    let newSegments = [];
    let i = 0;
    while (i < transformedVertices.length) {
        const v1 = transformedVertices[i];
        const v2 = transformedVertices[(i + 1) % transformedVertices.length]
        newSegments.push(new LineSegment(v1.x, v1.y, v2.x, v2.y, i+1));
        i += 1;
    }

    i = 0;
    while (i < newSegments.length) {
        const segment = newSegments[i];
        const line = document.createElementNS(svgNS, "line");
        line.setAttribute("x1", segment.v1.x);
        line.setAttribute("y1", segment.v1.y);
        line.setAttribute("x2", segment.v2.x);
        line.setAttribute("y2", segment.v2.y);
        line.setAttribute("stroke-width", "5");
        if (segment.task % 3 == 0) {
            line.setAttribute("stroke", "#CDF7C1");
        }
        else if (segment.task % 2 == 0) {
            line.setAttribute("stroke", "#C1DDF7");
        } else {
            line.setAttribute("stroke", "#F7CFC1");
        }
        debugSVG.appendChild(line);
        i += 1;
    }

    // find the two vertices with the lowest y-value
    // find the line segment associated with those vertices
    // display the task associated with that line segment in resultsDiv
}

countTasks();
addTaskButton.addEventListener("click", addTask);
removeTaskButton.addEventListener("click", removeTask);
generateButton.addEventListener("click", generateShape);
rotateShapeButton.addEventListener("click", () => { rotateShape(shape) });