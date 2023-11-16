"use client";

import { useEffect, useState } from "react";

interface GameData {
    player1: string;
    player2: string;
    move_number: number;
    board: number[][];
    status: string;
    finished_at: string | null;
}

export default function Game({ params }: { params: { id: string } }) {
    const [data, setData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [highlightedColumn, setHighlightedColumn] = useState<number | null>(
        null,
    );
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket(
            `ws://127.0.0.1:8000/game/ws/game/${params.id}/`,
        );
        socket.addEventListener("open", () => {
            // get data only when
            fetch(`http://127.0.0.1:8000/game/${params.id}/`)
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
    if (!data) return <div className="text-black">no data</div>;

    const handleColumnHover = (colIndex: number) => {
        setHighlightedColumn(colIndex);
    };
    const handleColumnLeave = () => {
        setHighlightedColumn(null);
    };

    const handleCellClick = (i: number, j: number) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            const payload = {
                player: data.move_number % 2 ? data.player1 : data.player2,
                row: i,
                col: j,
            };
            ws.send(JSON.stringify(payload));
        }
    };

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
                    <p className="text-center">
                        {" "}
                        Game finished at: {new Date(data.finished_at).toLocaleString()}{" "}
                    </p>
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
                                                ${highlightedColumn === colIndex
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
