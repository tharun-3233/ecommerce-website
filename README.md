# Paapu Masala

A responsive Paapu Masala storefront rooted in Kongu tradition. The product catalogue starts empty; add products with a price, rating, review, description, and optional photo URL using the form on the shop page.

Product details, the shopping bag, and order requests are saved in the current browser. Orders are not sent to a business or payment provider; the site needs a server and order-processing integration to receive orders across devices. Use the theme button in the header to switch between light and dark mode.

## Run the storefront

The site has no build step or npm dependencies.

1. Open a terminal in this project folder.
2. Start a local static server:

   ```powershell
   python -m http.server 8000
   ```

3. Visit [http://localhost:8000](http://localhost:8000).

You can also open `index.html` directly, but a local server is recommended. Product photography and web fonts are served from the internet, so those need a connection.

## Optional PostgreSQL schema

The SQL file creates starter storefront tables and spice categories. It does not populate the product catalogue or connect to the static website. Use it with a new, empty PostgreSQL database:

```powershell
createdb paapu_masala
psql -d paapu_masala -f sql.sql
```

The PostgreSQL schema is a separate starter resource. The static storefront has no account service, server API, shared inventory, or real payment processing.
