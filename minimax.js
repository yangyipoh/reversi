class Node {
    constructor(node_val=null) {
        this.node_val = node_val;
        this.child = [];
    }

    is_terminal() {
        return this.child.length == 0;
    }

    set_val(val) {
        this.node_val = val;
    }
}

function minimax(node, depth, alpha, beta, maximizingPlayer) {
    if (depth == 0 || node.is_terminal()) {
        return node.node_val;
    }

    if (maximizingPlayer) {
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

// Create all the nodes
let a_node = new Node();
let b_node = new Node();
let c_node = new Node();
let d_node = new Node();
let e_node = new Node();
let f_node = new Node();
let g_node = new Node();
let h_node = new Node();
let i_node = new Node();
let j_node = new Node();
let k_node = new Node();
let l_node = new Node();
let m_node = new Node();
let n_node = new Node();
let o_node = new Node();
let p_node = new Node();
let q_node = new Node();
let r_node = new Node();
let s_node = new Node();
let t_node = new Node(5);
let u_node = new Node(6);
let v_node = new Node(7);
let w_node = new Node(4);
let x_node = new Node(5);
let y_node = new Node(3);
let z_node = new Node(6);
let aa_node = new Node(6);
let ab_node = new Node(9);
let ac_node = new Node(7);
let ad_node = new Node(5);
let ae_node = new Node(9);
let af_node = new Node(8);
let ag_node = new Node(6);

// depth = 1
k_node.child = [t_node, u_node];
l_node.child = [v_node, w_node, x_node];
m_node.child = [y_node];
n_node.child = [z_node];
o_node.child = [aa_node, ab_node];
p_node.child = [ac_node];
q_node.child = [ad_node];
r_node.child = [ae_node, af_node];
s_node.child = [ag_node];

// depth = 2
e_node.child = [k_node, l_node];
f_node.child = [m_node];
g_node.child = [n_node, o_node];
h_node.child = [p_node];
i_node.child = [q_node];
j_node.child = [r_node, s_node];

// depth = 3
b_node.child = [e_node, f_node];
c_node.child = [g_node, h_node];
d_node.child = [i_node, j_node];

// depth = 4
a_node.child = [b_node, c_node, d_node];

// call minimax function
minimax(a_node, 10, -Infinity, Infinity, true);