"use client";

import { BACKEND_API_BASE_URL, BACKEND_WS_BASE_URL } from "@/constants";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import { Connect4Button } from "@/components/buttons";
import { getPlayerNameFromLocalStorage } from "@/utils/localStorageUtils";

interface MoveData {
    row: number;
    col: number;
    val: number;
}

export interface GameData {
    id: string;
    player1: string;
    player2: string | null;
    token: string;
    move_number: number;
    board: number[][];
    moves: MoveData[];
    status: string;
    next_player_to_move_username: string;
    finished_at: string | null;
}

export default function PlayGame({ params }: { params: { id: string } }) {
    const [data, setData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [ws, setWs] = useState<WebSocket | null>(null);

    const playerName = getPlayerNameFromLocalStorage(params.id);

    useEffect(() => {
        const socket = new WebSocket(
            `${BACKEND_WS_BASE_URL}/games/ws/games/${params.id}/`,
        );
        socket.addEventListener("open", () => {
            // get data only when
            fetch(`${BACKEND_API_BASE_URL}/games/${params.id}/`)
                .then((response) => {
                    if (!response.ok) throw new Error();
                    return response.json();
                })
                .then((data) => {
                    setData(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.log("Something went wrong", err);
                });
        });
        socket.addEventListener("message", (event) => {
            const data = JSON.parse(JSON.parse(event.data));
            setData(data);
        });
        setWs(socket);

        // clean up WS connection when the component is unmounted
        return () => {
            socket.close();
        };
    }, []);

    if (isLoading) return <div className="text-black">loading...</div>;
    if (!data || !playerName) return <div className="text-black">no data</div>;
    if (!data.player2) return <WaitingPlayerToJoin token={data.token} />;

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <GameInfo gameData={data} setGameData={setData} />
            <GameBoard gameData={data} playerName={playerName} ws={ws} />
        </div>
    );
}

function WaitingPlayerToJoin({ token }: { token: string }) {
    const frontend_base_url =
        window.location.protocol + "//" + window.location.host;

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="text-center">Waiting for player to join</div>
            <div className="mt-2 text-center">
                Share this link with a friend to join: <br />
                {frontend_base_url}/games/join/{token}
            </div>
        </div>
    );
}

function GameInfo({
    gameData,
    setGameData,
}: {
    gameData: GameData | null;
    setGameData: Dispatch<SetStateAction<GameData | null>>;
}) {
    if (!gameData) return;

    const [replayInProgress, setReplayInProgress] = useState(false);

    const handleReplayGame = () => {
        if (replayInProgress || !gameData || !gameData.moves) {
            return;
        }
        setReplayInProgress(true);

        // init empty 6x7 board
        const N = 6;
        const M = 7;
        let newBoard = Array.from({ length: N }, () => Array(M).fill(0));
        const finalBoard = gameData.board;

        // set empty
        setGameData({ ...gameData, board: newBoard, move_number: 0 });

        // logic of showing
        setTimeout(() => {
            gameData.moves.forEach((move: MoveData, i: number) => {
                setTimeout(() => {
                    setGameData((prevState: GameData | null) => {
                        if (!prevState) return prevState;

                        newBoard[move.row][move.col] = move.val;
                        if (i == gameData.moves.length - 1) {
                            setReplayInProgress(false);
                            return { ...prevState, board: finalBoard, move_number: i + 1 };
                        }
                        return { ...prevState, board: newBoard, move_number: i + 1 };
                    });
                }, i * 500);
            });
        }, 500);
    };

    let human_finished_at = null;
    if (gameData.finished_at) {
        human_finished_at = new Date(gameData.finished_at).toLocaleString();
    }

    return (
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                Game:
                <span className="text-red-500"> {gameData.player1}</span> vs
                <span className="text-yellow-300"> {gameData.player2}</span>
            </h2>
            <p className="text-center"> Status: {gameData.status}</p>
            {(!human_finished_at || replayInProgress) && (
                <p className="text-center"> Move #: {gameData.move_number} </p>
            )}
            {human_finished_at && (
                <div>
                    <p className="text-center"> Game finished at: {human_finished_at} </p>
                    <Connect4Button
                        label="Replay Game"
                        onClickHandler={handleReplayGame}
                    />
                </div>
            )}
        </div>
    );
}

function GameBoard({
    gameData,
    playerName,
    ws,
}: {
    gameData: GameData;
    playerName: string;
    ws: WebSocket | null;
}) {
    if (!gameData) return;

    const [highlightedColumn, setHighlightedColumn] = useState<number | null>(
        null,
    );

    const handleColumnHover = (colIndex: number) => {
        setHighlightedColumn(colIndex);
    };
    const handleColumnLeave = () => {
        setHighlightedColumn(null);
    };

    const handleCellClick = (i: number, j: number) => {
        if (playerName && ws && ws.readyState === WebSocket.OPEN) {
            const payload = {
                player: playerName,
                row: i,
                col: j,
            };
            ws.send(JSON.stringify(payload));
        }
    };

    return (
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            To highlight: {highlightedColumn}
            <table className="mx-auto mt-4">
                <tbody>
                    {gameData.board.map((row: number[], rowIndex: number) => (
                        <tr key={`row-${rowIndex}`}>
                            {row.map((cell: number, colIndex: number) => (
                                <GameBoardCell
                                    gameData={gameData}
                                    playerName={playerName}
                                    rowIndex={rowIndex}
                                    colIndex={colIndex}
                                    cellValue={cell}
                                    highlightedColumn={highlightedColumn}
                                    handleColumnHover={handleColumnHover}
                                    handleColumnLeave={handleColumnLeave}
                                    handleCellClick={handleCellClick}
                                />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function GameBoardCell({
    gameData,
    playerName,
    rowIndex,
    colIndex,
    cellValue,
    highlightedColumn,
    handleColumnHover,
    handleColumnLeave,
    handleCellClick,
}: {
    gameData: GameData;
    playerName: string;
    rowIndex: number;
    colIndex: number;
    cellValue: number;
    highlightedColumn: number | null;
    handleColumnHover: (colIndex: number) => void;
    handleColumnLeave: () => void;
    handleCellClick: (i: number, j: number) => void;
}) {
    return (
        <td
            key={`cell-${rowIndex}-${colIndex}`}
            onMouseEnter={() => handleColumnHover(colIndex)}
            onMouseLeave={handleColumnLeave}
        >
            <button
                className={`h-12 w-12 rounded-full border text-black transition duration-300
                    ${cellValue === 1
                        ? "bg-red-500"
                        : cellValue === 2
                            ? "bg-yellow-400"
                            : cellValue == 3
                                ? "bg-green-500"
                                : ""
                    }
                    ${!gameData.finished_at &&
                        gameData.next_player_to_move_username == playerName &&
                        highlightedColumn === colIndex
                        ? "bg-gray-300"
                        : ""
                    }
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
            >
                {rowIndex} {colIndex}
            </button>
        </td>
    );
}
