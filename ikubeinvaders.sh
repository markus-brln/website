helm repo add kubeinvaders https://lucky-sideburn.github.io/helm-charts/ --force-update

helm dependency build ./kubernetes/kubeinvaders

helm upgrade --install kubeinvaders ./kubernetes/kubeinvaders \
  --namespace kubeinvaders \
  --create-namespace \
  --values ./kubernetes/kubeinvaders/values.yaml
