from collections.abc import Callable
from dataclasses import dataclass

from src.constants import TARGET, M, N


@dataclass
class Direction:
    name: str
    condition: Callable[[int, int], bool]
    function: Callable[[list[list[int]], int, int, int], int]


DIRECTIONS = [
    Direction(
        name="down",
        condition=lambda row, _: row < 3,
        function=lambda board, row, col, i: board[row + i][col],
    ),
    Direction(
        name="left",
        condition=lambda _, col: col >= 3,
        function=lambda board, row, col, i: board[row][col - i],
    ),
    Direction(
        name="right",
        condition=lambda _, col: col <= 3,
        function=lambda board, row, col, i: board[row][col + i],
    ),
    Direction(
        name="left down",
        condition=lambda row, col: row <= 2 and col >= 3,
        function=lambda board, row, col, i: board[row + i][col - i],
    ),
    Direction(
        name="right down",
        condition=lambda row, col: row <= 2 and col <= 3,
        function=lambda board, row, col, i: board[row + i][col + i],
    ),
]


def init_board() -> list[list[int]]:
    return [[0 for _ in range(M)] for _ in range(N)]


def is_valid_move(
    row: int | None, col: int | None, board: list[list[int]]
) -> bool:
    if row is None or col is None:
        return False
    if row < 0 or row >= N or col < 0 or col >= M:
        return False
    if board[row][col] != 0:
        return False
    return row == N - 1 or board[row + 1][col] != 0


def make_move(
    row: int, col: int, board: list[list[int]], player_sign: int
) -> None:
    board[row][col] = player_sign


def detect_winner(board: list[list[int]]) -> int | None:
    def check_directions(row: int, col: int) -> bool:
        value = board[row][col]

        for direction in DIRECTIONS:
            if direction.condition(row, col):
                for i in range(1, TARGET):
                    if direction.function(board, row, col, i) != value:
                        break
                else:
                    return True
        return False

    for i in range(N):
        for j in range(M):
            if board[i][j] != 0 and check_directions(i, j):
                return board[i][j]
    return None
