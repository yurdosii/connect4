interface PlayerNameInputProps {
    label: string;
    value: string;
    setValue: (value: string) => void;
}

export function PlayerNameInput({
    label,
    value,
    setValue,
}: PlayerNameInputProps) {
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
