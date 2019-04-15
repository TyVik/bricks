
// document.onkeydown = KeyPress;


const BOARD_SIZE = 12;

class Board {

    constructor() {

        this.boardSize = window.innerHeight * 0.7;
        this.cellSize = this.boardSize / BOARD_SIZE;
        this.htmlBoard = this.createHtmlBoard();

        this.cells = null;
        this.initCells();

        this.newRect = null;

        this.turn = null;
    }

    createHtmlBoard() {
        this.htmlBoard = document.getElementById('board');
        this.htmlBoard.style.height = this.boardSize + "px";
        this.htmlBoard.style.width = this.boardSize + "px";
        
        this.boardX = this.htmlBoard.getBoundingClientRect().left;
        this.boardY = this.htmlBoard.getBoundingClientRect().top;

        this.createCells();

    }

    createCells() {
        this.cells = [];
        for (let y = 0; y < BOARD_SIZE; y++){
            this.cells.push([]);
            for (let x = 0; x < BOARD_SIZE; x++){
                this.createCell(x, y);
            }
        }
    }

    createCell(x, y) {
        let id = "cell-X" + x + "-Y" + y;
        let div = document.createElement("div");
        div.setAttribute("id", id);
        div.setAttribute("class", "cell");
        div.style.width = this.cellSize + "px";
        div.style.height = this.cellSize + "px";
        document.getElementById("board").appendChild(div);
    }

    initCells() {
        this.cells = [];
        for(let i = 0; i < BOARD_SIZE; i++) {
            this.cells.push([]);
            for(let j = 0; j < BOARD_SIZE; j++) {
                this.cells[i].push(new Cell(i, j, this));
            }
        }
    }

    getCoords(event) {

        let pxX = event.clientX;
        let pxY = event.clientY;

        var x = Math.floor((pxX - this.boardX) / this.cellSize);
        var y = Math.floor((pxY - this.boardY) / this.cellSize);

        return [x, y];
    }

    showCoords(event) {

        var [x, y] = this.getCoords(event);

        let cell = this.cells[x][y];

        if(this.newRect) {
            if (this.newRect.isAllowable(event)) {
                this.newRect.mouseMove(event);
            }
        }

    }

    switchDrawMode(event) {

        let [x, y] = this.getCoords(event);

        if (this.newRect) {
            this.newRect.save();
            this.newRect = null;
        } else if (this.turn) {
            if (!this.canStartNewRect(x, y)) {
                return;
            }
            this.newRect = new NewRect(x, y, this);
        }
    }

    canStartNewRect(x, y) {
        if (this.newRect) {
            return false;
        }
        if (this.cells[x][y].color != null) {
            
            return false;
        }
        if((x===0 && y===0) && (this.turn == "red")) {
            return true;
        }
        if((x===BOARD_SIZE-1 && y===BOARD_SIZE-1) && (this.turn == "blue")) {
            return true;
        }
        if(this.isNextTo(x, y, this.turn)) {
            return true;
        }
        return false;
    }


    isNextTo(x, y, color) {
        for(let i = x-1; i <= x+1; i++) {
            for(let j = y-1; j <= y+1; j++) {
                if(i < 0 || j < 0 || i > BOARD_SIZE-1 || j > BOARD_SIZE-1) {
                    continue;
                }
                if(i === x && j === y) {
                    continue;
                }
                if (this.cells[i][j]._color === color) {
                    return true;
                }
            }
        }
        return false;
    }
    turnRed() {
        this.newRect = null;
        this.turn = "red";
        document.getElementById("board").style.outlineColor = "red";
    }
    turnBlue() {
        this.newRect = null;
        this.turn = "blue";
        document.getElementById("board").style.outlineColor = "blue"
    }

    KeyPress(e) {
        var evtobj = window.event? event : e
        if (evtobj.keyCode == 90 && evtobj.ctrlKey) {
            this.goBack();
        } else if (e.key == "Escape") {
            board.newRect.cancel();
        }
    }

    goBack() {
        console.log("Not implemented yet")
    }
}


class Cell {
    constructor(x, y, board) {
        this.id = "cell-X" + x + "-Y" + y;
        this.div = document.getElementById(this.id);
        this.x = x;
        this.y = y;
        this.board = board;
        this._color = null;
    }
    
    set color(value) {
        this._color = value;
        this.div.classList.remove("blue");
        this.div.classList.remove("red");
        this.div.classList.add(value);
    }

    get color() {
        return this._color;
    }
}


class NewRect {
    constructor(x, y, board) {
        this.div = document.getElementById("newRect");
        this.color = board.turn;
        this.startX = x;
        this.startY = y;
        this.board = board;
        this.mouseMove(event);
    }

    set color(value) {
        this.div.setAttribute("class", value);
        this._color = value;
    }

    get color() {
        return this._color;
    }

    set stopX(x) {
        this._stopX = x;
        this.div.style.left = this.board.boardX + Math.min(this.stopX, this.startX) * this.board.cellSize + "px";
        this.div.style.width = (Math.abs(this.stopX - this.startX) + 1) * this.board.cellSize + "px";
    }

    get stopX() {
        return this._stopX;
    }

    set stopY(y) {
        this._stopY = y;
        this.div.style.top = this.board.boardY + Math.min(this.stopY, this.startY) * this.board.cellSize + "px";
        this.div.style.height = (Math.abs(this.stopY - this.startY) + 1) * this.board.cellSize + "px";
    }

    get stopY() {
        return this._stopY;
    }

    mouseMove(event) {
        [this.stopX, this.stopY] = this.board.getCoords(event);

        let startX = Math.min(this.startX, this.stopX);
        let stopX = Math.max(this.startX, this.stopX);

        let startY = Math.min(this.startY, this.stopY);
        let stopY = Math.max(this.startY, this.stopY);

        this.board.sizeX = stopX - startX + 1;
        this.board.sizeY = stopY - startY + 1;

        document.getElementById("showSize").textContent = `${this.board.sizeX} x ${this.board.sizeY}`;
    }

    save(event) {
        let startX = Math.min(this.startX, this.stopX);
        let stopX = Math.max(this.startX, this.stopX);

        let startY = Math.min(this.startY, this.stopY);
        let stopY = Math.max(this.startY, this.stopY);

        for (let x = startX; x <= stopX; x++) {
            for (let y = startY; y <= stopY; y++) {
                this.board.cells[x][y].color = this.board.turn;
            }
        }
    }

    isAllowable(event) {
        let [x, y] = this.board.getCoords(event);
        let startX = Math.min(this.startX, x);
        let stopX = Math.max(this.startX, x);

        let startY = Math.min(this.startY, y);
        let stopY = Math.max(this.startY, y);
        for (let x = startX; x <= stopX; x++) {
            for (let y = startY; y <= stopY; y++) {
                if (this.board.cells[x][y].color != null) {
                    return false;
                }
            }
        }
        return true;
    }
}

function KeyDown(e) {
    console.log("key down")
    if (e.key == "Escape") {
        console.log("Escape pressed");
        this.cancel();
    }
}

function KeyPress(e) {
    console.log("key pressed");
    
}

document.addEventListener('keydown', KeyDown);
document.addEventListener('keypress', KeyPress);
