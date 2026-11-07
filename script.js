const PRODUCT_STORAGE_KEY = 'paapu-masala-products-v1';
const CART_STORAGE_KEY = 'paapu-masala-cart-v1';
const THEME_STORAGE_KEY = 'paapu-masala-theme';
const ORDERS_STORAGE_KEY = 'paapu-masala-orders-v1';
let products = loadProducts();
let searchQuery = '';
let notificationTimeout;

function loadProducts() {
    try {
        const savedProducts = localStorage.getItem(PRODUCT_STORAGE_KEY);
        if (!savedProducts) {
            return [];
        }

        const parsedProducts = JSON.parse(savedProducts);
        if (!Array.isArray(parsedProducts)) {
            throw new Error('Saved product data is not a list.');
        }

        return parsedProducts.filter(product =>
            Number.isInteger(product.id)
            && typeof product.name === 'string'
            && typeof product.category === 'string'
            && typeof product.description === 'string'
            && Number.isFinite(product.price)
            && product.price > 0
            && Number.isFinite(product.rating)
            && product.rating >= 1
            && product.rating <= 5
            && typeof product.review === 'string'
            && typeof product.image === 'string'
        );
    } catch (error) {
        console.error('Unable to load saved products.', error);
        return [];
    }
}

function saveProducts() {
    try {
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
        return true;
    } catch (error) {
        console.error('Unable to save products in this browser.', error);
        showNotification('Your browser could not save this product.');
        return false;
    }
}

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
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
}

function getVisibleProducts() {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter(product =>
        !query || `${product.name} ${product.category} ${product.description} ${product.review}`.toLowerCase().includes(query)
    );
    const sortOrder = document.getElementById('sort-select').value;

    if (sortOrder === 'price-low') {
        filtered.sort((first, second) => first.price - second.price);
    } else if (sortOrder === 'price-high') {
        filtered.sort((first, second) => second.price - first.price);
    } else {
        filtered.sort((first, second) => first.name.localeCompare(second.name));
    }

    return filtered;
}

function createProductCard(product) {
    const card = document.createElement('article');
    card.className = 'product-card';

    const imageWrap = document.createElement('div');
    imageWrap.className = 'product-image-wrap';
    if (product.image) {
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
        imageWrap.append(image);
    } else {
        const placeholder = document.createElement('span');
        placeholder.className = 'product-image-placeholder';
        placeholder.textContent = 'Paapu Masala';
        imageWrap.append(placeholder);
    }

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
    const stars = document.createElement('span');
    const roundedRating = Math.round(product.rating);
    stars.textContent = `${'★'.repeat(roundedRating)}${'☆'.repeat(5 - roundedRating)}`;
    stars.setAttribute('aria-label', `${product.rating} out of 5 stars`);
    const ratingText = document.createElement('span');
    ratingText.className = 'rating-count';
    ratingText.textContent = `${product.rating} / 5`;
    rating.append(stars, ratingText);

    const review = document.createElement('blockquote');
    review.className = 'product-review';
    review.textContent = `“${product.review}”`;

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
    addButton.textContent = 'Add to bag';

    const removeButton = document.createElement('button');
    removeButton.className = 'remove-product-btn';
    removeButton.type = 'button';
    removeButton.dataset.productId = product.id;
    removeButton.setAttribute('aria-label', `Remove ${product.name} from the catalogue`);
    removeButton.textContent = 'Remove product';

    purchaseRow.append(priceBlock, addButton);
    details.append(category, name, description, rating, review, purchaseRow, removeButton);
    card.append(imageWrap, details);
    return card;
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    const visibleProducts = getVisibleProducts();
    const resultsCount = document.getElementById('results-count');

    grid.replaceChildren();
    resultsCount.textContent = searchQuery
        ? `${visibleProducts.length} ${visibleProducts.length === 1 ? 'product' : 'products'} found`
        : `${visibleProducts.length} ${visibleProducts.length === 1 ? 'product' : 'products'}`;

    if (!visibleProducts.length) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        const title = document.createElement('h3');
        title.textContent = products.length ? 'No spices match that search.' : 'Your spice collection starts here.';
        const message = document.createElement('p');
        message.textContent = products.length
            ? 'Try another search, or clear the search field to see all products.'
            : 'There are no products yet. Add your first masala or spice to get started.';
        emptyState.append(title, message);
        if (products.length) {
            const clearSearch = document.createElement('button');
            clearSearch.className = 'text-link';
            clearSearch.type = 'button';
            clearSearch.textContent = 'Clear search';
            clearSearch.addEventListener('click', () => {
                document.getElementById('search-input').value = '';
                searchQuery = '';
                renderProducts();
            });
            emptyState.append(clearSearch);
        } else {
            const addFirstProduct = document.createElement('button');
            addFirstProduct.className = 'text-link';
            addFirstProduct.type = 'button';
            addFirstProduct.textContent = 'Add your first product';
            addFirstProduct.addEventListener('click', openProductForm);
            emptyState.append(addFirstProduct);
        }
        grid.append(emptyState);
        return;
    }

    visibleProducts.forEach(product => grid.append(createProductCard(product)));
}

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const subtotal = getCartSubtotal();
    const itemCount = getCartQuantity();

    cartItems.replaceChildren();
    document.getElementById('cart-badge').textContent = itemCount;
    document.getElementById('cart-subtotal').textContent = formatPrice(subtotal);
    document.getElementById('cart-total').textContent = formatPrice(subtotal);
    document.getElementById('shipping-cost').textContent = itemCount === 0 ? 'Confirmed after order' : 'To be confirmed';
    document.getElementById('shipping-note').textContent = 'Delivery details will be confirmed after you place your order.';
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
        image.src = product.image || 'assets/paapu-masala-logo.jpg';
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

