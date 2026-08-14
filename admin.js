// ===== 1. AUTH CHECK & API CONFIG =====
if (localStorage.getItem("adminLoggedIn") !== "true") {
  window.location.href = "login.html";
}

const API_URL = "/orders";
let globalOrders = []; // Local memory for fast modal lookup

// ===== 2. LOAD ORDERS (SERVER + LOCALSTORAGE) =====
async function loadOrders() {
  let apiOrders = [];
  
  // 1. Fetch from Server
  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      apiOrders = await res.json();
    }
  } catch (err) {
    console.warn("API load error, falling back to LocalStorage:", err);
  }

  // 2. Fetch from LocalStorage
  const localOrders = JSON.parse(localStorage.getItem('berry_orders') || '[]');

  // 3. Merge & Remove Duplicates
  const allOrdersMap = new Map();
  [...localOrders, ...apiOrders].forEach(item => {
    const id = item._id || item.id;
    if (id) allOrdersMap.set(id, { ...item, _id: id });
  });

  globalOrders = Array.from(allOrdersMap.values());
  displayOrders(globalOrders);
}

// ===== 3. DISPLAY ORDERS =====
function displayOrders(data) {
  const tbody = document.getElementById("orderTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  if (!data || data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;">No orders found.</td></tr>`;
    return;
  }

  data.forEach(order => {
    const orderId = order._id || order.id;

    tbody.innerHTML += `
      <tr>
        <td>${order.name || 'N/A'}</td>
        <td>${order.date || ''}</td>
        <td>${order.time || ''}</td>
        <td>Rs ${order.total || 0}</td>
        <td><span class="status ${order.status}">${order.status || 'Pending'}</span></td>
        <td>
          <button class="action-btn view-btn" onclick="viewDetails('${orderId}')">👁️</button>
          <button class="action-btn approve-btn" onclick="updateStatus('${orderId}','Approved')">✓</button>
          <button class="action-btn reject-btn" onclick="rejectOrder('${orderId}')">✕</button>
        </td>
      </tr>
    `;
  });
}

// ===== 4. UPDATE ORDER STATUS =====
async function updateStatus(id, newStatus) {
  // API Update
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus })
    });
  } catch (err) {
    console.warn("Server status update failed:", err);
  }

  // LocalStorage Sync
  let localOrders = JSON.parse(localStorage.getItem('berry_orders') || '[]');
  localOrders = localOrders.map(o => ((o._id || o.id) === id ? { ...o, status: newStatus } : o));
  localStorage.setItem('berry_orders', JSON.stringify(localOrders));

  loadOrders();
}

// ===== 5. REJECT / DELETE ORDER =====
let currentOrderId = null;

function rejectOrder(id) {
  currentOrderId = id;
  const modalEl = document.getElementById("rejectOrder");
  if (modalEl) {
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
  }
}

async function reject() {
  if (!currentOrderId) return;

  // API Delete
  try {
    await fetch(`${API_URL}/${currentOrderId}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Server delete failed:", err);
  }

  // LocalStorage Delete
  let localOrders = JSON.parse(localStorage.getItem('berry_orders') || '[]');
  localOrders = localOrders.filter(o => (o._id || o.id) !== currentOrderId);
  localStorage.setItem('berry_orders', JSON.stringify(localOrders));

  currentOrderId = null;
  
  // Close Modal
  const modalEl = document.getElementById("rejectOrder");
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  loadOrders();
}

// ===== 6. VIEW DETAILS =====
function viewDetails(id) {
  const order = globalOrders.find(o => (o._id || o.id) === id);
  if (!order) return;

  const itemsList = order.items && order.items.length 
    ? order.items.map(i => `<li>${i.name} (x${i.qty}) - Rs ${i.price}</li>`).join('') 
    : 'N/A';

  const modalContent = document.getElementById("modalContent");
  if (modalContent) {
    modalContent.innerHTML = `
      <p><strong>Name:</strong> ${order.name || 'N/A'}</p>
      <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
      <p><strong>Phone:</strong> ${order.phone || 'N/A'}</p>
      <p><strong>Address:</strong> ${order.address || 'N/A'}</p>
      <hr>
      <p><strong>Items Ordered:</strong></p>
      <ul>${itemsList}</ul>
      <p><strong>Total Amount:</strong> Rs ${order.total || 0}</p>
    `;
  }

  const detailsModal = document.getElementById("detailsModal");
  if (detailsModal) {
    new bootstrap.Modal(detailsModal).show();
  }
}

// ===== 7. SEARCH & LOGOUT =====
function searchData() {
  const q = document.getElementById("searchName")?.value.toLowerCase() || "";
  const filtered = globalOrders.filter(b => b.name && b.name.toLowerCase().includes(q));
  displayOrders(filtered);
}

function logout() {
  localStorage.removeItem("adminLoggedIn");
  window.location.href = "login.html";
}

// ===== INIT =====
window.onload = loadOrders;
