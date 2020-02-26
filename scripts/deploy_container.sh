#!/bin/bash
set -ex
echo "Pushing container image to registry.tko-aly.fi"
docker login registry.tko-aly.fi --username $DEPLOY_USERNAME --password $DEPLOY_PASSWORD
docker build . -t events-microservice
docker tag eventbird-tg:latest registry.tko-aly.fi/events-microservice:latest
docker push registry.tko-aly.fi/events-microservice:latest