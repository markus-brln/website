# Website bauerlein.dev

This is the setup for my personal website. It is a simple static website hosted on a Kubernetes cluster in my home
network and is reachable when my PC runs the cluster.

## TransIP

- Buy domain at transip.nl
- TransIP domain management: https://www.transip.nl/cp/domein-hosting
  - See how to make an A record https://www.transip.nl/knowledgebase/dns/405-een-a-record-instellen
  - Create an A record pointing to router IP
    - Get my public IP:
      - http://mijnmodem.kpn/index.htm#
      - `Network Status` tab, then WAN IP
      - Alternative: https://www.whatismyip.com/ or http://wanip.info/
  - Check if DNS resolution works: https://dnschecker.org/#A/bauerlein.dev

## Local pre-requisites

- `helm`
- `microk8s` with `dns`, `ingress` and `registry` addons enabled (optionally `metrics-server`)

## Router configuration

See [screenshot](./images/Screenshot%20from%202024-12-14%2016-01-57.png) how to set up the port mapping for NAT
in the kpn router.

Since I have a `.dev` domain, I need to use HTTPS (https://www.registry.google/policies/registration/dev/). I use
cert-manager to get a certificate from Let's Encrypt. That means, in the NAT config of my router I need to forward port
443:

- Going to `192.168.2.254` (or `mijnmodem.kpn`) shows the router login page.
    - user: `admin`
    - password: See back of the router
- Go to `Network` -> `NAT` -> `Port Mapping` -> `Add Rule`
    - Set IP to `192.168.2.X` -> depending on which IP your machine got
    - Public and Private port: 443 & 80, Protocol: TCP (Port 80 is needed for the ACME challenge by Let's Encrypt)
    - Works a bit different on fritz box router in the UI

## Install cert-manager

```bash
./icertmanager.sh
```

## Install the website

```bash
./iwebsite.sh
```

## Uninstall the website

```bash
./uwebsite.sh
```

## Troubleshooting

Rate limiting on `Certificaterequest`s -> Just wait:

```bash
  Normal   OrderPending        42s                cert-manager-certificaterequests-issuer-acme        Waiting on certificate issuance from 
order super-cool-namespace/quickstart-example-tls-1-2742097806: ""                                                                         
  Warning  OrderFailed         41s                cert-manager-certificaterequests-issuer-acme        Failed to wait for order resource "qu
ickstart-example-tls-1-2742097806" to become ready: order is in "errored" state: Failed to create Order: 429 urn:ietf:params:acme:error:rat
eLimited: too many certificates (5) already issued for this exact set of domains in the last 168h0m0s, retry after 2024-12-16 02:50:38 UTC:
 see https://letsencrypt.org/docs/rate-limits/#new-certificates-per-exact-set-of-hostnames
```
