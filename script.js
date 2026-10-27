// script.js - Cart functionality and interactivity

const products = [
    {
        id: 1,
        name: 'Wireless Headphones',
        price: 59.99,
        image: 'https://via.placeholder.com/120?text=Headphones'
    },
    {
        id: 2,
        name: 'Smart Watch',
        price: 89.99,
        image: 'https://via.placeholder.com/120?text=Watch'
    },
    {
        id: 3,
        name: 'Bluetooth Speaker',
        price: 39.99,
        image: 'https://via.placeholder.com/120?text=Speaker'
    },
    {
        id: 4,
        name: 'Fitness Tracker',
        price: 29.99,
        image: 'https://via.placeholder.com/120?text=Tracker'
    }
];

let cart = [];

function renderProducts(filterText = '') {
    const grid = document.getElementById('product-grid');
    if (!grid) {
        return;
    }

    const normalized = filterText.trim().toLowerCase();
    const filteredProducts = normalized
        ? products.filter(product => product.name.toLowerCase().includes(normalized))
        : products;

    grid.innerHTML = '';

    if (!filteredProducts.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        emptyState.textContent = 'No products match your search.';
        grid.appendChild(emptyState);
        return;
    }

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-img">
                <img src="${product.image}" alt="${product.name}" style="width:100%;height:100%;object-fit:contain;border-radius:0.8rem;" />
            </div>
            <div class="product-title">${product.name}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
        `;
        grid.appendChild(card);
    });
}

function getCartTotalQuantity() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = getCartTotalQuantity();
    }
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (!cartItems || !cartTotal) {
        return;
    }

    if (!cart.length) {
        cartItems.innerHTML = '<li class="cart-empty">Your cart is empty.</li>';
        cartTotal.textContent = '$0.00';
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartItems.innerHTML = cart
        .map(item => `
            <li class="cart-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            </li>
        `)
        .join('');
    cartTotal.textContent = `$${total.toFixed(2)}`;
}

function showNotification(message) {
    const notif = document.getElementById('notification');
    if (!notif) {
        return;
    }

    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => {
        notif.classList.remove('show');
    }, 1800);
}

function handleAddToCart(event) {
    const button = event.target.closest('.add-to-cart-btn');
    if (!button) {
        return;
    }

    const id = Number(button.getAttribute('data-id'));
    const product = products.find(item => item.id === id);
    if (!product) {
        return;
    }

    const existingItem = cart.find(item => item.id === id);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartBadge();
    renderCart();
    showNotification(`${product.name} added to cart!`);
}

function handleSearch(event) {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) {
        return;
    }

    const value = searchInput.value;
    renderProducts(value);
}

window.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    renderCart();
    updateCartBadge();

    const productGrid = document.getElementById('product-grid');
    if (productGrid) {
        productGrid.addEventListener('click', handleAddToCart);
    }

    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            document.getElementById('cart')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }
});
