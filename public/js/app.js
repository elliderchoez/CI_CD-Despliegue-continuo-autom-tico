// Estado global de la aplicación frontend
let currentConfig = {
  hasToken: false,
  token: '',
  storeId: ''
};

let activeCheckout = null;
let cart = [];

// Elementos del DOM
const configAlert = document.getElementById('config-alert');
const transactionsLog = document.getElementById('transactions-log');
const checkoutSection = document.getElementById('checkout-section');
const cancelCheckoutBtn = document.getElementById('cancel-checkout');

// Elementos del Resumen de Compra
const summaryName = document.getElementById('summary-name');
const summarySubtotal = document.getElementById('summary-subtotal');
const summaryTax = document.getElementById('summary-tax');
const summaryTotal = document.getElementById('summary-total');

// Elementos del Modal
const jsonModal = document.getElementById('json-modal');
const jsonDisplay = document.getElementById('json-display');
const closeModalBtn = document.getElementById('close-modal-btn');

// --- 1. Inicialización y Carga de Configuración ---
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si venimos de un redireccionamiento de PayPhone en la página raíz
  const urlParams = new URLSearchParams(window.location.search);
  const transactionId = urlParams.get('id');
  const clientTxId = urlParams.get('clientTransactionId') || urlParams.get('clientTxId');

  if (transactionId && clientTxId) {
    // Redirigir a la pantalla de resultados de pago con los parámetros de la transacción
    window.location.href = `/payment-result.html${window.location.search}`;
    return;
  }

  loadConfig();
  loadCart();
  loadTransactions();
  setupEventListeners();
});

// Cargar credenciales del servidor
async function loadConfig() {
  try {
    const response = await fetch('/api/config');
    const data = await response.json();
    
    currentConfig.hasToken = data.hasToken;
    currentConfig.token = data.token;
    currentConfig.storeId = data.storeId;

    if (!data.hasToken || !data.storeId) {
      if (configAlert) configAlert.style.display = 'flex';
    } else {
      if (configAlert) configAlert.style.display = 'none';
    }
  } catch (error) {
    console.error('Error al cargar la configuración:', error);
  }
}

// Cargar historial de transacciones
async function loadTransactions() {
  try {
    const response = await fetch('/api/transactions');
    const transactions = await response.json();
    renderTransactions(transactions);
  } catch (error) {
    console.error('Error al cargar las transacciones:', error);
  }
}

// Configurar listeners generales
function setupEventListeners() {
  // Escuchar botones de agregar al carrito
  document.querySelectorAll('.buy-btn').forEach(btn => {
    btn.addEventListener('click', handleAddToCartClick);
  });

  // Escuchar botones de vaciar y pagar el carrito
  const clearCartBtn = document.getElementById('clear-cart-btn');
  const payCartBtn = document.getElementById('pay-cart-btn');
  
  if (clearCartBtn) clearCartBtn.addEventListener('click', clearCart);
  if (payCartBtn) payCartBtn.addEventListener('click', initiateCheckout);

  // Cancelar checkout
  cancelCheckoutBtn.addEventListener('click', () => {
    checkoutSection.style.display = 'none';
    activeCheckout = null;
  });

  // Controladores del Modal
  closeModalBtn.addEventListener('click', () => {
    jsonModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === jsonModal) {
      jsonModal.style.display = 'none';
    }
  });
}

// --- 2. Gestión del Carrito de Compras ---

function loadCart() {
  try {
    const storedCart = localStorage.getItem('payphone_cart');
    if (storedCart) {
      cart = JSON.parse(storedCart);
    }
  } catch (error) {
    console.error('Error al cargar el carrito:', error);
  }
  renderCart();
}

function saveCart() {
  try {
    localStorage.setItem('payphone_cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error al guardar el carrito:', error);
  }
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  // Si el checkout estaba activo para el carrito, cerrarlo
  checkoutSection.style.display = 'none';
  activeCheckout = null;
}

function handleAddToCartClick(e) {
  const btn = e.currentTarget;
  const id = btn.getAttribute('data-id');
  const name = btn.getAttribute('data-name');
  const price = parseFloat(btn.getAttribute('data-price'));
  const taxable = btn.getAttribute('data-taxable') === 'true';

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id, name, price, taxable, quantity: 1 });
  }

  saveCart();
  renderCart();

  // Animación del botón al agregar
  const originalText = btn.textContent;
  btn.textContent = '¡Agregado! ✓';
  btn.style.background = 'linear-gradient(135deg, var(--success) 0%, #065f46 100%)';
  btn.disabled = true;

  setTimeout(() => {
    btn.textContent = originalText;
    btn.style.background = '';
    btn.disabled = false;
  }, 1000);
}