function openProductForm() {
    const form = document.getElementById('product-form');
    form.hidden = false;
    form.querySelector('[name="name"]').focus();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeProductForm() {
    const form = document.getElementById('product-form');
    form.reset();
    form.hidden = true;
}

function addProduct(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const product = {
        id: Math.max(Date.now(), ...products.map(item => item.id + 1)),
        name: values.get('name').trim(),
        category: values.get('category').trim(),
        description: values.get('description').trim(),
        price: Number(values.get('price')),
        rating: Number(values.get('rating')),
        review: values.get('review').trim(),
        image: values.get('image').trim()
    };

    if (!product.name || !product.category || !product.description || !product.review
        || !Number.isFinite(product.price) || product.price <= 0
        || !Number.isFinite(product.rating) || product.rating < 1 || product.rating > 5) {
        showNotification('Please complete the product details with a valid price and rating.');
        return;
    }

    products.push(product);
    if (!saveProducts()) {
        products.pop();
        return;
    }

    closeProductForm();
    renderProducts();
    showNotification(`${product.name} added to your spice collection.`);
}

function removeProduct(productId) {
    const productIndex = products.findIndex(item => item.id === productId);
    if (productIndex === -1) {
        return;
    }

    const [product] = products.splice(productIndex, 1);
    if (!saveProducts()) {
        products.splice(productIndex, 0, product);
        renderProducts();
        return;
    }

    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderProducts();
    renderCart();
    showNotification(`${product.name} removed from the catalogue.`);
}

function saveOrder(order) {
    try {
        const savedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        const orders = savedOrders ? JSON.parse(savedOrders) : [];
        if (!Array.isArray(orders)) {
            throw new Error('Saved order data is not a list.');
        }
        orders.push(order);
        localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
        return true;
    } catch (error) {
        console.error('Unable to save the order in this browser.', error);
        showNotification('Your browser could not save the order. Please try again.');
        return false;
    }
}

function placeOrder(event) {
    event.preventDefault();
    if (!cart.length) {
        return;
    }

    const values = new FormData(event.currentTarget);
    const order = {
        orderNumber: `PM-${Date.now()}`,
        createdAt: new Date().toISOString(),
        customer: {
            name: values.get('customerName').trim(),
            phone: values.get('phone').trim(),
            address: values.get('address').trim()
        },
        items: cart.map(item => {
            const product = products.find(candidate => candidate.id === item.id);
            return {
                productId: item.id,
                name: product.name,
                quantity: item.quantity,
                unitPrice: product.price
            };
        }),
        total: getCartSubtotal()
    };

    if (!saveOrder(order)) {
        return;
    }

    cart = [];
    saveCart();
    renderCart();
    event.currentTarget.reset();
    document.getElementById('order-dialog').close();
    showNotification(`Order ${order.orderNumber} saved in this browser. Contact Paapu Masala to arrange delivery.`);
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

    document.getElementById('sort-select').addEventListener('change', renderProducts);
    document.getElementById('toggle-product-form').addEventListener('click', openProductForm);
    document.getElementById('cancel-product-form').addEventListener('click', closeProductForm);
    document.getElementById('product-form').addEventListener('submit', addProduct);

    document.getElementById('product-grid').addEventListener('click', event => {
        const button = event.target.closest('.add-to-cart-btn');
        const removeButton = event.target.closest('.remove-product-btn');
        if (removeButton) {
            removeProduct(Number(removeButton.dataset.productId));
            return;
        }
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
        document.getElementById('dialog-order-total').textContent = formatPrice(getCartSubtotal());
        document.getElementById('order-dialog').showModal();
    });

    document.getElementById('close-order-dialog').addEventListener('click', () => {
        document.getElementById('order-dialog').close();
    });
    document.getElementById('order-form').addEventListener('submit', placeOrder);
});
