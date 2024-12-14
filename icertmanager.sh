# Install cert-manager
helm repo add jetstack https://charts.jetstack.io --force-update

helm dependency build ./charts/cert-manager

helm upgrade --install cert-manager ./charts/cert-manager --namespace cert-manager --create-namespace
