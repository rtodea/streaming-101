# Cloudflare Configuration & k3s Migration Guide

## Current Setup (Development Mode)

Currently, the domain `tadeo.ro` is secured and routed using Cloudflare's proxy features. This allows a local development server (like NextJS or Docker running on port 5173) to be accessed publicly via HTTPS without installing local SSL certificates or a reverse proxy (like Nginx) that would conflict with our future k3s setup.

### How it works:
1.  **DNS Records:** The `A` and `AAAA` records for `tadeo.ro` point to the server's public IPs.
2.  **Proxy Status:** The proxy status is **Enabled (Orange Cloud)**. This means Cloudflare intercepts the traffic, providing a free SSL certificate to the end-user.
3.  **SSL/TLS Mode:** Set to **Flexible**. Traffic from the browser to Cloudflare is encrypted (HTTPS), but traffic from Cloudflare to our Ubuntu server is unencrypted (HTTP).
4.  **Origin Rules (Port Rewrite):** By default, Cloudflare only sends traffic to ports 80 or 443. We have an **Origin Rule** configured in Cloudflare (`Rules -> Origin Rules`) that matches the hostname `tadeo.ro` and rewrites the destination port to `5173`.
5.  **Local Application:** The local NextJS/Docker application is bound to `0.0.0.0` (all network interfaces), allowing it to accept the incoming HTTP traffic on port 5173 from Cloudflare.

---

## Migration to k3s (Production/Demo Mode)

When we are ready to deploy the full streaming platform using `k3s` (which uses Traefik as an Ingress controller on ports 80 and 443), we MUST change the Cloudflare configuration. If we do not, Cloudflare will continue routing traffic to port 5173, bypassing the k3s cluster entirely.

### Steps to migrate:

1.  **Disable the Origin Rule (Port Rewrite):**
    *   Log in to the Cloudflare Dashboard.
    *   Navigate to **Rules -> Origin Rules**.
    *   Find the rule rewriting the port to `5173` and **disable** or **delete** it. This will revert Cloudflare to sending traffic to standard ports (80/443).
2.  **Update SSL/TLS Mode to Full (Optional but Recommended):**
    *   Navigate to **SSL/TLS -> Overview**.
    *   Change the setting from **Flexible** to **Full**.
    *   *Why?* Traefik in k3s will automatically generate its own self-signed certificates or handle Let's Encrypt. "Full" mode ensures traffic between Cloudflare and your k3s cluster is also encrypted. (If you experience 522/523 errors during the demo, you can revert this to "Flexible" and rely on Traefik accepting HTTP on port 80).
3.  **Proxy Status (Orange vs Grey Cloud):**
    *   **Keep Orange (Proxied) for normal web traffic (NextJS/Viewer UI).**
    *   **WARNING FOR LIVE VIDEO/WEBSOCKETS:** If the video streams (HLS chunks) or live WebSockets experience high latency or buffering issues because of Cloudflare's caching/proxying, you may need to disable the proxy (change the cloud to **Grey / DNS Only**) in the DNS settings. If you do this, you *must* ensure Traefik inside k3s is configured to handle HTTPS via Let's Encrypt, as Cloudflare will no longer provide the SSL certificate.
4.  **Start k3s:**
    *   Run `sudo systemctl start k3s` on the server.
    *   Deploy your Kubernetes manifests (Deployments, Services, Ingress). The Traefik Ingress will automatically catch the traffic arriving on port 80/443 from Cloudflare and route it to your NextJS and NestJS pods.