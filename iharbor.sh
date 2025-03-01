# Install harbor
helm repo add harbor https://helm.goharbor.io

helm dependency build ./kubernetes/harbor

helm install harbor -n harbor kubernetes/harbor --create-namespace