function renderCart() {
  const container = document.getElementById('cart-items-container');
  const summarySection = document.getElementById('cart-summary-section');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); font-size: 0.9rem; text-align: center; padding: 2rem 0;">
        Tu carrito está vacío.
      </p>
    `;
    if (summarySection) summarySection.style.display = 'none';
    return;
  }

  container.innerHTML = '';
  
  // Variables de cálculo financiero
  let rawTaxableTotal = 0;
  let rawNonTaxableTotal = 0;

  cart.forEach(item => {
    const itemTotalCents = Math.round(item.price * 100) * item.quantity;
    if (item.taxable) {
      rawTaxableTotal += itemTotalCents;
    } else {
      rawNonTaxableTotal += itemTotalCents;
    }

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price-qty">$${item.price.toFixed(2)} x ${item.quantity}</div>
      </div>
      <div class="cart-item-controls">
        <button class="cart-qty-btn decrease-btn" data-id="${item.id}">-</button>
        <span class="cart-item-qty">${item.quantity}</span>
        <button class="cart-qty-btn increase-btn" data-id="${item.id}">+</button>
        <button class="cart-remove-btn remove-btn" data-id="${item.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    // Asignar eventos de cantidad
    itemDiv.querySelector('.decrease-btn').addEventListener('click', () => {
      adjustQuantity(item.id, -1);
    });
    itemDiv.querySelector('.increase-btn').addEventListener('click', () => {
      adjustQuantity(item.id, 1);
    });
    itemDiv.querySelector('.remove-btn').addEventListener('click', () => {
      adjustQuantity(item.id, -item.quantity);
    });

    container.appendChild(itemDiv);
  });

  // Cálculo en centavos
  const amountWithTax = Math.round(rawTaxableTotal / 1.15); // Base imponible gravada
  const taxValue = rawTaxableTotal - amountWithTax;         // IVA (15%)
  const amountWithoutTax = rawNonTaxableTotal;              // Base exenta
  const amount = amountWithTax + amountWithoutTax + taxValue; // Total general en centavos

  // Actualizar DOM del resumen
  document.getElementById('cart-subtotal-taxable').textContent = `$${(amountWithTax / 100).toFixed(2)}`;
  document.getElementById('cart-subtotal-nontaxable').textContent = `$${(amountWithoutTax / 100).toFixed(2)}`;
  document.getElementById('cart-tax').textContent = `$${(taxValue / 100).toFixed(2)}`;
  document.getElementById('cart-total').textContent = `$${(amount / 100).toFixed(2)}`;

  if (summarySection) summarySection.style.display = 'block';
}

function adjustQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  renderCart();

  // Si el checkout estaba abierto, y cambiamos el carrito, refrescar o cerrar el checkout
  if (activeCheckout) {
    if (cart.length === 0) {
      checkoutSection.style.display = 'none';
      activeCheckout = null;
    } else {
      // Re-inicializar checkout para actualizar montos en PayPhone
      initiateCheckout();
    }
  }
}

// --- 3. Flujo del Checkout de Compra con PayPhone ---

function initiateCheckout() {
  // Validar si la configuración está lista
  if (!currentConfig.token || !currentConfig.storeId) {
    alert('La pasarela de pago no está configurada correctamente en el servidor. Por favor, configure el archivo config.json.');
    return;
  }

  if (cart.length === 0) return;

  // Mostrar sección de checkout y hacer scroll
  checkoutSection.style.display = 'block';
  checkoutSection.scrollIntoView({ behavior: 'smooth' });

  // 1. Generar ID único para la transacción del cliente
  const clientTxId = 'TX-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now();

  // 2. Cálculos financieros en centavos a nivel global del carrito
  let rawTaxableTotal = 0;
  let rawNonTaxableTotal = 0;

  cart.forEach(item => {
    const itemTotalCents = Math.round(item.price * 100) * item.quantity;
    if (item.taxable) {
      rawTaxableTotal += itemTotalCents;
    } else {
      rawNonTaxableTotal += itemTotalCents;
    }
  });

  const amountWithTax = Math.round(rawTaxableTotal / 1.15); // Base imponible gravada
  const taxValue = rawTaxableTotal - amountWithTax;         // IVA (15%)
  const amountWithoutTax = rawNonTaxableTotal;              // Base exenta
  const amount = amountWithTax + amountWithoutTax + taxValue; // Total general en centavos

  // 3. Mostrar resumen en la UI de Checkout
  const itemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  summaryName.textContent = `Carrito (${itemsCount} prod.)`;
  summarySubtotal.textContent = `$${((amountWithTax + amountWithoutTax) / 100).toFixed(2)}`;
  summaryTax.textContent = `$${(taxValue / 100).toFixed(2)}`;
  summaryTotal.textContent = `$${(amount / 100).toFixed(2)}`;

  // 4. Limpiar y reconstruir contenedor del botón de PayPhone
  const btnContainer = document.getElementById('payphone-payment-box-container');
  btnContainer.innerHTML = '<div id="payphone-btn"></div>';

  activeCheckout = {
    name: `Carrito (${itemsCount} productos)`,
    clientTxId,
    amount,
    amountWithTax,
    amountWithoutTax,
    taxValue
  };

  // Guardar monto total de la transacción asociada al clientTxId para usarlo en la verificación
  localStorage.setItem(clientTxId, amount.toString());

  console.log('[PayPhone Cart Request Init]:', {
    amount,
    amountWithTax,
    amountWithoutTax,
    taxValue,
    clientTxId
  });

  try {
    // 5. Inicializar la Cajita de Pagos de PayPhone (SDK oficial)
    const payphoneButton = new PPaymentButtonBox({
      token: currentConfig.token,
      storeId: currentConfig.storeId,
      clientTransactionId: clientTxId,
      amount: amount,
      amountWithoutTax: amountWithoutTax,
      amountWithTax: amountWithTax,
      taxValue: taxValue,
      currency: "USD",
      email: "elliderchoez@gmail.com",
      phoneNumber: "0989630532",
      documentId: "1712345678",
      responseUrl: window.location.origin + "/confirm"
    });

    // 6. Renderizar el botón en el div de destino
    payphoneButton.render('#payphone-btn');
  } catch (error) {
    console.error('Error al instanciar PPaymentButtonBox:', error);
    alert('Error al inicializar la caja de pagos. Asegúrese de que el script de PayPhone se haya cargado correctamente.');
  }
}

// --- 4. Renderización del Historial de Transacciones ---
function renderTransactions(transactions) {
  if (transactions.length === 0) {
    transactionsLog.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          No se han realizado transacciones en esta sesión de pruebas.
        </td>
      </tr>
    `;
    return;
  }

  transactionsLog.innerHTML = '';
  transactions.forEach(tx => {
    const row = document.createElement('tr');
    
    // Formatear Fecha
    const dateStr = new Date(tx.timestamp).toLocaleString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });

    // Formatear Badge de Estado
    let statusClass = 'status-pending';
    let statusLabel = tx.status;
    
    if (tx.status === 'APPROVED' || tx.status === 'APROBADO') {
      statusClass = 'status-approved';
      statusLabel = 'Aprobado';
    } else if (tx.status === 'REJECTED' || tx.status === 'RECHAZADO') {
      statusClass = 'status-rejected';
      statusLabel = 'Rechazado';
    } else if (tx.status === 'CANCELED' || tx.status === 'CANCELADO') {
      statusClass = 'status-canceled';
      statusLabel = 'Cancelado';
    }

    row.innerHTML = `
      <td>${dateStr}</td>
      <td style="font-family: monospace; font-size: 0.8rem;">${tx.id || 'N/A'}</td>
      <td style="font-family: monospace; font-size: 0.8rem;">${tx.clientTxId}</td>
      <td style="font-weight: 600; color: white;">$${tx.amount}</td>
      <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td>
        <button class="json-response-btn" data-id="${tx.id || tx.clientTxId}">Ver JSON</button>
      </td>
    `;

    // Vincular visualización de JSON al botón
    row.querySelector('.json-response-btn').addEventListener('click', () => {
      showJsonModal(tx.rawResponse);
    });

    transactionsLog.appendChild(row);
  });
}

// Abrir modal e inyectar el JSON formateado
function showJsonModal(rawJson) {
  jsonDisplay.textContent = JSON.stringify(rawJson, null, 2);
  jsonModal.style.display = 'flex';
}
