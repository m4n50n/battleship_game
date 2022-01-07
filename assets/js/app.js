// #region GENERAL VARIABLES
// Definitions of ships and their number of parts
const ShipsDefinitions = {
    cruiser: 6,
    submarine: 5,
    destroyer: 4,
    carrier: 3,
    frigate: 2
}

const DefaultPositions = 0;
const RandomPositions = 1;

/**
 * Multidimensional array containing the square types (0 = Empty; 1 = Part of a ship; 2 = A sunken part of a ship; 3 = A missed shot)
 * Each array corresponds to a row and each value of the array corresponds to a cell on the game board
 */
 let GameBoard = [ 
    [0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,0,1],
    [0,0,0,0,0,0,0,0,1],
    [0,0,0,0,0,0,0,0,1],
    [0,0,0,1,1,0,0,0,1],
    [0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,1,1,1],
    [0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,0]
];

// Square types and their CSS classes
const emptySquare = 0;
const shipPart = 1;
const sunkenPart = 2;
const missingShot = 3;

const SquareStyles = {
    0: "",
    1: "parts",
    2: "sunken",
    3: "missed"
}

// DOM elements
const GameBoardContainer = document.querySelector("#game-board");
const RemainingParts = document.querySelector("#remaining-parts");
const GameUserNotifications = document.querySelector("#game-notifications");
const ShowShipsButton = document.querySelector(".show_ships");

const FireModal = document.querySelector("#fire-modal");
const ModalXCoordinateInput = document.querySelector("#x-coordinate");
const ModalYCoordinateInput = document.querySelector("#y-coordinate");
const GameTypeModal = document.querySelector("#game-type-modal");

// Controls
let ShowedShips = false; // Control if the non-sunken parts of the ships are hidden or shown
const TotalGameSquares = GameBoard.map(row => row.length).reduce((x, y) => x + y);
const TotalShipsParts = Object.keys(ShipsDefinitions).map(ship => ShipsDefinitions[ship]).reduce((x, y) => x + y); // Sum of all parts of all ships. With reduce(), we obtain the sum of all values of the map array output
// #endregion GENERAL VARIABLES

// #region FUNCTIONS
const InitApp = () => {
    ShowModal(GameTypeModal, true);
}

const PlaceShipsPositions = (type) => {
    if (type === RandomPositions) {
        RestartGameBoardVariable();
        PlaceRandomShips();
    }

    ShowModal(GameTypeModal, false);
    RenderBoard();
}

const RestartGameBoardVariable = () => {
    GameBoard = GameBoard.map(row => row.map(cell => 0)); // convert all values to 0
}

const PlaceRandomShips = () => {
    /**
     * Ships will be placed starting from a random row, cell and orientation
     * We will consider that a ship fits if there is a consecutive number of free spaces (horizontally or vertically) equal to the size os the ship in the random obtained row and starting from the random obtained cell
     */
    for (const ship in ShipsDefinitions) {
        const ShipWidth = ShipsDefinitions[ship];
        let PlacedShip = false;

        while (!PlacedShip) {
            const ShipRenderInitRow = Math.floor(Math.random() * 9); // Random number from 0 to 8
            const ShipRenderInitCell = Math.floor(Math.random() * 9); // Random number from 0 to 8
            const ShipRenderOrientation = Math.floor(Math.random() * 2) + 1; // Random number from 1 to 2

            const horizontal = 1;
            const vertical = 2;

            let ConsecutiveZerosCounter = 0;
            let AvailablePlacesIndex = [];
            let Available = false;
            
            if (ShipRenderOrientation === horizontal) {
                let row = GameBoard[ShipRenderInitRow];
                
                for (let i = 0; i < row.length; i++) {
                    if (i < ShipRenderInitCell) { continue; } // We will only check starting from the random obtained cell

                    if (row[i] === 0) { // 0 = Empty square
                        AvailablePlacesIndex.push(i);
                        ConsecutiveZerosCounter++;

                        if (ConsecutiveZerosCounter === ShipWidth) {
                            Available = !Available;
                            break; // Exit from loop
                        }
                    }
                    else {
                        AvailablePlacesIndex = [];
                        ConsecutiveZerosCounter = 0;
                    }
                }

                if (Available) {
                    AvailablePlacesIndex.map(available_cell_index => {
                        GameBoard[ShipRenderInitRow][available_cell_index] = 1;
                    });

                    PlacedShip = !PlacedShip;
                }
            }
            else if (ShipRenderOrientation === vertical) { // With this feature, we will check if the boat fits on the vertical axis of GameBoard variable
                for (i = 0; i < GameBoard.length; i++) {
                    if (i < ShipRenderInitRow) { continue; } // We will only check starting from the random obtained row

                    let CellValue = GameBoard[i][ShipRenderInitCell];
                    if (CellValue === 0) { // 0 = Empty square
                        AvailablePlacesIndex.push(i);
                        ConsecutiveZerosCounter++;

                        if (ConsecutiveZerosCounter === ShipWidth) {
                            Available = !Available;
                            break; // Exit from loop
                        }
                    }
                    else {
                        AvailablePlacesIndex = [];
                        ConsecutiveZerosCounter = 0;
                    }
                }

                if (Available) {
                    AvailablePlacesIndex.map(available_row_index => {
                        GameBoard[available_row_index][ShipRenderInitCell] = 1;
                    });

                    PlacedShip = !PlacedShip;
                }                
            }
        }
    }

    console.log(GameBoard);
}

