// script.js - Cart functionality and interactivity

// Sample product data (IDs, names, prices, image paths)
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        price: 59.99,
        image: "https://via.placeholder.com/120?text=Headphones"
    },
    {
        id: 2,
        name: "Smart Watch",
        price: 89.99,
        image: "https://via.placeholder.com/120?text=Watch"
    },
    {
        id: 3,
        name: "Bluetooth Speaker",
        price: 39.99,
        image: "https://via.placeholder.com/120?text=Speaker"
    },
    {
        id: 4,
        name: "Fitness Tracker",
        price: 29.99,
        image: "https://via.placeholder.com/120?text=Tracker"
    }
];

// Global cart array
let cart = [];

// Render product cards dynamically
function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    products.forEach(product => {
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

// Update cart badge count
function updateCartBadge() {
    const badge = document.getElementById('cart-badge');
    badge.textContent = cart.length;
}

// Show notification modal
function showNotification(message) {
    const notif = document.getElementById('notification');
    notif.textContent = message;
    notif.classList.add('show');
    setTimeout(() => {
        notif.classList.remove('show');
    }, 1800);
}

// Add to cart handler
function handleAddToCart(e) {
    if (e.target.classList.contains('add-to-cart-btn')) {
        const id = Number(e.target.getAttribute('data-id'));
        const product = products.find(p => p.id === id);
        if (product) {
            cart.push(product);
            updateCartBadge();
            showNotification(`${product.name} added to cart!`);
            console.log('Cart:', cart);
        }
    }
}

// Attach event listeners after DOM loads
window.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartBadge();
    // Delegate add-to-cart clicks
    document.getElementById('product-grid').addEventListener('click', handleAddToCart);
});
