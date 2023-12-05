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
                className="block text-sm font-medium leading-6 text-gray-500"
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
                    className={`
                        w-full rounded-md border-0
                        py-1.5
                        text-gray-500 placeholder:text-gray-300
                        shadow-sm ring-1 ring-inset ring-gray-200
                        focus:ring-2 focus:ring-inset focus:ring-gray-300
                        sm:text-sm sm:leading-6
                    `}
                />
            </div>
        </div>
    );
}
