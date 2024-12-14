# Website bauerlein.dev

metallb IP ranges:  192.168.2.1-192.168.2.10

## Infra

Install Helm: https://helm.sh/docs/intro/install/

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.1/cert-manager.crds.yaml
helm repo add jetstack https://charts.jetstack.io --force-update
helm install cert-manager --namespace cert-manager --version v1.16.1 jetstack/cert-manager --create-namespace
```

delete:

```bash
kubectl delete -f https://github.com/cert-manager/cert-manager/releases/download/v1.16.1/cert-manager.crds.yaml
helm uninstall cert-manager -n cert-manager
```

## Setup self-hosting

See [screenshot](./images/Screenshot%20from%202024-12-14%2016-01-57.png) how to set up the port mapping for NAT
in the kpn router.

Since I have a `.dev` domain, I need to use HTTPS (https://www.registry.google/policies/registration/dev/). I use
cert-manager to get a certificate from Let's Encrypt. That means, in the NAT config of my router I need to forward port
443:

- Going to `192.168.2.254` (or `mijnmodem.kpn`) shows the router login page.
    - user: `admin`
    - password: See back of the router
- Go to `Network` -> `NAT` -> `Port Mapping` -> `Add Rule`
    - Set IP to the Ingress IP
    - Public and Private port: 443, Protocol: TCP

Get my public IP:

- http://mijnmodem.kpn/index.htm#
- `Network Status` tab, then WAN IP
- Alternative: https://www.whatismyip.com/ or http://wanip.info/

### TransIP config

My TransIP domain: https://www.transip.nl/cp/domein-hosting

- See how to make an A record https://www.transip.nl/knowledgebase/dns/405-een-a-record-instellen
- Check DNS: https://dnschecker.org/#A/bauerlein.dev

