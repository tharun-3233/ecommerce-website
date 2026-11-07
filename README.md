# ShopEase

A responsive storefront demo with product photography, search, category filters, sorting, and a shopping bag that stays saved in the current browser.

Use the theme button in the header to switch between light and dark mode. Your choice is saved in this browser.

## Run the storefront

The site has no build step or npm dependencies.

1. Open a terminal in this project folder.
2. Start a local static server:

   ```powershell
   python -m http.server 8000
   ```

3. Visit [http://localhost:8000](http://localhost:8000).

You can also open `index.html` directly, but a local server is recommended. Product photography and web fonts are served from the internet, so those need a connection.

## Set up the PostgreSQL schema

The SQL file creates the storefront tables and inserts matching sample products, product photos, warehouses, and inventory. Use it with a new, empty PostgreSQL database:

```powershell
createdb shopease
psql -d shopease -f sql.sql
```

The database schema is a separate starter resource; the static storefront does not connect to PostgreSQL yet. The displayed catalog is in `script.js`, and the shopping bag is saved in browser `localStorage`. There is no account service, server API, live inventory sync, or real payment processing in this demo. The checkout button explains this rather than collecting payment details.
