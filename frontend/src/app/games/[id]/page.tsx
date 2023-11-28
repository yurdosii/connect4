"use client";

import { useEffect, useState } from "react";

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

export default function Game({ params }: { params: { id: string } }) {
    const [data, setData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [highlightedColumn, setHighlightedColumn] = useState<number | null>(
        null,
    );
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [replayInProgress, setReplayInProgress] = useState(false);

    const playerName = getPlayerNameFromLocalStorage(params.id);

    useEffect(() => {
        const socket = new WebSocket(
            `ws://127.0.0.1:8000/games/ws/games/${params.id}/`,
        );
        socket.addEventListener("open", () => {
            // get data only when
            fetch(`http://127.0.0.1:8000/games/${params.id}/`)
                .then((res) => res.json())
                .then((data) => {
                    setData(data);
                    setLoading(false);
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

    const handleReplayGame = () => {
        if (replayInProgress || !data || !data.moves) {
            return;
        }
        setReplayInProgress(true);

        // init empty 6x7 board
        const finalBoard = data.board;
        const N = 6;
        const M = 7;
        let newBoard = Array.from({ length: N }, () => Array(M).fill(0));

        // set empty
        setData({ ...data, board: newBoard });

        setTimeout(() => {
            data.moves.forEach((move: MoveData, i: number) => {
                setTimeout(() => {
                    setData((prevState: GameData | null) => {
                        if (!prevState) return prevState;

                        newBoard[move.row][move.col] = move.val;
                        if (i == data.moves.length - 1) {
                            setReplayInProgress(false);
                            return { ...prevState, board: finalBoard };
                        }
                        return { ...prevState, board: newBoard };
                    });
                }, i * 500);
            });
        }, 500);
    };

    if (!data.player2) return <WaitingPlayerToJoin token={data.token} />;

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Game:
                    <span className="text-red-500"> {data.player1}</span> vs
                    <span className="text-yellow-300"> {data.player2}</span>
                </h2>
                <p className="text-center"> Status: {data.status}</p>
                <p className="text-center"> Move #: {data.move_number} </p>
                {data.finished_at && (
                    <div>
                        <p className="text-center">
                            {" "}
                            Game finished at: {new Date(
                                data.finished_at,
                            ).toLocaleString()}{" "}
                        </p>
                        <button
                            onClick={handleReplayGame}
                            className="w-full justify-center rounded-md bg-fuchsia-500 bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-fuchsia-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500"
                        >
                            Replay game
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                To highlight: {highlightedColumn}
                <table className="mx-auto mt-4">
                    <tbody>
                        {data.board.map((row: number[], rowIndex: number) => (
                            <tr key={`row-${rowIndex}`}>
                                {row.map((cell: number, colIndex: number) => (
                                    <td
                                        key={`cell-${rowIndex}-${colIndex}`}
                                        onMouseEnter={() => handleColumnHover(colIndex)}
                                        onMouseLeave={handleColumnLeave}
                                    >
                                        <button
                                            className={`h-12 w-12 rounded-full border text-black transition duration-300
                                                ${cell === 1
                                                    ? "bg-red-500"
                                                    : cell === 2
                                                        ? "bg-yellow-400"
                                                        : cell == 3
                                                            ? "bg-green-500"
                                                            : ""
                                                }
                                                ${
                                                    !data.finished_at &&
                                                    data.next_player_to_move_username == playerName &&
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
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function WaitingPlayerToJoin({ token }: { token: string }) {
    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="text-center">Waiting for player to join</div>
            <div className="mt-2 text-center">
                Share this link with a friend to join: <br />
                http://127.0.0.1:3000/games/join/{token}
            </div>
        </div>
    );
}
