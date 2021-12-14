// Global variables 
let current_board;          // current board layout: 0 --> No piece, 1 --> White piece, 2 --> Black piece
let current_player = 1;     // current turn
let current_mode;           // 1 --> singleplayer, 2 --> 2-player
let computer_play = 2;
let disable_input = false;  // disable the inputs
let t;

/*
function start_singleplayer()

Function to start the singleplayer game
*/
function start_singleplayer() {
  current_mode = 1;
  new_board();
  init();
}

/*
function start_2player()

Function to start a 2 player game
*/
function start_2player() {
  current_mode = 2;
  new_board();
  init();
}

/*
function init()

This function is called when we want to hide the home screen and display the game
*/
function init() {
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

/*
function new_board()

Function to reset the board 
*/
function new_board() {
  // Reset the board
  current_board = [];

  // Fill board with 0's (no tokens)
  for (let i = 0; i < 8; i++) {
    let temp = []
    for (let j = 0; j < 8; j++) {
      temp.push(0);
    }
    current_board.push(temp);
  }

  // Place the initial tokens
  current_board[3][3] = 1;
  current_board[4][4] = 1;
  current_board[3][4] = 2;
  current_board[4][3] = 2;

  //Update the game 
  print_board();
  update_turn();
  update_score();
}

/*
function print_board()

Function to update the board on the screen
*/
function print_board() {
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
      if (current_board[i][j] == 1) {
        place_token(i, j, "w");
      }
      else if (current_board[i][j] == 2) {
        place_token(i, j, "b");
      }
    }
  }

  // Highlight all possible moves for the player to make
  list_of_moves = valid_moves(current_player);
  for (let i = 0; i < list_of_moves.length; i++) {
    let query_str = "r" + list_of_moves[i][0] + "c" + list_of_moves[i][1];
    document.getElementById(query_str).classList.add("highlight");
  }
}

/*
function place_token(row, column, colour)

HTML helper function to place the token

input: row      --> row that the token is placed
input: column   --> column that the token is placed
input: colour   --> colour of the token
*/
function place_token(row, column, colour) {
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

/*
function score()

Calculate the number of white token and number of black token

Returns a tuple (number of white token, number of black token)
*/
function score() {
  let white = 0;
  let black = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (current_board[i][j] == 1) {
        white++;
      }
      else if (current_board[i][j] == 2) {
        black++;
      }
    }
  }
  return [white, black];
}

/*
function enclosing(player, pos_row, pos_col, dir_hori, dir_vert)

Function that checks if given a position and direction, can a player capture something

input: player     --> white or black player
input: pos_row    --> capture row
input: pos_col    --> capture column
input: dir_hori   --> left/right direction
input: dir_vert   --> up/down direction

Returns True if the player can capture something there. False otherwise
*/
function enclosing(player, pos_row, pos_col, dir_hori, dir_vert) {
  // check for invalid direction pair
  if (dir_hori == 0 && dir_vert == 0) {
    return false;
  }

  // calculate the next square in the given directions
  let offset_pos_row = pos_row + dir_hori;
  let offset_pos_col = pos_col + dir_vert;

  // check if the next square is on the edge of the board
  if (offset_pos_row < 0 || offset_pos_row > 7 || offset_pos_col < 0 || offset_pos_col > 7) {
    return false;
  }
  // check if the next square is either the current players token or if it's empty
  else if (current_board[offset_pos_row][offset_pos_col] == player || current_board[offset_pos_row][offset_pos_col] == 0) {
    return false;
  }

  // keep moving in the given direction until it reaches the edge of the board
  offset_pos_row += dir_hori;
  offset_pos_col += dir_vert;
  while (offset_pos_row > -1 && offset_pos_row < 8 && offset_pos_col > -1 && offset_pos_col < 8) {
    // If we land on empty, we cannot capture
    if (current_board[offset_pos_row][offset_pos_col] == 0) {
      return false;
    }
    // If we find the current players token, we can capture
    else if (current_board[offset_pos_row][offset_pos_col] == player) {
      return true;
    }
    // If we still find the opposite player, keep going
    else {
      offset_pos_row += dir_hori;
      offset_pos_col += dir_vert;
    }
  }
  return false;
}

