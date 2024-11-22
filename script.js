const rows = 6
const cols = 7
const board = document.getElementById("board");
const winner = document.getElementById("winner")
const canvas = document.getElementById("canvas")
document.getElementById("restartBtn").addEventListener("click", restart);
let currentPlayer = 1
let winState = false

const rc = rough.canvas(canvas);
const ctx = canvas.getContext('2d');

function restart(){
    winState = false
    winner.innerText = ""
    winner.style.display = "none"
    restartBtn.style.display = "none"
    canvas.style.zIndex = "0"
    ctx.clearRect(0, 0, canvas.width, canvas.height)  // Clear the canvas

    // Create the table from the top down (highest cell at row = 0)
    const children = board.childElementCount
    for (let i = 0; i < children; i++) {
        console.log(board.childNodes[i])
        board.removeChild(board.childNodes[0])
    }
    for (let i = 0; i < rows; i++) {
        const row = document.createElement("tr");
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement("td");
            cell.style.backgroundColor = "#1F2431"
            cell.dataset.row = i
            cell.dataset.col = j
            cell.addEventListener("click", () => handleClick(cell));
            row.appendChild(cell)
        }
        board.appendChild(row)
    }
}
restart()

function handleClick(cell) {
    if (winState){ return }

    // Find the lowest cell in the col
    const col = cell.dataset.col;
    for (let i = rows-1; i >= 0; i--) {
        const targetCell = board.rows[i].cells[col]
        const color = targetCell.style.backgroundColor
        if (color == "red" || color == "yellow") { continue }
        targetCell.style.backgroundColor = currentPlayer == 1 ? "red" : "yellow"
        fall(targetCell)
        const points = checkForVictory(targetCell)
        const tie = checkForTie()
        if (points || tie){
            console.log(points)
            winState = true
            canvas.style.zIndex = "2"

            let x1 = points.x1*54+25
            let y1 = points.y1*54+25
            let x2 = points.x2*54+25
            let y2 = points.y2*54+25
            setTimeout(() => {
                animateLine(x1, y1, x2, y2, 0.2)
            }, 500)
            setTimeout(() => {
                if (tie){
                    winner.style.display = ""
                    restartBtn.style.display = ""
                    winner.innerHTML = "IT'S A TIE !!!"
                    return
                }
                winner.style.display = ""
                restartBtn.style.display = ""
                winner.innerHTML = 'PLAYER ' +
                '<span style="color: ' + targetCell.style.backgroundColor + ';">' +
                String(targetCell.style.backgroundColor).toUpperCase() +
                '</span>' +
                ' WON THE GAME !!!'
            }, 1000)
        }
        currentPlayer = currentPlayer == 1 ? 2 : 1  // Switch player
        break
    }
}


function animateLine(x1, y1, x2, y2, durationSeconds) {
    const duration = durationSeconds * 1000;  // Milliseconds
    const startTime = performance.now();

    function draw(currentTime) {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1); // Progression between 0 and 1

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the partial line
        const currentX = x1 + (x2 - x1) * progress;
        const currentY = y1 + (y2 - y1) * progress;
        rc.line(x1, y1, currentX, currentY);

        if (progress < 1) {
            requestAnimationFrame(draw);
        }
    }

    // Start the animation
    requestAnimationFrame(draw);
}


function fall(targetCell) {
    targetCell.style.transitionDuration = "0s"
    targetCell.style.transform = "translate(0, -" + targetCell.dataset.row +"00%)"

    setTimeout(() => {
        targetCell.style.transitionDuration = "0.5s"
        targetCell.style.transform = "translate(0, 0px)"
    }, 10);
}


function checkForVictory(cell){
    const x = +cell.dataset.col
    const y = +cell.dataset.row
    let x1 = x; let y1 = y  // Start x, Start y
    let x2 = x; let y2 = y  // End x, End y
    let combo = 0

    // ------------ Ceck for the right cells ------------
    for (let i = 1; i < 4; i++) {
        // If the target cell is out of borders
        if (x+i >= cols){
            break
        }
        const targetCell = board.rows[y].cells[x+i]
        if (targetCell.style.backgroundColor != cell.style.backgroundColor){
            break
        }
        x1 = x+i; y1 = y
        combo++
    }

    // ------------ Ceck for the left cells ------------
    for (let i = 1; i < 4; i++) {
        if (x-i < 0){ break }
        const targetCell = board.rows[y].cells[x-i]
        if (targetCell.style.backgroundColor != cell.style.backgroundColor){ break }
        x2 = x-i; y2 = y
        combo++
    }
    if (combo >= 3) { return {x1, y1, x2, y2} }

    // ------------ Ceck for the bottom cells ------------ (no need to check the top ones)
    x1 = x; y1 = y
    x2 = x; y2 = y
    combo = 0
    for (let i = 1; i < 4; i++) {
        if (y+i >= rows){ break }
        const targetCell = board.rows[y+i].cells[x]
        if (targetCell.style.backgroundColor != cell.style.backgroundColor){ break }
        x2 = x; y2 = y+i
        combo++
    }
    if (combo >= 3) { return {x1, y1, x2, y2} }

    // ------------ Ceck for the right diagonal cells ------------
    x1 = x; y1 = y
    x2 = x; y2 = y
    combo = 0
    for (let i = 1; i < 4; i++) {
        if (y+i >= rows || x+i >= cols){ break }
        const targetCell = board.rows[y+i].cells[x+i]
        if (targetCell.style.backgroundColor != cell.style.backgroundColor){ break }
        x1 = x+i; y1 = y+i
        combo++
    }

    for (let i = 1; i < 4; i++) {
        if (y-i < 0 || x-i < 0){ break }
        const targetCell = board.rows[y-i].cells[x-i]
        if (targetCell.style.backgroundColor != cell.style.backgroundColor){ break }
        x2 = x-i; y2 = y-i
        combo++
    }
    if (combo >= 3) { return {x1, y1, x2, y2} }

    // ------------ Ceck for the left diagonal cells ------------
    x1 = x; y1 = y
    x2 = x; y2 = y
    combo = 0
    for (let i = 1; i < 4; i++) {
        if (y+i >= rows || x-i < 0){ break }
        const targetCell = board.rows[y+i].cells[x-i]
        if (targetCell.style.backgroundColor != cell.style.backgroundColor){ break }
        x1 = x-i; y1 = y+i
        combo++
    }

    for (let i = 1; i < 4; i++) {
        if (y-i < 0 || x+i >= cols){ break }
        const targetCell = board.rows[y-i].cells[x+i]
        if (targetCell.style.backgroundColor != cell.style.backgroundColor){ break }
        x2 = x+i; y2 = y-i
        combo++
    }
    if (combo >= 3) { return {x1, y1, x2, y2} }

    return false
}

function checkForTie(){
    let full = true
    let firstLine = board.rows[0]  // highest line
    for (let i=0; i < cols; i++){
        full &&= firstLine.cells[i].style.backgroundColor == "red" || firstLine.cells[i].style.backgroundColor == "yellow"
    }
    console.log(full)
    return full
}
