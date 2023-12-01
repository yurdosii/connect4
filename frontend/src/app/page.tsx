"use client";

import { Connect4Button } from "@/components/buttons";
import { PlayerNameInput } from "@/components/input";
import { setPlayerNameInLocalStorage } from "@/utils/localStorageUtils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StartGame() {
    const router = useRouter();
    const [playerName, setPlayerName] = useState("");

    function handleStartGame() {
        const data = { player: playerName };
        fetch("http://127.0.0.1:8000/games/", {
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
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    New Game
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="space-y-6">
                    <PlayerNameInput
                        label="Your name"
                        value={playerName}
                        setValue={setPlayerName}
                    />
                    <Connect4Button label="Start Game" onClickHandler={handleStartGame} />
                </div>
            </div>
        </div>
    );
}
