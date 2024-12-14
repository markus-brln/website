helm upgrade --install website ./charts/website \
  --namespace super-cool-namespace \
  --create-namespace \
  --values ./charts/website/values.yaml
