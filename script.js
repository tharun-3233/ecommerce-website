const products = [
    {
        id: 1,
        name: 'Wireless Headphones',
        category: 'Audio',
        description: 'Big, beautiful sound. All-day comfort.',
        price: 59.99,
        compareAt: 79.99,
        rating: 4.9,
        reviews: 128,
        badge: 'BESTSELLER',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=85'
    },
    {
        id: 2,
        name: 'Everyday Smartwatch',
        category: 'Wearables',
        description: 'A little more in tune with your day.',
        price: 89.99,
        compareAt: 119.99,
        rating: 4.8,
        reviews: 94,
        badge: 'CUSTOMER LOVE',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=85'
    },
    {
        id: 3,
        name: 'Pocket Bluetooth Speaker',
        category: 'Audio',
        description: 'Good tunes go wherever you do.',
        price: 39.99,
        compareAt: null,
        rating: 4.7,
        reviews: 76,
        badge: 'TAKE IT OUTSIDE',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=85'
    },
    {
        id: 4,
        name: 'Daily Fitness Tracker',
        category: 'Fitness',
        description: 'Gentle nudges for feeling your best.',
        price: 29.99,
        compareAt: 39.99,
        rating: 4.8,
        reviews: 112,
        badge: 'A GOOD HABIT',
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=85'
    },
    {
        id: 5,
        name: 'Studio Wireless Earbuds',
        category: 'Audio',
        description: 'Your own little pocket of quiet.',
        price: 49.99,
        compareAt: 64.99,
        rating: 4.6,
        reviews: 63,
        badge: 'ON THE GO',
        image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=800&q=85'
    },
    {
        id: 6,
        name: 'Minimal Watch',
        category: 'Wearables',
        description: 'A timeless little something for your wrist.',
        price: 74.99,
        compareAt: null,
        rating: 4.9,
        reviews: 51,
        badge: 'JUST RIGHT',
        image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=85'
    },
    {
        id: 7,
        name: 'Move More Smart Band',
        category: 'Fitness',
        description: 'Small steps, a little more often.',
        price: 34.99,
        compareAt: null,
        rating: 4.5,
        reviews: 42,
        badge: 'FEEL-GOOD FIND',
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=85'
    },
    {
        id: 8,
        name: 'Soundwave Mini Speaker',
        category: 'Audio',
        description: 'Room-filling sound in a lovely little package.',
        price: 44.99,
        compareAt: 54.99,
        rating: 4.7,
        reviews: 38,
        badge: 'SMALL BUT MIGHTY',
        image: 'https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=800&q=85'
    }
];

const CART_STORAGE_KEY = 'shopease-cart-v1';
const THEME_STORAGE_KEY = 'shopease-theme';
const FREE_SHIPPING_THRESHOLD = 75;
const SHIPPING_FEE = 6;
let activeCategory = 'all';
let searchQuery = '';
let sortOrder = 'featured';
let notificationTimeout;

function getStoredTheme() {
    try {
        return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch (error) {
        console.error('Unable to read the saved theme preference.', error);
        return 'light';
    }
}

function applyTheme(theme) {
    const isDark = theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    document.getElementById('theme-toggle').setAttribute('aria-pressed', String(isDark));
    document.getElementById('theme-toggle').setAttribute(
        'aria-label',
        `Switch to ${isDark ? 'light' : 'dark'} theme`
    );
    document.querySelector('.theme-toggle-label').textContent = isDark ? 'Light' : 'Dark';
    document.getElementById('theme-color').setAttribute('content', isDark ? '#171d19' : '#f7f8f5');
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    window.clearTimeout(notificationTimeout);
    notificationTimeout = window.setTimeout(() => {
        notification.classList.remove('show');
    }, 2600);
}

function loadCart() {
    try {
        const savedCart = localStorage.getItem(CART_STORAGE_KEY);
        if (!savedCart) {
            return [];
        }

        const parsedCart = JSON.parse(savedCart);
        if (!Array.isArray(parsedCart)) {
            throw new Error('Saved cart data is not a list.');
        }

        return parsedCart
            .filter(item => Number.isInteger(item.id) && Number.isInteger(item.quantity) && item.quantity > 0)
            .map(item => ({ id: item.id, quantity: item.quantity }))
            .filter(item => products.some(product => product.id === item.id));
    } catch (error) {
        console.error('Unable to load the saved cart.', error);
        return [];
    }
}

let cart = loadCart();

function saveCart() {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        return true;
    } catch (error) {
        console.error('Unable to save the cart in this browser.', error);
        showNotification('Your browser could not save the bag. It may not be available next time.');
        return false;
    }
}

function getCartQuantity() {
    return cart.reduce((total, item) => total + item.quantity, 0);
}