const RenderBoard = () => {
    let board = `<div class="blank_guide"></div>`; // blank square from the upper left corner
    
    // Horizontal guides
    for (let i = 1; i <= 9; i++) {
        board += `<div class="h_guide">${i}</div>`;
    }

    /**
     * Vertical guides and squares 
     * - 9 rows under the horizontal guides
     * - Each row has one vertical guide + 9 squares
     */
    GameBoard.map((row, y) => { // row = each GameBoard array; y = vertical axis (rows index)
        row.map((squareType, x) => { 
            if (x === 0) { // Vertical guide (first div of the row)
                board += `<div class="v_guide"><span>${y + 1}</span></div>`; // Sum 1 because coordinates begins at 1 but the array indexes begins at 0
            }
            
            const StyleBoard = (squareType === sunkenPart || squareType === missingShot) ? squareType : emptySquare;
            const showShipValue = (ShowedShips && (squareType === shipPart || squareType === sunkenPart)) ? shipPart : emptySquare;
            board += `<div class="square ${SquareStyles[StyleBoard]} ${SquareStyles[showShipValue]}" onclick="FireShip(${y}, ${x})"></div>`;
        });
    });

    GameBoardContainer.innerHTML = board;
    CheckRemainingParts();
}

const CheckRemainingParts = () => {
    const TotalSunkenParts = document.querySelectorAll(`.${SquareStyles[sunkenPart]}`).length;
    const TotalMissedShots = document.querySelectorAll(`.${SquareStyles[missingShot]}`).length;
    RemainingParts.innerHTML = TotalShipsParts - TotalSunkenParts;
    
    if ((TotalGameSquares - TotalShipsParts) === TotalMissedShots) {
        SetUserNotifications("GAME OVER!!");
        FinishedGame();
    }    
    else if (TotalShipsParts === TotalSunkenParts) {
        SetUserNotifications("YOU WIN!!");
        FinishedGame();
    }
    
}

const ShowShips = () => {
    ShowedShips = !ShowedShips; // Opposite value: if true, false; if false, true;
    ShowShipsButton.innerHTML = ShowedShips ? "Show" : "Hide";
    
    RenderBoard();
}

const FireShip = (y, x) => {
    const SquareStatus = GameBoard[y][x];

    if (SquareStatus === sunkenPart || SquareStatus === missingShot) { return false; }
    GameBoard[y][x] = (SquareStatus === shipPart) ? sunkenPart : missingShot;

    RenderBoard();
}

const FireInput = (confirmation = false) => {    
    if (!confirmation) { 
        ModalXCoordinateInput.value = null;
        ModalYCoordinateInput.value = null;
        ShowModal(FireModal, true); 
        return false; 
    }

    let coordinates = [ModalYCoordinateInput.value, ModalXCoordinateInput.value];
    coordinates = coordinates.filter(coordinate => coordinate > 0 && coordinate < 10);

    if (coordinates.length !== 2) { return false; }
    
    FireShip(coordinates[0] - 1, coordinates[1] - 1); // We must substract 1 because the user wil insert numbers from 1 to 9 and array indexes begints at 0
    ShowModal(FireModal, false);
}

const ShowModal = (modal, show) => {
    modal.style.display = show ? "block" : "none";
}

const ShowUserNotifications = (show = false) => {
    if (!show) { GameUserNotifications.style.display = "none";  return false; }

    GameUserNotifications.style.display = "block";
}

const SetUserNotifications = (notification) => {
    GameUserNotifications.innerHTML = notification;
    ShowUserNotifications(true);
}

const FinishedGame = () => {
    document.querySelectorAll(".square").forEach(div => div.classList.add("block")); // Disable events in all game squares
    document.querySelector("#fire-input-button").disabled = true;
}
// #endregion FUNCTIONS

window.onload = () => InitApp();
