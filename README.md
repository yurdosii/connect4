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
pre-commit install
pre-commit install --hook-type commit-msg
```

Local:
```
cp .env.example .env
```

Docker:
```
cp .env.example .env.docker
```

### Run linters
```
make lint
```

### To run
Local:
```
uvicorn src.main:app --reload
```
Open [http://localhost:8000](http://localhost:8000)

Docker:
```
docker-compose build
docker-compose up
```
Open [http://localhost:8001](http://localhost:8001)

### To deploy
```
docker buildx build --platform linux/amd64 -t yurdo/connect4-backend:1.0.0 .
docker login
docker push yurdo/connect4-backend:1.0.0
```

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
Local:
```
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

Docker:
```
docker build -t yurdo/connect4-frontend:1.0.0 .
docker run -p 3001:3000 yurdo/connect4-frontend:1.0.0
```
Open [http://localhost:3001](http://localhost:3001)


### To deploy
```
docker buildx build --platform linux/amd64 -t yurdo/connect4-frontend:1.0.0 .
docker login
docker push yurdo/connect4-frontend:1.0.0
```
