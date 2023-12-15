[![python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](https://github.com/pre-commit/pre-commit)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

# Game
Connect 4

# Stack
- backend: Python 3.12, FastAPI, MongoDB, ruff
- frontend: Next.js, TypeScript, Tailwind CSS

# Diagrams
![diagram](data/diagram.png)
![endpoints](data/endpoints.png)

# Demo
[demo](data/connect4_demo.mov)


# Development
## Backend
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

### To run
```
uvicorn src.main:app --reload
```
Open [http://localhost:8000](http://localhost:8000)

## Frontend
### Prerequisites
```
cp .env.example .env
```

### Run linters
```
npm run lint
```

### To run
```
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)
