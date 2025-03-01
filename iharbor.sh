# Install harbor
helm repo add harbor https://helm.goharbor.io

helm dependency build ./kubernetes/harbor

helm upgrade --install harbor ./kubernetes/harbor \
  --namespace harbor \
  --create-namespace \
  --values ./kubernetes/harbor/values.yaml
