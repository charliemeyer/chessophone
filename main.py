import chess.pgn
import json

pgn = open("game.txt")

game = chess.pgn.read_game(pgn)

board = game.board()

scale = ["C", "D", "E", "F", "G", "A", "B", "C"]

def play_board(b):
    for row in b:
        notes = []
        for i, note in enumerate(row.split(" ")):
            if note == ".":
                continue
            else:
                notes.append(scale[i])
        note_string = " ".join(notes)

moves = []
for move in game.mainline_moves():
    board_string = str(board)
    moves.append(board_string)
    board.push(move)

print(json.dumps(moves))

