#!/bin/bash
docker-compose up

git add ../updejty/*.json ../dane.json

# 3. Commit i Push
git commit -m "Automatyczna aktualizacja danych: $(date)"
git push origin main