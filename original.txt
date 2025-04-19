import chess.pgn
from gensound import Sine

pgn = open("game.txt")

game = chess.pgn.read_game(pgn)

board = game.board()

scale = ["C", "D", "E", "F", "G", "A", "B", "C"]

def play_board(b):
    for row in b:
        print(row)
        notes = []
        for i, note in enumerate(row.split(" ")):
            if note == ".":
                continue
            else:
                print("appending", i)
                notes.append(scale[i])
        note_string = " ".join(notes)
        print(note_string)
        s = Sine(note_string, duration=0.1e3)
        s.play()

for move in game.mainline_moves():
    board_string = str(board)
    play_board(board_string.split("\n"))
    print(board_string)
    print("--------")
    board.push(move)

