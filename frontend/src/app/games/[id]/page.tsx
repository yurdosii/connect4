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
    move_number: number;
    board: number[][];
    moves: MoveData[];
    next_player_to_move_username: string;
    finished_at: string | null;
}

export default function PlayGame({ params }: { params: { id: string } }) {
    const [data, setData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [ws, setWs] = useState<WebSocket | null>(null);

    const playerName = getPlayerNameFromLocalStorage(params.id);

    useEffect(() => {
        const ws = new WebSocket(
            `${BACKEND_WS_BASE_URL}/games/ws/games/${params.id}/`,
        );
        ws.addEventListener("open", () => {
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
        ws.addEventListener("message", (event) => {
            const data = JSON.parse(JSON.parse(event.data));
            setData(data);
        });
        setWs(ws);

        // clean up WS connection when the component is unmounted
        return () => {
            ws.close();
        };
    }, []);

    if (isLoading) return <div className="text-black">loading...</div>;
    if (!data || !playerName) return <div className="text-black">no data</div>;
    if (!data.player2) return <WaitingPlayerToJoin id={params.id} />;

    return (
        <div className="flex flex-1 flex-col min-h-full px-6 py-12 lg:px-8 mx-96">
            <GameInfo gameData={data} setGameData={setData} playerName={playerName} />
            <GameBoard gameData={data} playerName={playerName} ws={ws} />
        </div>
    );
}

function WaitingPlayerToJoin({ id }: { id: string }) {
    const [isCopied, setIsCopied] = useState(false);

    const frontend_base_url =
        window.location.protocol + "//" + window.location.host;
    const link_to_share = `${frontend_base_url}/games/${id}/join/`;

    const handleLinkClick = () => {
        navigator.clipboard.writeText(link_to_share);
        setIsCopied(true);

        setTimeout(() => setIsCopied(false), 1000);
    };

    return (
        <div className="flex flex-1 flex-col justify-center min-h-full">
            <div
                className={`
                    mx-auto w-1/4 rounded-xl bg-gray-500
                    px-2 py-12 text-center text-white
                    shadow-lg shadow-gray-500/50
                `}
            >
                <p className="text-xl font-bold">Waiting for player to join</p>
                <div className="relative mt-4">
                    Share this link with a friend to join (click to copy): <br />
                    <span
                        className={`cursor-pointer text-white hover:underline`}
                        onClick={handleLinkClick}
                    >
                        {link_to_share}
                    </span>
                    <span
                        className={`
                            absolute left-1/2 transform -translate-x-1/2 top-14
                            rounded-md bg-gray-400 px-2 py-1
                            text-xs text-white
                            transition-opacity duration-500
                            ${isCopied ? "opacity-100" : "opacity-0"}
                        `}
                    >
                        Copied!
                    </span>
                </div>
            </div>
        </div>
    );
}

function GameInfo({
    gameData,
    setGameData,
    playerName,
}: {
    gameData: GameData | null;
    setGameData: Dispatch<SetStateAction<GameData | null>>;
    playerName: string;
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

    let gameStatus = "";
    let humanFinishedAt = null;
    if (gameData.finished_at) {
        humanFinishedAt = new Date(gameData.finished_at).toLocaleString();
        gameStatus = `Game finished at ${humanFinishedAt}`;
    } else if (gameData.next_player_to_move_username == playerName) {
        gameStatus = "It's your turn";
    } else {
        gameStatus = `It's ${gameData.next_player_to_move_username}'s turn`;
    }

    return (
        <div
            className={`
                w-2/5 p-5 mx-auto rounded-xl
                bg-gray-600 text-center text-white
                shadow-lg shadow-gray-600/50
            `}
        >
            <p className="text-2xl font-bold leading-9 tracking-tight">
                Connect4 BATTLE
            </p>
            <p className="text-xl font-bold leading-9 tracking-tight">
                Game:
                <span className="text-red-400"> {gameData.player1}</span> vs
                <span className="text-yellow-300"> {gameData.player2}</span>
            </p>
            <p className="text-center">{gameStatus}</p>
            {(!humanFinishedAt || replayInProgress) && (
                <p className="text-center"> Move #{gameData.move_number} </p>
            )}
            {humanFinishedAt && (
                <div className="mx-auto mt-2 w-1/2">
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
        <div
            className={`
                mx-auto mt-4 w-2/5 rounded-xl
                bg-gray-500 p-5 shadow-lg shadow-gray-500/50
            `}
        >
            <table className="mx-auto my-8">
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
                className={`h-20 w-20 rounded-full border-2 transition duration-200
                    ${cellValue === 1
                        ? "bg-red-400"
                        : cellValue === 2
                            ? "bg-yellow-300"
                            : cellValue == 3
                                ? "bg-green-400"
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
            ></button>
        </td>
    );
}
