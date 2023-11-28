"use client";

import {
    getPlayerNameFromLocalStorage,
    setPlayerNameInLocalStorage,
} from "@/utils/localStorageUtils";
import { useEffect, useState } from "react";

import { GameData } from "@/app/games/[id]/page";
import { PlayerNameInput } from "@/app/page";
import { useRouter } from "next/navigation";

export default function Game({ params }: { params: { token: string } }) {
    const router = useRouter();
    const [gameData, setGameData] = useState<GameData | null>(null);
    const [isLoading, setLoading] = useState(true);
    const [playerName, setPlayerName] = useState("");

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/games/join/${params.token}/`)
            .then((res) => res.json())
            .then((data) => {
                const savedPlayerName = getPlayerNameFromLocalStorage(data.id);
                if (data.player2 || savedPlayerName) {
                    router.push(`/games/${data.id}`);
                }
                setGameData(data);
                setLoading(false);
            });
    }, []);

    if (isLoading) return <div className="text-black">loading...</div>;

    function handleJoinGame() {
        const data = { player: playerName };
        fetch(`http://127.0.0.1:8000/games/join/${params.token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                setPlayerNameInLocalStorage(data.id, playerName);
                router.push(`/games/${data.id}`);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    return (
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    className="mx-auto h-10 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                    alt="Connect4"
                />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    {gameData?.player1} is challenging your skills in Connect 4 game.{" "}
                    <br />
                </h2>
                <p className="mt-2 text-center">
                    Please enter your name and click "Join" to start the battle.
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="space-y-6">
                    <PlayerNameInput
                        label="Your name"
                        value={playerName}
                        setValue={setPlayerName}
                    />

                    <div>
                        <button
                            onClick={handleJoinGame}
                            className="w-full justify-center rounded-md bg-fuchsia-500 bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-fuchsia-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500"
                        >
                            Join Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
