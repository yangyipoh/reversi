let COMPUTER_TURN = 2;
let COMPUTER_DELAY = 500;
let DEPTH = 7;
let tmp_var;

class Board {
    constructor(current_turn=1, current_mode=1, input=false) {
        this.turn = current_turn;
        this.mode = current_mode;
        this.board = this.new_board();
        this.score = [2, 2];
        this.disable_input = input;
    }

    init_singleplayer() {
        this.mode = 1;
        this.turn = 1;
        this.board = this.new_board()
        this.score = [2, 2];
    }

    init_2player() {
        this.mode = 2;
        this.turn = 1;
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

        // // Place the initial tokens
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
    calc_score() {
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
        let next_col = col + dir_vert;

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
                        if (this.board[i][j] == 0 && this.enclosing(player, i, j, dir_hori, dir_vert)) {
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
                this.board[row][col] = player;   // place the token
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
                    if (this.enclosing(player, row, col, i, j)) {
                        let current_row = row + i;
                        let current_col = col + j;
                        
                        // keep capturing in the direction until we encounter our own piece
                        while (this.board[current_row][current_col] != player) {
                            this.board[current_row][current_col] = player;
                            current_row += i;
                            current_col += j;
                        }
                    }
                }
            }
        
            // Sort out who's next move is it
            if (player == 1 && this.valid_moves(2).length != 0) {
                return 2;
            }
            else if (player == 1 && this.valid_moves(2).length == 0 && this.valid_moves(1).length != 0) {
                return 1;
            }
            else if (player == 1 && this.valid_moves(2).length == 0 && this.valid_moves(1).length == 0) {
                return 0;
            }
            else if (player == 2 && this.valid_moves(1).length != 0) {
                return 1;
            }
            else if (player == 2 && this.valid_moves(1).length == 0 && this.valid_moves(2).length != 0) {
                return 2;
            }
            else if (player == 2 && this.valid_moves(2).length == 0 && this.valid_moves(1).length == 0) {
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
    Callback function when we click to place on the board

    input: r --> the row that the user have clicked
    input: c --> the column that the user have clicked
    */
    process_onclick(r, c) {
        // don't do anything if input is disabled
        if (this.disable_input) {
            return;
        }

        // call next_state
        let exit_code = this.next_state(this.turn, r, c);

        // exit_code == -1 --> user did not select a valid square
        if (exit_code == -1) {
            alert("Please select a VALID square (marked red)");
        }

        // exit_code == 0 --> the game has ended 
        else if (exit_code == 0) {
            let check = this.calc_score();
            this.score = check
            this.turn = 0;
            this.draw();

            // Send victory message
            if (check[0] == check[1]) {
                alert("It's a draw!");
            }
            else if (check[0] > check[1]) {
                alert("Congratulations, White!");
            }
            else {
                alert("Congratulations, Black!");
            }
        }
        // exit_code == 1 or exit_code == 2 --> Keep playing
        else {
            this.turn = exit_code;
            this.draw();

            // If it's against the computer and its the computer's turn
            if (this.mode == 1 && this.turn == COMPUTER_TURN) {
                this.disable_input = true;
                this.computer_move();  // Put some delay for feedback
            }
        }
    }

    /*
    Function that allows the computer to play using minimax + alpha beta pruning
    */
    computer_move() {
        // keep moving if it's the computer's turn
        while (this.turn == COMPUTER_TURN) {
            let best_move;
            let decision_tree = create_tree(DEPTH, this);
            let max_val = minimax(decision_tree, DEPTH, -Infinity, Infinity);
            
            for (let i=0; i<decision_tree.child.length; i++) {
                if (decision_tree.child[i].node_val == max_val) {
                    best_move = decision_tree.child_moves[i];
                    break;
                }
            }
            console.log(best_move);

            // play the best move
            let exit_code = this.next_state(this.turn, best_move[0], best_move[1]);

            // exit_code == 0 --> game has ended
            if (exit_code == 0) {
                let check = this.calc_score();
                this.score = check;
                this.draw();

                this.turn = 0;
                if (check[0] == check[1]) {
                    alert("It's a draw!");
                }
                else if (check[0] > check[1]) {
                    alert("Congratulations, White!");
                }
                else {
                    alert("Congratulations, Black!");
                }
                break;
            }
            // exit_code == 1 or 2 --> keep playing
            else {
                this.turn = exit_code;
                this.draw();
            }
        }

        // restore the input for the user
        this.disable_input = false;
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

    /*
    Function to draw onto the screen
    */
    draw() {
        // draw the board
        /*
        Create 64 div blocks

        * Includes the cell attributes in CSS
        * Includes the id rXcY where X is Xth row and Y is the Yth column
        * Includes cell_select(X, Y) callback on click to allow the program to know where has the user clicked
        */
        let output_str = "";
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                output_str += "<div class=\"cell\" id=\"r" + i + "c" + j +"\" onclick=\"cell_select(" + i + "," + j + ")\"></div>";
            }
        }
        document.getElementById("board").innerHTML = output_str;

        // Place a white/black token depending on current_board
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] == 1) {
                    this.place_token(i, j, "w");
                }
                else if (this.board[i][j] == 2) {
                    this.place_token(i, j, "b");
                }
            }
        }

        // Highlight all possible moves for the player to make
        let list_of_moves = this.valid_moves(this.turn);
        for (let i = 0; i < list_of_moves.length; i++) {
            let query_str = "r" + list_of_moves[i][0] + "c" + list_of_moves[i][1];
            document.getElementById(query_str).classList.add("highlight");
        }

        // Update the turn
        if (this.turn == 1) {
            document.getElementById("white-indicate").classList.add("green");
            document.getElementById("black-indicate").classList.remove("green");
        }
        else if (this.turn == 2) {
            document.getElementById("white-indicate").classList.remove("green");
            document.getElementById("black-indicate").classList.add("green");
        }
        else {
            document.getElementById("white-indicate").classList.remove("green");
            document.getElementById("black-indicate").classList.remove("green");
        }

        // Update the score
        let all_score = this.calc_score();
        this.score = all_score;
        output_str = "<h2>" + all_score[0] + " VS " + all_score[1] + "</h2>";
        document.getElementById("display-score").innerHTML = output_str;
    }

    /*
    function place_token(row, column, colour)

    HTML helper function to place the token

    input: row      --> row that the token is placed
    input: column   --> column that the token is placed
    input: colour   --> colour of the token
    */
    place_token(row, column, colour) {
        let id_selector = "r" + row + "c" + column;
        let output_str = "";
        if (colour == "w") {
            output_str = "<div class=\"token white\"></div>";
        }
        else {
            output_str = "<div class=\"token black\"></div>";
        }
        document.getElementById(id_selector).innerHTML = output_str;
    }
}

// -------------------------------- onclick events -----------------------------------------
function cell_select(r, c) {
    current_board.process_onclick(r, c);
}

function start_singleplayer() {
    current_board.init_singleplayer();
    current_board.draw();
    transition();
}

function start_2player() {
    current_board.init_2player();
    current_board.draw();
    transition();
}

function reset() {
    // Create a new board
    current_board = new Board();

    // Edit HTML stuff
    document.getElementById("intro").classList.remove("hide");
    document.getElementById("board").classList.remove("board-design");
    document.getElementById("stat").classList.remove("stat-design");
    document.getElementById("board").classList.add("hide");
    document.getElementById("stat").classList.add("hide");
    document.getElementById("nav").classList.add("hide");
}

// ----------------------------- helper function ---------------------------------------
function transition() {
    // Remove the home screen 
  document.getElementById("intro").classList.add("hide");

  // Add the CSS design for the game
  document.getElementById("board").classList.add("board-design");
  document.getElementById("stat").classList.add("stat-design");

  // Unhide the game
  document.getElementById("board").classList.remove("hide");
  document.getElementById("stat").classList.remove("hide");
  document.getElementById("nav").classList.remove("hide");
}

console.log('Hello from board.js')
let current_board = new Board()