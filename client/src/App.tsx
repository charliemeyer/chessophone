import { useRef, useState } from "react";
import * as Tone from "tone";
import "./App.css";

const initialPGN = `1. d4 g6 2. e4 Bg7 3. d5 d6 4. Bb5+ Nd7 5. Nf3 a6 6. Bxd7+ Bxd7 7. O-O Bb5 8.
Re1 Nf6 9. c3 O-O 10. Na3 Re8 11. Nd4 Bd7 12. Bg5 b5 13. Nc6 Bg4 14. Qd2 Qd7 15.
Bxf6 Bxf6 16. Nc2 e6 17. N2d4 exd5 18. exd5 Bxd4 19. Qxd4 Re2 20. h3 Bxh3 21.
Rxe2 Re8 22. Rxe8+ Qxe8 23. gxh3 f5 24. Kf1 g5 25. Re1 Qh5 26. Ne7+ Kf7 27. Kg2
f4 28. f3 Qh4 29. Qf2 Qh6 30. Re6 Qf8 31. Nc6 Qa8 32. Qd4 Qg8 33. Qf6# 1-0
`;

const getBoardFromPGN = async (pgn: string) => {
  return fetch("https://chessophone.fly.dev/parse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pgn }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((resJson) => {
      if (resJson.boards) {
        return resJson.boards;
      } else {
        throw new Error("No board in response");
      }
    })
    .catch((error) => {
      console.error("Error parsing PGN:", error);
      return "";
    });
};

const scale = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];

const synth = new Tone.Synth().toDestination();

const playBoard = (boardString: string, startOffset: number): number => {
  const rows = boardString.split("\n");
  let notesPlayed = 0;
  let rests = 0;
  rows.forEach((rowStr) => {
    const pieces = rowStr.split(" ");
    pieces.forEach((piece, i) => {
      if (piece === ".") {
        rests += 1;
      } else {
        synth.triggerAttackRelease(
          scale[i],
          "8n",
          Tone.now() + startOffset + notesPlayed * 0.08 + rests * 0.01
        );
        notesPlayed += 1;
      }
    });
  });
  return rests * 0.01 + notesPlayed * 0.08;
};

function App() {
  const [pgnString, setPgnString] = useState(initialPGN);
  const [loading, setLoading] = useState<"loading" | "loaded" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);

  return (
    <div className="p-4 flex flex-col items-center w-40 mx-auto">
      <h1 className="text-center text-2xl mb-2">Chessophone</h1>
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-sm text-slate-500">PGN String</h2>
          <textarea
            className="font-mono border border-slate-800 rounded-lg p-2 text-sm w-80 h-40"
            value={pgnString}
            onChange={(e) => setPgnString(e.currentTarget.value)}
            ref={textareaRef}
            onClick={() => textareaRef.current?.select()}
          ></textarea>
        </div>
        <button
          className="mt-1 place-self-center border border-slate-800 rounded-lg w-40 p-1 cursor-pointer hover:ring-indigo-500 hover:ring-1"
          onClick={async () => {
            setLoading("loading");
            await Tone.start();
            const boardStrings = await getBoardFromPGN(pgnString);
            setLoading("loaded");
            let timeOffset = 0;
            boardStrings.forEach((b: string) => {
              timeOffset += playBoard(b, timeOffset);
            });
            setTotalTime(timeOffset * 1000); // MS
            let t = 0;
            const timer = setInterval(() => {
              setTimeElapsed((t) => t + 10);
              t += 10;
              if (t > timeOffset * 1000) clearInterval(timer);
            }, 10);
          }}
          disabled={totalTime > 0 && timeElapsed < totalTime}
        >
          Play
        </button>
        {loading === "loading" && <span>Loading...</span>}
        {loading === "loaded" && (
          <div className="w-full rounded-full overflow-hidden border border-indigo-500 h-4">
            <div
              className="bg-indigo-500 h-4"
              style={{ width: `${(timeElapsed / totalTime) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
      <span className="text-sm text-gray-500 w-80 mt-4">
        Notes from the C major scale are added for each piece in each row of the
        board for each move in the game.<br></br>
        <br></br> Find PGN strings in the sharing menu of the chess app of your
        choice, Wikipedia, etc.
      </span>
      <a
        href="https://buymeacoffee.com/chessophone"
        target="_blank"
        className="place-self-start underline text-gray-500 text-sm mt-4"
      >
        Buy me a coffee
      </a>
    </div>
  );
}

export default App;
