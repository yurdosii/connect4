"use client";

import { setPlayerNameInLocalStorage } from "@/utils/localStorageUtils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
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
                <img
                    className="mx-auto h-10 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                    alt="Connect4"
                />
                <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-white">
                    Start New Game
                </h2>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="space-y-6">
                    <PlayerNameInput
                        label="Your name"
                        value={playerName}
                        setValue={setPlayerName}
                    />

                    <div>
                        <button
                            onClick={handleStartGame}
                            className="w-full justify-center rounded-md bg-fuchsia-500 bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-fuchsia-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500"
                        >
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface PlayerNameInputProps {
    label: string;
    value: string;
    setValue: (value: string) => void;
}

export function PlayerNameInput({label, value, setValue}: PlayerNameInputProps) {
    return (
        <div>
            <label
                htmlFor="playerName"
                className="block text-sm font-medium leading-6 text-white"
            >
                {label}
            </label>
            <div className="mt-2">
                <input
                    id="playerName"
                    name="playerName"
                    type="text"
                    required={true}
                    placeholder="Name"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="peer block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm sm:leading-6"
                />
            </div>
        </div>
    );
}
