# connect4
Connect4

## Development
### Prerequisites
```
cp .env.example .env
```

```
pre-commit install
pre-commit install --hook-type commit-msg
```

### Run linters
```
make lint
```

## To run
### Backend
```
uvicorn src.main:app --reload
```
