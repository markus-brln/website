# Frontend

## Run locally

```bash
cd frontend/app

npm install .
npm run dev
```

Access via http://localhost:5173/

## Build & push to microk8s registry

```bash
https://microk8s.io/docs/registry-images

docker build . -t my-app:1.0.0  # build and tag it (with SemVer!!!)
# make sure the appVersion in Chart.yaml is the same as the version number
docker tag my-app:1.0.0 localhost:32000/my-app:1.0.0

microk8s enable registry

docker push localhost:32000/my-app:1.0.0

```
