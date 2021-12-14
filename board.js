COMPUTER_TURN = 2;
DISABLE_INPUT = false;

class Board {
    constructor(current_turn=1, current_mode=1) {
        this.turn = current_turn;
        this.mode = current_mode;
        this.board = this.new_board();
        this.score = [2, 2];
    }

    /*
    Function to create a new board 
    */
    new_board() {
        // Reset the board
        let board = []
        
        // Fill board with 0's (no tokens)
        for (let i=0; i<8; i++) {
            let tmp = []
            for (let j=0; j<8; j++) {
                tmp.push(0)
            }
            board.push(tmp);
        }

        // Place the initial tokens
        board[3][3] = 1;
        board[4][4] = 1;
        board[3][4] = 2;
        board[4][3] = 2;

        return board
    }

    /*
    Calculate the number of white token and number of black token

    Returns a tuple (number of white token, number of black token)
    */
    score() {
        let white_score = 0;
        let black_score = 0;

        // loop through the whole board
        for (let i=0; i<8; i++){
            for (let j=0; j<8; j++) {
                if (this.board[i][j] == 1) {
                    white_score++;
                }
                else if (this.board[i][j] == 2) {
                    black_score++;
                }
            }
        }
        return [white_score, black_score]
    }

    /*
    Function that checks if given a position and direction, can a player capture something

    input: player     --> white or black player
    input: row        --> capture row
    input: col        --> capture column
    input: dir_hori   --> left/right direction
    input: dir_vert   --> up/down direction

    Returns True if the player can capture something there. False otherwise
    */
    enclosing(player, row, col, dir_hori, dir_vert) {
        // check for invalid direction pair
        if (dir_hori == 0 && dir_vert == 0) {
            return false;
        }

        // calculate the next square in the given direction
        let next_row = row + dir_hori;
        let next_col = row + dir_vert;

        // check if next square is on edge of board
        if (next_row < 0 || next_row > 7 || next_col < 0 || next_col > 7) {
            return false;
        }
        // check if next square is current player or empty
        else if (this.board[next_row][next_col] == player || this.board[next_row][next_col] == 0) {
            return false;
        }

        // keep moving int eh given direction until it reaches the edge of the board
        next_row += dir_hori;
        next_col += dir_vert;
        while (next_row > -1 && next_row < 8 && next_col > -1 && next_col < 8) {
            // if land on empty, we cannot capture
            if (this.board[next_row][next_col] == 0) {
                return false;
            }
            // if we find current player, we can capture
            else if (this.board[next_row][next_col] == player) {
                return true;
            }
            // if we find opposite player, keep going
            else {
                next_row += dir_hori
                next_col += dir_vert;
            }
        }
        return false;
    }

    /*
    Function that finds a list of valid moves that the player can make

    input: player --> check the valid move for white (1) or black (2)

    Returns a list of valid moves
    */
    valid_moves(player) {
        let res = [];
    
        // loop through the whole board
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                
                let found = false;
        
                // loop through all the directions
                for (let dir_hori = -1; dir_hori < 2; dir_hori++) {
                    for (let dir_vert = -1; dir_vert < 2; dir_vert++) {
                        // If the move is valid and it's empty
                        if (this.board[i][j] == 0 && enclosing(player, i, j, dir_hori, dir_vert)) {
                            res.push([i,j]);
                            found = true
                            break;
                        }
                    }
                    if (found) {
                        break;
                    }
                }
            }
        }
        return res;
    }

    /*
    Place the token onto the board

    input: player --> 1 for white, 2 for black
    input: row    --> row of token to be placed
    input: col    --> column of the token to be placed

    returns -1 if it's not a valid moves, 0 if the game ends, 1 if it's whites next turn, 2 if it's black's next turn
    */
    next_state(player, row, col) {
        let coord = [row, col];                     // turn row and col into coord pair
        let possible_moves = this.valid_moves(player);   // get a list of possible moves that player can make
        let found = false;
    
        // check if coords is in possible_moves
        for (let i = 0; i < possible_moves.length; i++) {
            if (JSON.stringify(coord) == JSON.stringify(possible_moves[i])) {
                current_board[row][col] = player;   // place the token
                found = true;
                break;
            }
        }
    
        // If token is placed, capture all possible pieces
        if (found) {
            // go through all the directions
            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {
                    // If we can capture
                    if (enclosing(player, row, col, i, j)) {
                        let current_row = row + i;
                        let current_col = col + j;
                        
                        // keep capturing in the direction until we encounter our own piece
                        while (current_board[current_row][current_col] != player) {
                            current_board[current_row][current_col] = player;
                            current_row += i;
                            current_col += j;
                        }
                    }
                }
            }
        
            // Sort out who's next move is it
            if (player == 1 && valid_moves(2).length != 0) {
                return 2;
            }
            else if (player == 1 && valid_moves(2).length == 0 && valid_moves(1).length != 0) {
                return 1;
            }
            else if (player == 1 && valid_moves(2).length == 0 && valid_moves(1).length == 0) {
                return 0;
            }
            else if (player == 2 && valid_moves(1).length != 0) {
                return 1;
            }
            else if (player == 2 && valid_moves(1).length == 0 && valid_moves(2).length != 0) {
                return 2;
            }
            else if (player == 2 && valid_moves(2).length == 0 && valid_moves(1).length == 0) {
                return 0;
            }
            else {
                console.log('Invalid check to see who\'s next to move')
            }
        }
        // If move is not found
        else {
            return -1;
        }
    }

    /*
    Function to copy the current board

    Returns the copy of the board
    */
    pseudocopy() {
        let copy = []
        for (let i = 0; i < 8; i++) {
            let tmp = []
            for (let j = 0; j < 8; j++) {
                tmp.push(this.board[i][j]);
            }
            copy.push(tmp);
        }
        return copy;
    }
}

console.log('Hello from board.js')
let test1 = new Board()