function getCartSubtotal() {
    return cart.reduce((total, item) => {
        const product = products.find(candidate => candidate.id === item.id);
        return product ? total + product.price * item.quantity : total;
    }, 0);
}

function formatPrice(price) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function getVisibleProducts() {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter(product => {
        const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
        const matchesSearch = !query || `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });

    if (sortOrder === 'price-low') {
        filtered.sort((first, second) => first.price - second.price);
    } else if (sortOrder === 'price-high') {
        filtered.sort((first, second) => second.price - first.price);
    } else if (sortOrder === 'name') {
        filtered.sort((first, second) => first.name.localeCompare(second.name));
    }

    return filtered;
}

function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const imageLink = document.createElement('div');
    imageLink.className = 'product-image-wrap';

    const image = document.createElement('img');
    image.className = 'product-image';
    image.src = product.image;
    image.alt = product.name;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.addEventListener('error', () => {
        image.classList.add('image-unavailable');
        image.alt = `${product.name} image unavailable`;
    }, { once: true });

    const badge = document.createElement('span');
    badge.className = 'product-badge';
    badge.textContent = product.badge;
    imageLink.append(image, badge);

    const details = document.createElement('div');
    details.className = 'product-details';

    const category = document.createElement('p');
    category.className = 'product-category';
    category.textContent = product.category;

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = product.name;

    const description = document.createElement('p');
    description.className = 'product-description';
    description.textContent = product.description;

    const rating = document.createElement('p');
    rating.className = 'product-rating';
    rating.innerHTML = `<span aria-label="${product.rating} out of 5 stars">★★★★★</span> <span class="rating-count">${product.rating} (${product.reviews})</span>`;

    const purchaseRow = document.createElement('div');
    purchaseRow.className = 'product-purchase-row';

    const priceBlock = document.createElement('div');
    priceBlock.className = 'price-block';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = formatPrice(product.price);
    priceBlock.append(price);

    if (product.compareAt) {
        const compareAt = document.createElement('span');
        compareAt.className = 'compare-price';
        compareAt.textContent = formatPrice(product.compareAt);
        priceBlock.append(compareAt);
    }

    const addButton = document.createElement('button');
    addButton.className = 'add-to-cart-btn';
    addButton.type = 'button';
    addButton.dataset.id = product.id;
    addButton.setAttribute('aria-label', `Add ${product.name} to bag`);
    addButton.innerHTML = '<span aria-hidden="true">+</span> Add';

    purchaseRow.append(priceBlock, addButton);
    details.append(category, name, description, rating, purchaseRow);
    card.append(imageLink, details);
    return card;
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    const visibleProducts = getVisibleProducts();
    const resultsCount = document.getElementById('results-count');

    grid.replaceChildren();
    resultsCount.textContent = `Showing ${visibleProducts.length} ${visibleProducts.length === 1 ? 'find' : 'finds'}`;

    if (!visibleProducts.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        const title = document.createElement('h3');
        title.textContent = 'Nothing in the shop just yet.';
        const message = document.createElement('p');
        message.textContent = 'Try a different search or browse everything we have.';
        const resetButton = document.createElement('button');
        resetButton.className = 'text-link reset-filters';
        resetButton.type = 'button';
        resetButton.textContent = 'See everything';
        resetButton.addEventListener('click', resetFilters);
        emptyState.append(title, message, resetButton);
        grid.append(emptyState);
        return;
    }

    visibleProducts.forEach(product => grid.append(createProductCard(product)));
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const subtotal = getCartSubtotal();
    const itemCount = getCartQuantity();
    const shipping = itemCount === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

    cartItems.replaceChildren();
    document.getElementById('cart-badge').textContent = itemCount;
    document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('cart-total').textContent = formatPrice(subtotal + shipping);
    document.getElementById('shipping-cost').textContent = itemCount === 0
        ? 'Calculated at checkout'
        : shipping === 0 ? 'Free' : formatPrice(shipping);
    document.getElementById('shipping-note').textContent = subtotal >= FREE_SHIPPING_THRESHOLD
        ? 'Your order ships free. Nice choice!'
        : `Add ${formatPrice(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal))} for free shipping.`;
    document.getElementById('clear-cart').hidden = itemCount === 0;
    document.getElementById('checkout-button').disabled = itemCount === 0;

    if (!cart.length) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'cart-empty';
        emptyItem.innerHTML = '<span class="empty-bag-icon" aria-hidden="true">♡</span><strong>Your bag is taking a little breather.</strong><span>Find something lovely to get it started.</span><a href="#products" class="text-link">Explore the collection <span aria-hidden="true">↗</span></a>';
        cartItems.append(emptyItem);
        return;
    }

    cart.forEach(item => {
        const product = products.find(candidate => candidate.id === item.id);
        if (!product) {
            return;
        }

        const row = document.createElement('li');
        row.className = 'cart-item';

        const image = document.createElement('img');
        image.className = 'cart-item-image';
        image.src = product.image;
        image.alt = '';

        const info = document.createElement('div');
        info.className = 'cart-item-info';
        const name = document.createElement('h3');
        name.textContent = product.name;
        const category = document.createElement('p');
        category.textContent = product.category;
        const quantity = document.createElement('div');
        quantity.className = 'quantity-control';

        const decrease = document.createElement('button');
        decrease.type = 'button';
        decrease.dataset.action = 'decrease';
        decrease.dataset.id = product.id;
        decrease.setAttribute('aria-label', `Remove one ${product.name}`);
        decrease.textContent = '−';

        const quantityValue = document.createElement('span');
        quantityValue.textContent = item.quantity;
        quantityValue.setAttribute('aria-label', `Quantity ${item.quantity}`);

        const increase = document.createElement('button');
        increase.type = 'button';
        increase.dataset.action = 'increase';
        increase.dataset.id = product.id;
        increase.setAttribute('aria-label', `Add one ${product.name}`);
        increase.textContent = '+';
        quantity.append(decrease, quantityValue, increase);
        info.append(name, category, quantity);

        const priceInfo = document.createElement('div');
        priceInfo.className = 'cart-item-price';
        const linePrice = document.createElement('strong');
        linePrice.textContent = formatPrice(product.price * item.quantity);
        const remove = document.createElement('button');
        remove.className = 'remove-item';
        remove.type = 'button';
        remove.dataset.action = 'remove';
        remove.dataset.id = product.id;
        remove.textContent = 'Remove';
        remove.setAttribute('aria-label', `Remove ${product.name} from bag`);
        priceInfo.append(linePrice, remove);

        row.append(image, info, priceInfo);
        cartItems.append(row);
    });
}

function updateCart(productId, action) {
    const existingItem = cart.find(item => item.id === productId);

    if (action === 'add' && existingItem) {
        existingItem.quantity += 1;
    } else if (action === 'add') {
        cart.push({ id: productId, quantity: 1 });
    } else if (action === 'increase' && existingItem) {
        existingItem.quantity += 1;
    } else if (action === 'decrease' && existingItem) {
        existingItem.quantity -= 1;
        if (existingItem.quantity === 0) {
            cart = cart.filter(item => item.id !== productId);
        }
    } else if (action === 'remove') {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    renderCart();
}

function resetFilters() {
    searchQuery = '';
    activeCategory = 'all';
    document.getElementById('search-input').value = '';
    document.querySelectorAll('.filter-chip').forEach(button => {
        const isSelected = button.dataset.category === 'all';
        button.classList.toggle('active', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
    });
    renderProducts();
}

function handleSearch(event) {
    event.preventDefault();
    searchQuery = document.getElementById('search-input').value.trim();
    renderProducts();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme(getStoredTheme());
    renderProducts();
    renderCart();

    document.getElementById('theme-toggle').addEventListener('click', () => {
        const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);

        try {
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        } catch (error) {
            console.error('Unable to save the theme preference.', error);
            showNotification('Your theme changed, but this browser could not save your preference.');
        }
    });

    document.getElementById('search-form').addEventListener('submit', handleSearch);
    document.getElementById('search-input').addEventListener('input', event => {
        searchQuery = event.target.value.trim();
        renderProducts();
    });

    document.querySelectorAll('.filter-chip').forEach(button => {
        button.addEventListener('click', () => {
            activeCategory = button.dataset.category;
            document.querySelectorAll('.filter-chip').forEach(chip => {
                const isSelected = chip === button;
                chip.classList.toggle('active', isSelected);
                chip.setAttribute('aria-pressed', String(isSelected));
            });
            renderProducts();
        });
    });

    document.getElementById('sort-select').addEventListener('change', event => {
        sortOrder = event.target.value;
        renderProducts();
    });

    document.getElementById('product-grid').addEventListener('click', event => {
        const button = event.target.closest('.add-to-cart-btn');
        if (!button) {
            return;
        }

        const productId = Number(button.dataset.id);
        const product = products.find(candidate => candidate.id === productId);
        if (!product) {
            return;
        }

        updateCart(productId, 'add');
        showNotification(`${product.name} added to your bag.`);
    });

    document.getElementById('cart-items').addEventListener('click', event => {
        const button = event.target.closest('[data-action]');
        if (button) {
            updateCart(Number(button.dataset.id), button.dataset.action);
        }
    });

    document.getElementById('clear-cart').addEventListener('click', () => {
        cart = [];
        saveCart();
        renderCart();
        showNotification('Your bag has been cleared.');
    });

    document.getElementById('cart-trigger').addEventListener('click', () => {
        document.getElementById('cart').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    document.getElementById('checkout-button').addEventListener('click', () => {
        showNotification('Checkout is a demo and is not connected to payment processing.');
    });
});
