#!/bin/bash
export PYTHONPATH=$PWD
echo "PYTHONPATH set to: $PYTHONPATH"
uvicorn backend:app --host 0.0.0.0 --port $PORT