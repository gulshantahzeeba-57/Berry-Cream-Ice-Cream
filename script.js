// const API_URL = "http://localhost:3000/orders";

const API_URL = "/bookings";

function openMenu(){
  document.getElementById("mobileMenu").classList.add("active");
}

function closeMenu(){
  document.getElementById("mobileMenu").classList.remove("active");
}

/* auto close on link click */
document.querySelectorAll("#mobileMenu a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("mobileMenu").classList.remove("active");
  });
});

// ===== PRODUCT DATA =====
const products = [
  {name:"Strawberry Bliss",price:650,img:"https://i.pinimg.com/1200x/d9/bd/97/d9bd9784cda0adc817f6ead90f84b5ff.jpg"},
  {name:"Chocolate Dream",price:700,img:"https://i.pinimg.com/736x/1a/7f/30/1a7f301a77551580495109372810d18a.jpg"},
  {name:"Vanilla Classic",price:600,img:"https://i.pinimg.com/1200x/fa/44/49/fa44493d2a5c4e54de43e04c4c1a7653.jpg"},
  {name:"Mango Magic",price:680,img:"https://i.pinimg.com/736x/2a/8c/de/2a8cdebaeaa95f5db1ce20142cbc034d.jpg"},
  {name:"Blueberry Swirl",price:720,img:"https://i.pinimg.com/1200x/b4/6b/64/b46b64011e92cd6961aa0c20e662f06d.jpg"},
  {name:"Caramel Crunch",price:750,img:"https://i.pinimg.com/1200x/e0/fb/dc/e0fbdc752ce4166faa942c41d0509130.jpg"},
  {name:"Pistachio Delight",price:770,img:"https://i.pinimg.com/1200x/b9/aa/e7/b9aae7fa15ef107190fe456139379728.jpg"},
  {name:"Cookies & Cream",price:730,img:"https://i.pinimg.com/736x/a1/9f/16/a19f16242ff2103f4caa69482dbc740b.jpg"},
  {name:"Mint Choco",price:690,img:"https://i.pinimg.com/1200x/e0/d1/84/e0d18421af52b0d36ae5ca37b28b84f7.jpg"},
  {name:"Berry Mix",price:710,img:"https://i.pinimg.com/1200x/8c/d7/25/8cd72580a946c7f0a9014b8883671a01.jpg"},
  {name:"Coffee Cream",price:740,img:"https://i.pinimg.com/736x/0d/87/b7/0d87b7503518acbce8cc2284f608b2d0.jpg"},
  {name:"Honey Almond",price:760,img:"https://i.pinimg.com/1200x/72/c8/8d/72c88de6ab0791a10a63720b8e5dd963.jpg"}
];

let cart = [];
let cartCount = 0;
let cartTotal = 0;

const box = document.getElementById("products");

// Render products
function renderProducts(){
  box.innerHTML = "";
  products.forEach((p,index)=>{
    box.innerHTML += `
      <div class="card">
        <img src="${p.img}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p>Rs ${p.price}</p>
        <button class="btn" onclick="addToCart(${index})">Buy Now</button>
      </div>
    `;
  });
}
// Add to cart
function addToCart(index){
  const product = products[index];
  const existing = cart.find(item => item.product.name === product.name);
  if(existing){ existing.qty++; } 
  else { cart.push({product: product, qty:1}); }

  cartCount++;
  cartTotal += product.price;
  
  updateCartDisplay();
}
  
   function increaseQty(index){
      cart[index].qty += 1;
      cartTotal += cart[index].product.price;
      updateCartDisplay();
  }

  function decreaseQty(index){
      if(cart[index].qty > 1){
          cart[index].qty -= 1;
          cartTotal -= cart[index].product.price;
      } else {
          cartTotal -= cart[index].product.price;
          cart.splice(index, 1);
      }
      updateCartDisplay();
  }

function updateCartDisplay(){
  document.getElementById("cart-count").innerText = cartCount;
  const itemsDiv = document.getElementById("cart-items");
  itemsDiv.innerHTML = "";
  let total = 0;

  cart.forEach((item, index)=>{
    itemsDiv.innerHTML += `
      <div class="cart-item">
        <p>${item.product.name}</p>
        <p>Rs ${item.product.price}</p>
        <div class="qty-control">
          <button class="qty-control-btn" onclick="decreaseQty(${index})">-</button>
          <span class="number">${item.qty}</span>
          <button class="qty-control-btn" onclick="increaseQty(${index})">+</button>
        </div>
      </div>
    `;
    total += item.product.price * item.qty;
  });

  document.getElementById("cart-modal-total").innerText = total;
  document.getElementById("cart-total").innerText = total;
  document.getElementById("checkout-btn").disabled = cart.length === 0;
}

// Cart modal
function openCartModal(){ document.getElementById("cart-modal").style.display="flex"; }
function closeCartModal(){ document.getElementById("cart-modal").style.display="none"; }

// Checkout button below products
document.getElementById("open-cart-btn").addEventListener("click", openCartModal);

// Order form modal
function openForm(){ 
  if(cart.length === 0) return;
  document.getElementById("order-form-modal").style.display="flex"; 
  closeCartModal();
}
function closeForm(){ document.getElementById("order-form-modal").style.display="none"; }
function closeConfirmation(){ document.getElementById("confirmation-modal").style.display="none"; }

// Submit order
document.getElementById("orderForm").addEventListener("submit", function(e){
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const address = document.getElementById("address").value;

  if(!name || !email || !phone || !address) return alert("Fill all fields!");

  const orderData = {
    name, email, phone, address,
    items: cart.map(c=>({name:c.product.name, price:c.product.price, qty:c.qty})),
    total: cartTotal,
    status: "Pending",
    date: new Date().toLocaleDateString(),
    time: new Date().toLocaleTimeString()
  };

  fetch(API_URL, {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify(orderData)
  })
  .then(res=>res.json())
  .then(data=>{
    console.log("Order saved:", data);
    document.getElementById("orderForm").reset();
    closeForm();
    document.getElementById("confirmation-modal").style.display="flex";
    cart = []; cartCount=0; cartTotal=0;
    updateCartDisplay();
  }).catch(err=>console.log(err));
});

window.onload = function(){
  renderProducts();
  updateCartDisplay();
};
