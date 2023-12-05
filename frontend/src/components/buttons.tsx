interface Connect4ButtonProps {
    label: string;
    onClickHandler: () => void;
}

export function Connect4Button({ label, onClickHandler }: Connect4ButtonProps) {
    return (
        <button
            onClick={onClickHandler}
            className={`
                w-full rounded-md
                px-3 py-1.5
                text-sm font-semibold leading-6 text-white
                bg-cyan-600
                hover:bg-cyan-500
                shadow-sm
            `}
        >
            {label}
        </button>
    );
}