/*
function valid_moves(player)

Function that finds a list of valid moves that the player can make

input: player --> check the valid move for white (1) or black (2)

Returns a list of valid moves
*/
function valid_moves(player) {
  let res = [];

  // loop through the whole board
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      
      let found = false;

      // loop through all the directions
      for (let dir_hori = -1; dir_hori < 2; dir_hori++) {
        for (let dir_vert = -1; dir_vert < 2; dir_vert++) {

          // If the move is valid and it's empty
          if (current_board[i][j] == 0 && enclosing(player, i, j, dir_hori, dir_vert)) {
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
function next_state(player, row, col)

Place the token onto the board

input: player --> 1 for white, 2 for black
input: row    --> row of token to be placed
input: col    --> column of the token to be placed

returns -1 if it's not a valid moves, 0 if the game ends, 1 if it's whites next turn, 2 if it's black's next turn
*/
function next_state(player, row, col) {
  let coord = [row, col];                     // turn row and col into coord pair
  let possible_moves = valid_moves(player);   // get a list of possible moves that player can make
  let found = false;

  // check if coords is in possible_moves
  for (let i = 0; i < possible_moves.length; i++) {
    if (JSON.stringify(coord) == JSON.stringify(possible_moves[i])) {
      current_board[row][col] = player;   // place the token
      found = true;
      break;
    }
  }

  // If move is found, capture all possible pieces
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
      alert("WHUT: Pls email me: yangyipoh.pyy@gmail.com. There is a bug");
    }
  }
  // If move is not found
  else {
    return -1;
  }
}

/*
function cell_select(r, c)

Callback function when we click to place on the board

input: r --> the row that the user have clicked
input: c --> the column that the user have clicked
*/
function cell_select(r, c) {
  // don't do anything if input is disabled
  if (disable_input) {
    return;
  }

  // call next_state
  let exit_code = next_state(current_player, r, c);

  // exit_code == -1 --> user did not select a valid square
  if (exit_code == -1) {
    alert("Please select a VALID square (marked red)");
  }
  // exit_code == 0 --> the game has ended 
  else if (exit_code == 0) {
    let check = score();
    current_player = 0;
    print_board();
    update_turn();
    update_score();

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
    current_player = exit_code;
    print_board();
    update_turn();
    update_score();

    // If it's against the computer and its the computer's turn
    if (current_mode == 1 && current_player == computer_play) {
      disable_input = true;
      t = setTimeout(computer_move, 1000);  // Put some delay for feedback
    }
  }
}

/*
function pseudocopy()

Function to copy the current board

Returns the copy of the board
*/
function pseudocopy() {
  let copy = []
  for (let i = 0; i < 8; i++) {
    let temp = []
    for (let j = 0; j < 8; j++) {
      temp.push(current_board[i][j]);
    }
    copy.push(temp);
  }
  return copy;
}

/*
function computer_move()

Function that allows the computer to play
*/
function computer_move() {
  // keep moving if it's the computer's turn
  while (current_player == computer_play) {
    let current_best_score = 0;

    // get all the valid moves for the computer for now
    let computer_moves = valid_moves(current_player)
    let best_move = computer_moves[0];

    for (let i = 0; i < computer_moves.length; i++) {
      // play the move on a copied board
      let board_copy = pseudocopy();
      let temp = next_state(computer_play, computer_moves[i][0], computer_moves[i][1]);

      // calculate the score and see if it's the best move
      let temp_score = score();
      if (temp_score[1] > current_best_score) {
        current_best_score = temp_score[1];
        best_move = computer_moves[i];
      }

      // restore the board
      current_board = board_copy;
    }
    console.log(best_move);

    // play the best move
    let exit_code = next_state(current_player, best_move[0], best_move[1]);

    // exit_code == 0 --> game has ended
    if (exit_code == 0) {
      let check = score();
      print_board();
      current_player = 0;
      update_turn();
      update_score();
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
      current_player = exit_code;
      print_board();
      update_turn();
      update_score();
    }
  }

  // restore the input for the user
  disable_input = false;
}

/*
function update_turn()

Update the indicator on whose turn is it
*/
function update_turn() {
  if (current_player == 1) {
    document.getElementById("white-indicate").classList.add("green");
    document.getElementById("black-indicate").classList.remove("green");
  }
  else if (current_player == 2) {
    document.getElementById("white-indicate").classList.remove("green");
    document.getElementById("black-indicate").classList.add("green");
  }
  else {
    document.getElementById("white-indicate").classList.remove("green");
    document.getElementById("black-indicate").classList.remove("green");
  }
}

/*
function update_score()

Update the score of the board
*/
function update_score(){
  let all_score = score();
  let output_str = "<h2>" + all_score[0] + " VS " + all_score[1] + "</h2>";
  document.getElementById("display-score").innerHTML = output_str;
}

/*
function reset()

Reset the game
*/
function reset() {
  current_board = [];
  current_player = 1;
  current_mode = 1;
  computer_play = 2;
  disable_input = false;
  clearTimeout(t);
  document.getElementById("intro").classList.remove("hide");
  document.getElementById("board").classList.remove("board-design");
  document.getElementById("stat").classList.remove("stat-design");
  document.getElementById("board").classList.add("hide");
  document.getElementById("stat").classList.add("hide");
  document.getElementById("nav").classList.add("hide");
}
