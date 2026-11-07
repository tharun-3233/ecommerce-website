# Paapu Masala

A responsive Paapu Masala storefront rooted in Kongu tradition. The product catalogue starts empty; add products with a price, rating, review, description, and optional photo URL using the form on the shop page.

Products and the shopping bag are saved in the current browser; the current product list is not shared with other visitors. To place an order, customers can submit their details into a prefilled WhatsApp message to Paapu Masala at +91 97504 33233. Customers must review and tap **Send** in WhatsApp; no payment is processed on the website. Use the theme button in the header to switch between light and dark mode.

## Run the storefront

The site has no build step or npm dependencies.

1. Open a terminal in this project folder.
2. Start a local static server:

   ```powershell
   python -m http.server 8000
   ```

3. Visit [http://localhost:8000](http://localhost:8000).

You can also open `index.html` directly, but a local server is recommended. Product photography and web fonts are served from the internet, so those need a connection.

## Publish with GitHub Pages

The repository includes a GitHub Actions workflow that publishes the site from the repository root whenever changes are pushed to `main`. It can also be started manually from the **Actions** tab with **Deploy static site to GitHub Pages**. There is no build step. Until the custom domain is configured and its DNS is live, the site is available at [https://tharun-3233.github.io/ecommerce-website/](https://tharun-3233.github.io/ecommerce-website/).

In the repository's **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. Run the workflow once and confirm it completes before proceeding with the custom domain.

## Configure `paapumasala.com`

The custom domain `paapumasala.com` is not active yet. Public DNS currently does not resolve it, so do not configure it in GitHub Pages until you have registered the domain and can edit its DNS records. Once it is registered, configure DNS at the registrar:

1. For the apex domain (`paapumasala.com`), create these four **A** records. Use `@` as the host/name (or leave it blank if the registrar uses that for the apex):

   | Type | Host/name | Value |
   | --- | --- | --- |
   | A | @ | 185.199.108.153 |
   | A | @ | 185.199.109.153 |
   | A | @ | 185.199.110.153 |
   | A | @ | 185.199.111.153 |

   Remove conflicting apex A/AAAA records. If IPv6 is supported and desired, GitHub Pages also publishes these **AAAA** addresses: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, and `2606:50c0:8003::153`.

2. Optionally, to support `www.paapumasala.com` too, add a **CNAME** record with host/name `www` and target `tharun-3233.github.io` (not a URL). The site uses the apex domain as canonical.
3. After DNS records resolve, add a `CNAME` file containing `paapumasala.com` in the published site root. In the repository, open **Settings → Pages → Custom domain**, enter `paapumasala.com`, and save. GitHub may ask you to verify domain ownership. If so, complete its verification process and add the exact TXT record GitHub provides at your registrar.
4. Wait for DNS to propagate and for GitHub Pages to make the domain available, then enable **Enforce HTTPS** in **Settings → Pages**.

Until your domain is registered, DNS is configured, and the custom domain is activated in GitHub Pages, the canonical/public address is [https://tharun-3233.github.io/ecommerce-website/](https://tharun-3233.github.io/ecommerce-website/). After switching domains, update the canonical URL, Open Graph URL, `robots.txt`, and `sitemap.xml` to match.

## Optional PostgreSQL schema

The SQL file creates starter storefront tables and spice categories. It does not populate the product catalogue or connect to the static website. Use it with a new, empty PostgreSQL database:

```powershell
createdb paapu_masala
psql -d paapu_masala -f sql.sql
```

The PostgreSQL schema is a separate starter resource and does not connect to the static storefront. Shared products, an owner login, and online order storage require a configured backend. There is no real payment processing.
