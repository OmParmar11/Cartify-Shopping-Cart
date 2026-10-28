// Cartify's interactive features use basic JavaScript, arrays, functions and DOM events.
let cart = [];
let activeCategory = "All";

const productGrid = document.getElementById("product-grid");
const cartCount = document.getElementById("cart-count");
const drawerCount = document.getElementById("drawer-count");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartDrawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("overlay");
const toast = document.getElementById("toast");

function formatPrice(amount) {
    return "₹" + amount.toLocaleString("en-IN");
}

function showProducts() {
    productGrid.innerHTML = "";
    const visibleProducts = products.filter(function(product) {
        return activeCategory === "All" || product.category === activeCategory;
    });

    visibleProducts.forEach(function(product) {
        const card = document.createElement("article");
        card.className = "product-card";
        card.innerHTML = `
            <div class="product-image-wrap">
                <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy">
                <span class="product-label">${product.label}</span>
                <button class="add-button" data-id="${product.id}">ADD TO BAG +</button>
            </div>
            <div class="product-info">
                <div>
                    <h3>${product.name}</h3>
                    <p class="product-category">${product.category}</p>
                </div>
                <span class="product-price">${formatPrice(product.price)}</span>
            </div>`;
        productGrid.appendChild(card);
    });

    document.querySelectorAll(".add-button").forEach(function(button) {
        button.addEventListener("click", function() {
            addToCart(Number(button.dataset.id));
        });
    });
}

function addToCart(productId) {
    const product = products.find(function(item) {
        return item.id === productId;
    });
    const existingItem = cart.find(function(item) {
        return item.id === productId;
    });

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCart();
    showToast(product.name + " added to your bag");
}

function changeQuantity(productId, amount) {
    const item = cart.find(function(product) {
        return product.id === productId;
    });

    if (item) {
        item.quantity += amount;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCart();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(function(item) {
        return item.id !== productId;
    });
    updateCart();
}

function updateCart() {
    const totalItems = cart.reduce(function(total, item) {
        return total + item.quantity;
    }, 0);
    const totalPrice = cart.reduce(function(total, item) {
        return total + item.price * item.quantity;
    }, 0);

    cartCount.textContent = totalItems;
    drawerCount.textContent = "(" + totalItems + ")";
    cartTotal.textContent = formatPrice(totalPrice);

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your bag is waiting for something good.</p>';
        return;
    }

    cartItems.innerHTML = "";
    cart.forEach(function(item) {
        const row = document.createElement("div");
        row.className = "cart-item";
        row.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h3>${item.name}</h3>
                <p class="item-price">${formatPrice(item.price)} each</p>
                <div class="quantity-controls">
                    <button data-action="minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
                    <span>${item.quantity}</span>
                    <button data-action="plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
                </div>
                <br><button class="remove-button" data-action="remove" data-id="${item.id}">Remove</button>
            </div>
            <span class="item-total">${formatPrice(item.price * item.quantity)}</span>`;
        cartItems.appendChild(row);
    });

    cartItems.querySelectorAll("button").forEach(function(button) {
        button.addEventListener("click", function() {
            const id = Number(button.dataset.id);
            const action = button.dataset.action;
            if (action === "plus") changeQuantity(id, 1);
            if (action === "minus") changeQuantity(id, -1);
            if (action === "remove") removeFromCart(id);
        });
    });
}

function openCart() {
    cartDrawer.classList.add("open");
    overlay.classList.add("open");
}

function closeCart() {
    cartDrawer.classList.remove("open");
    overlay.classList.remove("open");
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    // A short timeout hides the message again.
    setTimeout(function() {
        toast.classList.remove("show");
    }, 1800);
}

document.getElementById("open-cart").addEventListener("click", openCart);
document.getElementById("close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

document.querySelectorAll(".filter").forEach(function(button) {
    button.addEventListener("click", function() {
        activeCategory = button.dataset.category;
        document.querySelectorAll(".filter").forEach(function(filter) {
            filter.classList.remove("active");
        });
        button.classList.add("active");
        showProducts();
    });
});

document.getElementById("checkout-button").addEventListener("click", function() {
    if (cart.length === 0) {
        showToast("Add something to your bag first");
        return;
    }
    showToast("Demo order placed — thank you!");
    cart = [];
    updateCart();
    closeCart();
});

// Ask the basic Java backend for a status message.
// If the Java server is not running, the store and cart still work.
fetch("http://localhost:8080/api/status")
    .then(function(response) { return response.json(); })
    .then(function(data) {
        console.log("Java backend connected:", data.message);
    })
    .catch(function() {
        console.log("Java backend is not running. Frontend demo still works.");
    });

showProducts();
updateCart();
