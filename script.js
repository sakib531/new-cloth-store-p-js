document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("product-description.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    if (!productId) {
      document.querySelector(".products-details").innerHTML = "<h2>Product not found</h2>";
    } else {
      fetch("products.json")
        .then(res => res.json())
        .then(products => {
          const product = products.find(p => p.id == productId);
          if (!product) {
            document.querySelector(".products-details").innerHTML = "<h2>Product not found</h2>";
            return;
          }

          // Populate product data
          document.querySelector(".sp1").src = product.img;
          document.querySelector(".sp1").alt = product.name;
          document.querySelector(".single-pro-details h1").innerText = `Home / ${product.category || "Product"}`;
          document.querySelector(".single-pro-details h2").innerText = product.name;
          document.querySelector(".single-pro-details h3").innerText = `$${product.price}`;
          document.querySelector(".single-pro-details span").innerText = product.description || "No description available.";
        })
        .catch(error => {
          console.error("Error loading product:", error);
          document.querySelector(".products-details").innerHTML = "<h2>Error loading product data</h2>";
        });
    }
  }
});

if (window.location.pathname.includes("product-description.html")) {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");

  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      products = data;

      // Load cart from localStorage
      if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"));
        updateCart();
      }

      const product = products.find(p => p.id == productId);
      if (product) {
        const addToCartBtn = document.getElementById("addToCartBtn");
        if (addToCartBtn) {
          addToCartBtn.addEventListener("click", () => {
            addToCart(product.id);
          });
        }
      }
    });
}




let products = [];
let cart = [];

const carousel = document.querySelector(".carousel") || null;
const wrapper = document.querySelector(".wrapper") || null;

if (carousel && wrapper) {
  initCarousel();
}

const listCartHTML = document.querySelector(".listCart");
const iconCart = document.querySelector(".icon-cart");
const iconCartSpan = document.querySelector(".icon-cart span");
const body = document.querySelector("body");
const cartTab = document.querySelector(".cartTab");
const header = document.getElementById("smart-header");
const closeCart = document.querySelector(".close");

// Fetch product data from JSON
if (document.querySelector(".carousel")) {
  // Only run carousel logic on homepage or where carousel exists
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      products = data;
      addDataToHTML();
      if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"));
        updateCart();
      }
      initCarousel();
    });
}

function addDataToHTML() {
  carousel.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("li");
    card.className = "card";
    card.setAttribute("data-id", product.id);
    card.setAttribute("data-href", `product-description.html?id=${product.id}`);

    card.innerHTML = `
      <div class="img">
        <img src="${product.img}" alt="${product.name}" draggable="false">
      </div>
      <h2>${product.name}</h2>
      <span>${product.title}</span>
      <button class="addCart">Add To Cart</button>
    `;

    // Add to cart button
    const addCartBtn = card.querySelector(".addCart");
    addCartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      addToCart(product.id);
    });

    carousel.appendChild(card);
  });

  setupCarouselClickHandler();
}

function setupCarouselClickHandler() {
  let isDragging = false;

  // Track drag state globally on the carousel
  carousel.addEventListener("mousedown", () => {
    isDragging = false;
    const onMouseMove = () => (isDragging = true);
    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  });

  // Handle card clicks (only if not dragging)
  const cards = carousel.querySelectorAll(".card");
  cards.forEach(card => {
    card.addEventListener("click", (e) => {
      if (!isDragging) {
        const href = card.getAttribute("data-href");
        if (href) window.location.href = href;
      }
    });
  });
}

function addToCart(product_id) {
  const index = cart.findIndex(p => p.product_id == product_id);
  if (index >= 0) cart[index].quantity++;
  else cart.push({ product_id, quantity: 1 });

  updateCart();
  localStorage.setItem("cart", JSON.stringify(cart));
}

function updateCart() {
  listCartHTML.innerHTML = "";
  let total = 0;
  cart.forEach(item => {
    const product = products.find(p => p.id == item.product_id);
    total += item.quantity;
    const div = document.createElement("div");
    div.className = "item";
    div.dataset.id = item.product_id;
    div.innerHTML = `
      <div class="image"><img src="${product.img}"></div>
      <div class="name">${product.name}</div>
      <div class="totalPrice">$${product.price * item.quantity}</div>
      <div class="quantity">
        <span class="minus">&lt;</span>
        <span class="product-quantity-num">${item.quantity}</span>
        <span class="plus">&gt;</span>
      </div>
      <div class="delete">🗑️</div>
    `;
    listCartHTML.appendChild(div);
  });
  iconCartSpan.innerText = total;
}

