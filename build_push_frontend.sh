
#docker build -t localhost:32000/frontend:0.1.0 -f ./frontend/app/Dockerfile ./frontend/app
#
#docker push localhost:32000/frontend:0.1.0


docker build -t ghcr.io/markus-brln/website/frontend:0.1.0 -f ./frontend/app/Dockerfile ./frontend/app
docker push ghcr.io/markus-brln/website/frontend:0.1.0

