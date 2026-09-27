import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  Settings,
  RotateCcw,
  RotateCw,
  Star,
  Check,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Play,
  SkipForward,
} from 'lucide-react';

interface NonogramGateProps {
  onEnterWebsite: () => void;
}

// 0: empty, 1: filled (black), 2: marked cross (X)
type CellState = 0 | 1 | 2;

// The exact 5x5 puzzle solution from the image
const TARGET_SOLUTION: number[][] = [
  [0, 0, 1, 1, 1], // Row 0 (3) -> cols 2, 3, 4
  [0, 0, 0, 1, 1], // Row 1 (2) -> cols 3, 4
  [0, 0, 0, 1, 1], // Row 2 (2) -> cols 3, 4
  [0, 1, 0, 1, 1], // Row 3 (1 2) -> col 1, and cols 3, 4
  [1, 1, 1, 0, 0], // Row 4 (3) -> cols 0, 1, 2
];

const COL_CLUES: number[][] = [[1], [2], [1, 1], [4], [4]];
const ROW_CLUES: number[][] = [[3], [2], [2], [1, 2], [3]];

export const NonogramGate: React.FC<NonogramGateProps> = ({ onEnterWebsite }) => {
  // 5x5 grid state
  const [grid, setGrid] = useState<CellState[][]>([
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
  ]);

  // History stack for Undo / Redo
  const [history, setHistory] = useState<CellState[][][]>([]);
  const [redoStack, setRedoStack] = useState<CellState[][][]>([]);

  // Selected tool: 'fill' (black square) or 'cross' (red X)
  const [activeTool, setActiveTool] = useState<'fill' | 'cross'>('fill');

  // Timer states
  const [seconds, setSeconds] = useState(38);
  const [millis, setMillis] = useState(49);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isSolved, setIsSolved] = useState(false);
  const [submittedHallOfFame, setSubmittedHallOfFame] = useState(false);

  // Timer interval
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && !isSolved) {
      interval = setInterval(() => {
        setMillis((prev) => {
          if (prev >= 99) {
            setSeconds((s) => s + 1);
            return 0;
          }
          return prev + 1;
        });
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isSolved]);

  // Check if current grid matches solution
  const checkVictory = (currentGrid: CellState[][]) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const isTargetFilled = TARGET_SOLUTION[r][c] === 1;
        const isUserFilled = currentGrid[r][c] === 1;
        if (isTargetFilled !== isUserFilled) {
          return false;
        }
      }
    }
    return true;
  };

  // Cell Click Handler
  const handleCellClick = (r: number, c: number, rightClick = false) => {
    if (isSolved) return;

    // Save previous grid to history
    setHistory((prev) => [...prev, grid.map((row) => [...row])]);
    setRedoStack([]); // Clear redo on new action

    const newGrid = grid.map((row) => [...row]);
    const current = newGrid[r][c];

    if (rightClick) {
      // Right click toggles Cross (X)
      newGrid[r][c] = current === 2 ? 0 : 2;
    } else {
      if (activeTool === 'fill') {
        newGrid[r][c] = current === 1 ? 0 : 1;
      } else {
        newGrid[r][c] = current === 2 ? 0 : 2;
      }
    }

    setGrid(newGrid);

    if (checkVictory(newGrid)) {
      setIsSolved(true);
      setIsTimerRunning(false);
    }
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0 || isSolved) return;
    const previous = history[history.length - 1];
    setRedoStack((prev) => [...prev, grid.map((row) => [...row])]);
    setGrid(previous);
    setHistory((prev) => prev.slice(0, prev.length - 1));
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0 || isSolved) return;
    const next = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, grid.map((row) => [...row])]);
    setGrid(next);
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
  };

  // Auto-Solve (Match exact reference image)
  const handleAutoSolve = () => {
    const solvedGrid: CellState[][] = TARGET_SOLUTION.map((row) =>
      row.map((val) => (val === 1 ? 1 : 0))
    );
    setGrid(solvedGrid);
    setIsSolved(true);
    setIsTimerRunning(false);
    setSeconds(38);
    setMillis(49);
  };

  // Reset
  const handleReset = () => {
    setGrid([
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ]);
    setIsSolved(false);
    setIsTimerRunning(true);
    setSeconds(0);
    setMillis(0);
    setHistory([]);
    setRedoStack([]);
  };

  const formattedTime = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(
    seconds % 60
  ).padStart(2, '0')}`;
  const fullTimeDisplay = `${formattedTime}.${String(millis).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-3 sm:p-6 font-sans select-none">
      {/* Container matching image aspect & clean retro look */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-xl max-w-md w-full p-4 sm:p-6 flex flex-col items-center space-y-3.5">
        
        {/* Top Retro Nonograms Logo Banner */}
        <div className="flex flex-col items-center">
          <div className="border border-slate-400 bg-slate-50 px-4 py-1 rounded shadow-2xs">
            <span
              className="font-mono text-base sm:text-lg font-black tracking-[0.25em] text-slate-800 uppercase"
              style={{ fontFamily: 'monospace' }}
            >
              NONOGRAMS
            </span>
          </div>
        </div>

        {/* Victory Banner (Exact text from image) */}
        {isSolved ? (
          <div className="text-center space-y-2.5 animate-fade-in w-full">
            <p className="text-emerald-700 font-bold text-xs sm:text-sm tracking-tight">
              Congratulations! You have solved the puzzle in {fullTimeDisplay}
            </p>

            <button
              onClick={() => setSubmittedHallOfFame(true)}
              className="w-full py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 fill-slate-700 text-slate-700" />
              <span>
                {submittedHallOfFame
                  ? 'Score Submitted to Hall of Fame!'
                  : 'Submit your score to the Hall of Fame'}
              </span>
            </button>

            {/* Direct Proceed to Portal */}
            <button
              onClick={onEnterWebsite}
              className="w-full py-3 px-4 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold text-sm shadow-md shadow-teal-700/20 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>ENTER SWALAH PORTAL</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-[11px] text-slate-500 font-medium">
              Security Challenge: Complete the Nonogram to open the website
            </p>
          </div>
        )}

        {/* Controls Toolbar: Zoom, Settings, Timer, Undo, Redo */}
        <div className="flex items-center justify-between w-full max-w-[280px] px-2 text-slate-600">
          <button
            type="button"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
            title="Zoom"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Monospace blue timer */}
          <div className="font-mono text-blue-600 font-bold text-sm tracking-wider">
            {formattedTime}
          </div>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="p-1.5 rounded hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition"
            title="Redo"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Pill (Matching exact 5-item toolbar from image) */}
        <div className="flex items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-300 shadow-2xs">
          {/* Tool 1: Multi-cell icon */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 transition"
            title="Multi-select"
          >
            <div className="w-4 h-4 flex items-center justify-center text-[10px] font-mono border border-slate-400">
              ☷
            </div>
          </button>

          {/* Tool 2: Solid Black Square (Default Active) */}
          <button
            type="button"
            onClick={() => setActiveTool('fill')}
            className={`p-1.5 rounded-lg border transition ${
              activeTool === 'fill'
                ? 'bg-blue-100 border-blue-400 shadow-2xs'
                : 'bg-transparent border-transparent text-slate-600'
            }`}
            title="Fill Cell (Black)"
          >
            <div className="w-4 h-4 bg-black rounded-xs shadow-2xs" />
          </button>

          {/* Tool 3: Red X mark */}
          <button
            type="button"
            onClick={() => setActiveTool('cross')}
            className={`p-1.5 rounded-lg border transition ${
              activeTool === 'cross'
                ? 'bg-blue-100 border-blue-400 shadow-2xs'
                : 'bg-transparent border-transparent text-slate-600'
            }`}
            title="Mark Empty (Red X)"
          >
            <div className="w-4 h-4 flex items-center justify-center font-bold text-red-600 text-xs leading-none">
              ✕
            </div>
          </button>

          {/* Tool 4: Empty square */}
          <button
            type="button"
            onClick={() => setActiveTool('fill')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 transition"
            title="Empty Box"
          >
            <div className="w-4 h-4 border border-slate-500 rounded-xs bg-white" />
          </button>

          {/* Tool 5: Grid puzzle icon */}
          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 transition"
            title="Grid Options"
          >
            <div className="w-4 h-4 flex flex-wrap gap-0.5 p-0.5">
              <span className="w-1.5 h-1.5 bg-slate-800" />
              <span className="w-1.5 h-1.5 bg-slate-400" />
              <span className="w-1.5 h-1.5 bg-slate-400" />
              <span className="w-1.5 h-1.5 bg-slate-800" />
            </div>
          </button>
        </div>

        {/* The 5x5 Nonogram Puzzle Grid (Replicating exact borders & layout from image) */}
        <div className="bg-white p-2 border-2 border-slate-200 rounded-xl flex justify-center">
          <div className="inline-block border-[3px] border-black bg-white">
            {/* Top row: top-left blank area + column clues */}
            <div className="flex">
              {/* Blank corner above row clues */}
              <div className="w-16 sm:w-20 h-16 sm:h-20 border-r-2 border-b-2 border-black bg-white" />

              {/* 5 Column Clues */}
              <div className="grid grid-cols-5 border-b-2 border-black">
                {COL_CLUES.map((clueArr, cIdx) => (
                  <div
                    key={cIdx}
                    className="w-9 sm:w-11 h-16 sm:h-20 border-r border-slate-400 last:border-r-0 flex flex-col justify-end items-center pb-1 text-slate-900 font-bold text-sm sm:text-base font-sans"
                  >
                    {clueArr.map((clueNum, i) => (
                      <span key={i} className="leading-tight">
                        {clueNum}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows: Row Clues + Cells */}
            {grid.map((row, rIdx) => (
              <div key={rIdx} className="flex border-b border-slate-400 last:border-b-0">
                {/* Row Clue Header */}
                <div className="w-16 sm:w-20 h-9 sm:h-11 border-r-2 border-black flex items-center justify-end pr-2 text-slate-900 font-bold text-sm sm:text-base font-sans gap-1.5">
                  {ROW_CLUES[rIdx].map((clueNum, i) => (
                    <span key={i}>{clueNum}</span>
                  ))}
                </div>

                {/* 5 Cells in this row */}
                <div className="grid grid-cols-5">
                  {row.map((cellState, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        handleCellClick(rIdx, cIdx, true);
                      }}
                      className="w-9 sm:w-11 h-9 sm:h-11 border-r border-slate-400 last:border-r-0 flex items-center justify-center transition-colors cursor-pointer hover:bg-slate-50 focus:outline-none"
                    >
                      {cellState === 1 && (
                        <div className="w-full h-full bg-black flex items-center justify-center" />
                      )}
                      {cellState === 2 && (
                        <span className="text-red-600 font-bold text-base leading-none">
                          ✕
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Puzzle Quick Actions & Bypass */}
        <div className="flex items-center justify-between w-full pt-2 border-t border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoSolve}
              className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 underline cursor-pointer"
            >
              Auto-Solve
            </button>
            <span className="text-slate-300">•</span>
            <button
              onClick={handleReset}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 underline cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Direct Website Access Link */}
          <button
            onClick={onEnterWebsite}
            className="flex items-center gap-1 font-bold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition cursor-pointer"
          >
            <span>Skip / Enter Website</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
