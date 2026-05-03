#!/bin/bash
# Устанавливаем PYTHONPATH, чтобы Python мог найти локальные модули
export PYTHONPATH=/opt/render/project/src
echo "PYTHONPATH set to: $PYTHONPATH"
echo "Starting uvicorn..."
# Запускаем uvicorn для backend.py
uvicorn backend:app --host 0.0.0.0 --port $PORT