#!/bin/bash
set -ex
echo "Pushing container image to registry.tko-aly.fi"
echo $DEPLOY_PASSWORD | docker login --username "$DEPLOY_USERNAME" --password-stdin https://registry.tko-aly.fi
docker build . -t events-microservice
docker tag events-microservice:latest registry.tko-aly.fi/events-microservice:latest
docker push registry.tko-aly.fi/events-microservice:latest
