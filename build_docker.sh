#!/bin/bash

docker-compose build
docker-compose up -d
docker rmi -f $(docker images | grep '<none>' | awk '{print $3'})
