interface Connect4ButtonProps {
    label: string;
    onClickHandler: () => void;
}

export function Connect4Button({ label, onClickHandler }: Connect4ButtonProps) {
    return (
        <button
            onClick={onClickHandler}
            className="w-full justify-center rounded-md bg-fuchsia-500 bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-fuchsia-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500"
        >
            {label}
        </button>
    );
}
