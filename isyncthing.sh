helm upgrade --install syncthing ./kubernetes/syncthing \
  --namespace syncthing \
  --create-namespace \
  --values ./kubernetes/syncthing/values.yaml
