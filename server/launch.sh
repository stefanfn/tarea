#!/bin/bash

CONTAINER_NAME="$(basename $(pwd))"

PORT=42956 # H A Z L O

while (true); do
  docker run -it --rm \
    --name $CONTAINER_NAME \
    -v $(pwd)/tarea:/app \
    -p $PORT:$PORT \
    $CONTAINER_NAME ./start.sh
  echo "restarting docker container in 2 seconds"
  sleep 2
done

