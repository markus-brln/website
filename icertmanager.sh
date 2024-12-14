# Install cert-manager
helm repo add jetstack https://charts.jetstack.io --force-update

helm dependency build ./kubernetes/cert-manager

helm upgrade --install cert-manager ./kubernetes/cert-manager --namespace cert-manager --create-namespace
