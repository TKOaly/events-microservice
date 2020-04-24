#!/bin/bash
pip install awscli
export PATH=$PATH:$HOME/.local/bin
echo "Logging into AWS ECR..."
eval $(aws ecr get-login --region eu-west-1 --no-include-email)
echo "Pushing container image to AWS ECR"
docker build . -t events-service
docker tag events-service:latest $AWS_ECR_URL:latest
docker push $AWS_ECR_URL:latest

# Trigger ECS update
curl https://raw.githubusercontent.com/silinternational/ecs-deploy/master/ecs-deploy | tee ./ecs-deploy
chmod +x ./ecs-deploy
./ecs-deploy -t 600 -r eu-west-1 -c christina-regina -n event-service -i $AWS_ECR_URL:latest
