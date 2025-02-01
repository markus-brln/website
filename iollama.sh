helm repo add ollama-helm https://otwld.github.io/ollama-helm/
helm repo update

helm dependency build ./kubernetes/ollama

helm upgrade --install ollama ./kubernetes/ollama \
  --namespace super-cool-namespace \
  --create-namespace \
  --values ./kubernetes/ollama/values.yaml
