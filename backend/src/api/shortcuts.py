import datetime
from typing import cast

from ..constants import M, N, PlayerEnum
from ..core import detect_winner, mark_winner
from .models import Game, Move


def make_move(game: Game, col: int) -> None:
    # make move
    row = game.get_move_row_by_col(col)
    game.board[row][col] = game.next_player_to_move_sign  # type: ignore[index]
    move = Move(row=cast(int, row), col=col, val=game.next_player_to_move_sign)
    game.moves.append(move)
    game.move_number += 1

    # handle winner
    winner = detect_winner(game.board)
    if winner:
        mark_winner(game.board, winner)
        game.winner = PlayerEnum(winner)
        game.finished_at = datetime.datetime.now()
    elif game.move_number == N * M:
        game.winner = None
        game.finished_at = datetime.datetime.now()
