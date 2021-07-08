/*
Display black/white's turn
Display current score
*/

// white is 1 and black is 2
let current_board;
let current_player = 1;
let current_mode;
let computer_play = 2;
let disable_input = false;
let t;

function new_board() {
  current_board = []
  for (let i = 0; i < 8; i++) {
    let temp = []
    for (let j = 0; j < 8; j++) {
      temp.push(0);
    }
    current_board.push(temp);
  }
  current_board[3][3] = 1;
  current_board[4][4] = 1;
  current_board[3][4] = 2;
  current_board[4][3] = 2;
  print_board();
  update_turn();
  update_score();
}

function print_board() {
  let output_str = "";
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      output_str += "<div class=\"cell\" id=\"r" + i + "c" + j +"\" onclick=\"cell_select(" + i + "," + j + ")\"></div>";
    }
  }
  document.getElementById("board").innerHTML = output_str;
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
  list_of_moves = valid_moves(current_player);
  for (let i = 0; i < list_of_moves.length; i++) {
    let query_str = "r" + list_of_moves[i][0] + "c" + list_of_moves[i][1];
    document.getElementById(query_str).classList.add("highlight");
  }
}

function score() {
  let white = 0;
  let black = 0;
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (current_board[i][j] == 1) {
        white++
      }
      else if (current_board[i][j] == 2) {
        black++
      }
    }
  }
  return [white, black];
}

function enclosing(player, pos_row, pos_col, dir_hori, dir_vert) {
  if (dir_hori == 0 && dir_vert == 0) {
    return false;
  }
  let offset_pos_row = pos_row + dir_hori;
  let offset_pos_col = pos_col + dir_vert;
  if (offset_pos_row < 0 || offset_pos_row > 7 || offset_pos_col < 0 || offset_pos_col > 7) {
    return false;
  }
  else if (current_board[offset_pos_row][offset_pos_col] == player || current_board[offset_pos_row][offset_pos_col] == 0) {
    return false;
  }
  let found = false;
  offset_pos_row += dir_hori;
  offset_pos_col += dir_vert;
  while (offset_pos_row > -1 && offset_pos_row < 8 && offset_pos_col > -1 && offset_pos_col < 8) {
    if (current_board[offset_pos_row][offset_pos_col] == 0) {
      break;
    }
    else if (current_board[offset_pos_row][offset_pos_col] == player) {
      found = true;
      break;
    }
    else {
      offset_pos_row += dir_hori;
      offset_pos_col += dir_vert;
    }
  }
  return found;
}

function valid_moves(player) {
  let res = [];
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      let found = false;
      for (let dir_hori = -1; dir_hori < 2; dir_hori++) {
        for (let dir_vert = -1; dir_vert < 2; dir_vert++) {
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

function next_state(player, row, col) {
  let coord = [row, col];
  let possible_moves = valid_moves(player);
  let found = false;
  for (let i = 0; i < possible_moves.length; i++) {
    if (JSON.stringify(coord) == JSON.stringify(possible_moves[i])) {
      current_board[row][col] = player;
      found = true;
      break;
    }
  }
  if (found) {
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (i == 0 && j == 0) {
          continue;
        }
        else if (enclosing(player, row, col, i, j)) {
          let current_row = row + i;
          let current_col = col + j;
          while (current_board[current_row][current_col] != player) {
            current_board[current_row][current_col] = player;
            current_row += i;
            current_col += j;
          }
        }
      }
    }
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
  else {
    return -1;
  }
}

function start_singleplayer() {
  current_mode = 1;
  new_board();
  init();
}

function start_2player() {
  current_mode = 2;
  new_board();
  init();
}

function init() {
  document.getElementById("intro").classList.add("hide");
  document.getElementById("board").classList.add("board-design");
  document.getElementById("stat").classList.add("stat-design");
  document.getElementById("board").classList.remove("hide");
  document.getElementById("stat").classList.remove("hide");
  document.getElementById("nav").classList.remove("hide");
}

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

function cell_select(r, c) {
  if (disable_input) {
    return;
  }
  let exit_code = next_state(current_player, r, c);
  if (exit_code == -1) {
    alert("Please select a VALID square (marked red)");
  }
  else if (exit_code == 0) {
    let check = score();
    current_player = 0;
    print_board();
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
  }
  else {
    current_player = exit_code;
    print_board();
    update_turn();
    update_score();
    if (current_mode == 1 && current_player == computer_play) {
      disable_input = true;
      t = setTimeout(computer_move, 1000);
    }
  }
}

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

function computer_move() {
  while (current_player == computer_play) {
    let current_best_score = 0;
    let computer_moves = valid_moves(current_player)
    let best_move = computer_moves[0];
    for (let i = 0; i < computer_moves.length; i++) {
      let board_copy = pseudocopy();
      let temp = next_state(computer_play, computer_moves[i][0], computer_moves[i][1]);
      let temp_score = score();
      if (temp_score[1] > current_best_score) {
        current_best_score = temp_score[1];
        best_move = computer_moves[i];
      }
      current_board = board_copy;
    }
    console.log(best_move);
    let exit_code = next_state(current_player, best_move[0], best_move[1]);
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
    else {
      current_player = exit_code;
      print_board();
      update_turn();
      update_score();
    }
  }
  disable_input = false;
}

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

function update_score(){
  let all_score = score();
  let output_str = "<h2>" + all_score[0] + " VS " + all_score[1] + "</h2>";
  document.getElementById("display-score").innerHTML = output_str;
}

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
