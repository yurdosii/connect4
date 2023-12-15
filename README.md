[![python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![Ruff](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/astral-sh/ruff/main/assets/badge/v2.json)](https://github.com/astral-sh/ruff)
[![pre-commit](https://img.shields.io/badge/pre--commit-enabled-brightgreen?logo=pre-commit&logoColor=white)](https://github.com/pre-commit/pre-commit)

[![FastAPI](https://ziadoua.github.io/m3-Markdown-Badges/badges/FastAPI/fastapi1.svg)](https://fastapi.tiangolo.com/)
[![MongoDB](https://ziadoua.github.io/m3-Markdown-Badges/badges/MongoDB/mongodb1.svg)](https://www.mongodb.com/)
[![Next.js](https://ziadoua.github.io/m3-Markdown-Badges/badges/NextJS/nextjs1.svg)](https://nextjs.org/)
[![TypeScript](https://ziadoua.github.io/m3-Markdown-Badges/badges/TypeScript/typescript1.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://ziadoua.github.io/m3-Markdown-Badges/badges/TailwindCSS/tailwindcss1.svg)](https://tailwindcss.com/)
[![License: MIT](https://ziadoua.github.io/m3-Markdown-Badges/badges/LicenceMIT/licencemit1.svg)](https://opensource.org/licenses/MIT)

# Game
Connect 4

# Stack
- backend: Python 3.12, FastAPI, MongoDB, ruff
- frontend: Next.js, TypeScript, Tailwind CSS

# Diagrams
![diagram](data/diagram.png)
![endpoints](data/endpoints.png)

# Demo
https://github.com/yurdosii/connect4/assets/41447717/bfcf04df-f5f5-4453-8a4d-507f69f5eff2

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
