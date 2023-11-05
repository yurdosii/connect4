from collections import defaultdict
from typing import Any

from fastapi import WebSocket

from src.api.models import Game


class ConnectionManager:
    def __init__(self) -> None:
        self.games: dict[str, Any] = defaultdict(lambda: defaultdict(list))

    async def connect(self, websocket: WebSocket, game_id: str) -> None:
        await websocket.accept()
        self.games[game_id]["players"].append(websocket)

    async def broadcast_game(self, game_id: str, game: Game) -> None:
        json_data = game.model_dump_json()
        for connection in self.games[game_id]["players"]:
            await connection.send_json(json_data)

    def disconnect(self, websocket: WebSocket, game_id: str) -> None:
        players = self.games[game_id]["players"]  # safe due to defaultdict
        if websocket in players:
            players.remove(websocket)


connection_manager = ConnectionManager()
