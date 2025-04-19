from flask import Flask, request, jsonify
import chess.pgn
import io
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
scale = ["C", "D", "E", "F", "G", "A", "B", "C"]

def play_board(b):
    for row in b:
        notes = []
        for i, note in enumerate(row.split(" ")):
            if note != ".":
                notes.append(scale[i])
        note_string = " ".join(notes)
        # This function currently doesn't return anything

@app.route("/parse", methods=["POST"])
def parse():
    pgn_str = request.json.get("pgn")
    if not pgn_str:
        return jsonify({"error": "No PGN provided"}), 400

    game = chess.pgn.read_game(io.StringIO(pgn_str))
    board = game.board()
    moves = []

    for move in game.mainline_moves():
        board_string = str(board)
        moves.append(board_string)
        board.push(move)

    return jsonify({"boards": moves})