if (carousel) {
  carousel.addEventListener("click", e => {
    if (e.target.classList.contains("addCart")) {
      const id = e.target.closest(".card").dataset.id;
      addToCart(id);
    }
  });
}

listCartHTML.addEventListener("click", e => {
  const id = e.target.closest(".item")?.dataset.id;
  const item = cart.find(i => i.product_id == id);

  if (e.target.classList.contains("plus")) {
    item.quantity++;
  } else if (e.target.classList.contains("minus")) {
    item.quantity--;
    if (item.quantity <= 0) cart = cart.filter(i => i.product_id != id);
  } else if (e.target.classList.contains("delete")) {
    cart = cart.filter(i => i.product_id != id);
  }

  updateCart();
  localStorage.setItem("cart", JSON.stringify(cart));
});

// Cart open/close
iconCart.addEventListener("click", () => {
  body.classList.toggle("showCart");
});
closeCart.addEventListener("click", () => {
  body.classList.remove("showCart");
});

// HEADER SCROLL LOGIC
let lastScrollY = window.scrollY;
function updateHeaderVisibility() {
  const currentScrollY = window.scrollY;
  if (currentScrollY > lastScrollY) {
    header.style.transform = 'translateY(-100%)';
  } else {
    header.style.transform = 'translateY(0)';
  }
  lastScrollY = currentScrollY;
}
window.addEventListener('scroll', updateHeaderVisibility);

// REAL-TIME SYNC FOR CART POSITION
function syncCartWithHeader() {
  const headerHeight = header.offsetHeight;

  const update = () => {
    const transform = getComputedStyle(header).transform;
    let translateY = 0;

    if (transform && transform !== "none") {
      const match = transform.match(/matrix.*\((.+)\)/);
      if (match) {
        const values = match[1].split(', ');
        translateY = parseFloat(values[5]) || 0;
      }
    }

    const offset = headerHeight + translateY;
    cartTab.style.top = `${offset}px`;
    cartTab.style.height = `calc(100% - ${offset}px)`;

    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

window.addEventListener('load', () => {
  syncCartWithHeader();
});

// CAROUSEL
function initCarousel() {
  const wrapper = document.querySelector(".wrapper");
  const arrowBtns = document.querySelectorAll(".wrapper i");
  const firstCardWidth = carousel.querySelector(".card").offsetWidth;
  const carouselChildren = [...carousel.children];
  const cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

  carouselChildren.slice(-cardPerView).reverse().forEach(card => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
  });
  carouselChildren.slice(0, cardPerView).forEach(card => {
    carousel.insertAdjacentHTML("beforeend", card.outerHTML);
  });

  arrowBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      carousel.scrollLeft += btn.id === "left" ? -firstCardWidth : firstCardWidth;
    });
  });

  let isDragging = false, startX, startScrollLeft;
  let timeoutId;

  const dragStart = (e) => {
    isDragging = true;
    carousel.classList.add("dragging");
    startX = e.pageX;
    startScrollLeft = carousel.scrollLeft;
  };

  const dragging = (e) => {
    if (!isDragging) return;
    carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
  };

  const dragStop = () => {
    isDragging = false;
    carousel.classList.remove("dragging");
  };

  const autoPlay = () => {
    if (window.innerWidth < 800) return;
    timeoutId = setTimeout(() => {
      carousel.scrollLeft += firstCardWidth;
    }, 2500);
  };

  const infiniteScroll = () => {
    if (carousel.scrollLeft === 0) {
      carousel.classList.add("no-transition");
      carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
      carousel.classList.remove("no-transition");
    } else if (Math.ceil(carousel.scrollLeft) >= carousel.scrollWidth - carousel.offsetWidth) {
      carousel.classList.add("no-transition");
      carousel.scrollLeft = carousel.offsetWidth;
      carousel.classList.remove("no-transition");
    }
    clearTimeout(timeoutId);
    if (!wrapper.matches(":hover")) autoPlay();
  };

  carousel.addEventListener("mousedown", dragStart);
  carousel.addEventListener("mousemove", dragging);
  document.addEventListener("mouseup", dragStop);
  carousel.addEventListener("scroll", infiniteScroll);
  wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
  wrapper.addEventListener("mouseleave", autoPlay);
  autoPlay();
}

