class Node {
    constructor(board=null, score=null) {
        this.board = board;
        this.child = [];
        this.child_moves = [];
        this.node_val = score;
    }

    is_terminal() {
        return this.child.length == 0;
    }

    set_val(val) {
        this.node_val = val;
    }
}

function create_tree(depth, board) {
    // base case
    if (depth == 0 || board.turn == 0) {
        let new_node = create_node(board);
        return new_node;
    }

    // create the parent
    let parent_node = create_node(board);

    // add the childrens
    let all_moves = board.valid_moves(board.turn);
    parent_node.child_moves = all_moves
    
    for (let i=0; i<all_moves.length; i++) {
        let cpy_board = create_new_board(board)
        let exit_code = cpy_board.next_state(cpy_board.turn, all_moves[i][0], all_moves[i][1]);
        cpy_board.turn = exit_code;
        let child_node = create_tree(depth-1, cpy_board);
        parent_node.child.push(child_node);
    }

    return parent_node;
}

function create_node(board) {
    let new_board = create_new_board(board)

    let new_node = new Node(board=new_board);

    return new_node;
}

function create_new_board(board) {
    // make new board
    let new_state_board = new Board();

    // copy over the whole board
    new_state_board.turn = board.turn;
    new_state_board.mode = board.mode;
    new_state_board.board = board.pseudocopy();
    new_state_board.score = board.score;
    new_state_board.disable_input = board.disable_input;

    return new_state_board
}

function flip_player(player) {
    if (player == 1) {
        return 2
    }
    else if (player == 2) {
        return 1
    }
}

function minimax(node, depth, alpha, beta) {
    if (depth == 0 || node.is_terminal()) {
        // objective = maximise black pieces
        let board = node.board;
        let score = board.calc_score();
        return score[1];
    }
    let board = node.board;
    let maximizing_black = (board.turn == 2);
    if (maximizing_black) {
        let value = -Infinity;
        for (let i=0; i < node.child.length; i++) {
            let child = node.child[i];
            value = Math.max(value, minimax(child, depth-1, alpha, beta, false));
            alpha = Math.max(alpha, value);
            if (value >= beta) {
                break;
            }
        }
        node.set_val(value)
        return value;
    }
    else {
        let value = Infinity;
        for (let i=0; i < node.child.length; i++) {
            let child = node.child[i];
            value = Math.min(value, minimax(child, depth-1, alpha, beta, true));
            beta = Math.min(beta, value);
            if (value <= alpha) {
                break;
            }
        }
        node.set_val(value)
        return value;
    }
}

console.log('Testing world')
