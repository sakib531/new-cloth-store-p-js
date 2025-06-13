let products = [];
let cart = [];
const productsPerPage = 8;
let filteredData = [];
let currentPage = 1;
let searchQuery = '';
let selectedTag = null;

const carousel = document.querySelector(".carousel") || null;
const wrapper = document.querySelector(".wrapper") || null;
const listCartHTML = document.querySelector(".listCart");
const iconCart = document.querySelector(".icon-cart");
const iconCartSpan = document.querySelector(".icon-cart span");
const body = document.querySelector("body");
const cartTab = document.querySelector(".cartTab");
const header = document.getElementById("smart-header");
const closeCart = document.querySelector(".close");
const productPage = document.querySelector(".listProduct")
const filterBar = document.querySelector(".filter-bar");

// === PRODUCT DESCRIPTION PAGE LOGIC ===
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

      // Cart integration for product-description
      fetch("products.json")
        .then(res => res.json())
        .then(data => {
          products = data;

          // Load cart
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
  }
});


// Load JSON data
if (productPage) {
  fetch("products.json")
    .then(res => res.json())
    .then(data => {
      products = data;
      filteredData = [...products];
      setupTagButtons();
      applyFilters();

      if (localStorage.getItem("cart")) {
        cart = JSON.parse(localStorage.getItem("cart"));
        updateCart();
      }
    })
    .catch(err => console.error("Error loading products:", err));
}

// Show products per page (uses your card format)
function displayProducts(page) {
  const start = (page - 1) * productsPerPage;
  const end = start + productsPerPage;
  const currentProducts = filteredData.slice(start, end);

  productPage.innerHTML = "";
  currentProducts.forEach(product => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.setAttribute("data-href", `product-description.html?id=${product.id}`);

    productCard.innerHTML = `
      <div class="product-page-img">
        <img src="${product.img}" alt="${product.name}">
      </div>
      <div>
        <h2>${product.name}</h2>
        <span>${product.title}</span>
        <button class="addCart">Add To Cart</button>
      </div>
    `;

    productCard.querySelector(".addCart").addEventListener("click", e => {
      e.stopPropagation();
      addToCart(product.id);
    });

    productCard.addEventListener("click", () => {
      window.location.href = `product-description.html?id=${product.id}`;
    });

    productPage.appendChild(productCard);
  });
}

// Tag filter setup
function setupTagButtons() {
  const tagContainer = document.getElementById("tag-buttons");
  tagContainer.innerHTML = '';

  const allTags = new Set(products.flatMap(p => p.tags || []));
  const allBtn = document.createElement("button");
  allBtn.textContent = "All";
  allBtn.className = selectedTag === null ? 'active-tag' : '';
  allBtn.addEventListener("click", () => {
    selectedTag = null;
    applyFilters();
  });
  tagContainer.appendChild(allBtn);

  allTags.forEach(tag => {
    const btn = document.createElement("button");
    btn.textContent = tag;
    btn.className = selectedTag === tag ? 'active-tag' : '';
    btn.addEventListener("click", () => {
      selectedTag = tag;
      applyFilters();
    });
    tagContainer.appendChild(btn);
  });
}

// Apply search & tag filters
function applyFilters() {
  filteredData = products.filter(product => {
    const matchesTag = selectedTag ? product.tags?.includes(selectedTag) : true;
    const query = searchQuery.toLowerCase();
    const matchesSearch = searchQuery
      ? product.name.toLowerCase().includes(query) ||
        product.title.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      : true;
    return matchesTag && matchesSearch;
  });

  currentPage = 1;
  displayProducts(currentPage);
  setupPaginationControls();
  setupTagButtons(); // update active state
}

// Pagination setup
function setupPaginationControls() {
  const totalPages = Math.ceil(filteredData.length / productsPerPage);
  const controls = document.getElementById("pagination-controls");
  let html = '';

  if (currentPage > 1) html += `<a href="#" data-page="${currentPage - 1}">&lt;</a>`;

  if (currentPage > 3) {
    html += `<a href="#" data-page="1">1</a>`;
    if (currentPage > 4) html += `<span>...</span>`;
  }

  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
    html += `<a href="#" data-page="${i}" style="${i === currentPage ? 'font-weight: bold;' : ''}">${i}</a>`;
  }

  if (currentPage < totalPages - 2) {
    if (currentPage < totalPages - 3) html += `<span>...</span>`;
    html += `<a href="#" data-page="${totalPages}">${totalPages}</a>`;
  }

  if (currentPage < totalPages) html += `<a href="#" data-page="${currentPage + 1}">&gt;</a>`;

  controls.innerHTML = html;

  controls.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      currentPage = parseInt(e.target.dataset.page);
      displayProducts(currentPage);
      setupPaginationControls();
    });
  });
}

// Search input
document.getElementById("search-input").addEventListener("input", function () {
  searchQuery = this.value.toLowerCase();
  applyFilters();
});


// === CAROUSEL HOMEPAGE LOGIC ===
if (document.querySelector(".carousel")) {
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

// === CART TOGGLE ===
iconCart.addEventListener("click", () => {
  body.classList.toggle("showCart");
});
closeCart.addEventListener("click", () => {
  body.classList.remove("showCart");
});

// === HEADER SCROLL HIDE/SHOW ===
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

// === SYNC CART WITH HEADER POSITION ===
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

    filterBar.style.top = `${offset}px`;
    filterBar.style.height = `calc(100% - ${offset}px)`;

    requestAnimationFrame(update);
  };

  requestAnimationFrame(update);
}

window.addEventListener('load', () => {
  syncCartWithHeader();
});

// === CAROUSEL INIT FUNCTION ===
function initCarousel() {
  const wrapper = document.querySelector(".wrapper");
  const arrowBtns = document.querySelectorAll(".wrapper i");

  const firstCard = carousel.querySelector(".card");
  if (!firstCard) {
    console.warn("initCarousel: No .card found inside .carousel");
    return;
  }

  const firstCardWidth = firstCard.offsetWidth;
  const carouselChildren = [...carousel.children];
  const cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

  // Clone for infinite scroll
  carouselChildren.slice(-cardPerView).reverse().forEach(card => {
    carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
  });
  carouselChildren.slice(0, cardPerView).forEach(card => {
    carousel.insertAdjacentHTML("beforeend", card.outerHTML);
  });

  // Arrows
  arrowBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      carousel.scrollLeft += btn.id === "left" ? -firstCardWidth : firstCardWidth;
    });
  });

  // Drag scroll
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

  // Auto-scroll and infinite loop
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
