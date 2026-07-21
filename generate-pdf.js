const PDFDocument = require('pdfkit');
const fs = require('fs');

function generatePDF(outputPath) {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: 'Reporte Técnico de Integración: PayPhone',
      Author: 'David Chóez',
      Subject: 'Integración del Botón de Pagos de PayPhone'
    }
  });

  doc.pipe(fs.createWriteStream(outputPath));

  // --- PALETA DE COLORES ---
  const PRIMARY_COLOR = '#1e1b4b'; // Slate Indigo Oscuro
  const SECONDARY_COLOR = '#4f46e5'; // Indigo Vibrante
  const TEXT_COLOR = '#334155'; // Slate Gris Oscuro
  const CODE_BG = '#f1f5f9'; // Gris Muy Claro
  const ACCENT_COLOR = '#059669'; // Verde Esmeralda (Éxito)
  const BORDER_COLOR = '#cbd5e1'; // Gris Borde

  // --- CABECERA COMÚN (PÁGINAS POSTERIORES) ---
  const addHeader = (title) => {
    doc.fillColor(SECONDARY_COLOR).fontSize(10).text('REPORTE TÉCNICO DE INTEGRACIÓN - PASARELA PAYPHONE', 50, 30, { align: 'left' });
    doc.fillColor(TEXT_COLOR).fontSize(10).text(new Date().toLocaleDateString('es-ES'), 50, 30, { align: 'right' });
    doc.moveTo(50, 42).lineTo(545, 42).strokeColor(BORDER_COLOR).lineWidth(1).stroke();
    doc.y = 60;
  };

  // --- PORTADA (PÁGINA 1) ---
  // Fondo Decorativo
  doc.rect(0, 0, 600, 850).fill('#faf5ff'); // Lila muy suave
  doc.rect(0, 0, 600, 20).fill(PRIMARY_COLOR);
  
  // Título Principal
  doc.fillColor(PRIMARY_COLOR).fontSize(28).font('Helvetica-Bold')
     .text('Integración de Botón de Pagos', 50, 200, { align: 'left' });
  doc.fillColor(SECONDARY_COLOR).fontSize(24).font('Helvetica-Bold')
     .text('Pasarela PayPhone (Sandbox)', 50, 235, { align: 'left' });
  
  // Línea de separación
  doc.moveTo(50, 280).lineTo(300, 280).strokeColor(SECONDARY_COLOR).lineWidth(4).stroke();

  // Subtítulo / Descripción
  doc.fillColor(TEXT_COLOR).fontSize(12).font('Helvetica')
     .text('Estudio técnico de la implementación de la Cajita de Pagos en Frontend (Request) y la validación segura de transacciones en Backend (Response).', 50, 310, { width: 450, lineGap: 4 });

  // Metadatos
  doc.fillColor(PRIMARY_COLOR).fontSize(11).font('Helvetica-Bold')
     .text('Autor:', 50, 650);
  doc.fillColor(TEXT_COLOR).fontSize(11).font('Helvetica')
     .text('David Chóez - Estudiante del curso', 120, 650);

  doc.fillColor(PRIMARY_COLOR).fontSize(11).font('Helvetica-Bold')
     .text('Tecnología:', 50, 675);
  doc.fillColor(TEXT_COLOR).fontSize(11).font('Helvetica')
     .text('Node.js / Express / Vanilla HTML & JS', 120, 675);

  doc.fillColor(PRIMARY_COLOR).fontSize(11).font('Helvetica-Bold')
     .text('Ambiente:', 50, 700);
  doc.fillColor(ACCENT_COLOR).fontSize(11).font('Helvetica-Bold')
     .text('MODO PRUEBA (SANDBOX)', 120, 700);

  doc.fillColor(PRIMARY_COLOR).fontSize(11).font('Helvetica-Bold')
     .text('Fecha:', 50, 725);
  doc.fillColor(TEXT_COLOR).fontSize(11).font('Helvetica')
     .text(new Date().toLocaleDateString('es-ES'), 120, 725);

  // --- SECCIÓN 1: INTRODUCCIÓN Y REQUISITOS (PÁGINA 2) ---
  doc.addPage();
  addHeader();

  doc.fillColor(PRIMARY_COLOR).fontSize(18).font('Helvetica-Bold')
     .text('1. Introducción y Arquitectura de la Integración', 50, doc.y);
  
  doc.moveDown(0.5);
  doc.fillColor(TEXT_COLOR).fontSize(10.5).font('Helvetica')
     .text('La pasarela de pagos PayPhone permite a los comercios ecuatorianos recibir cobros con tarjetas de crédito/débito de forma ágil y segura. La integración técnica se modeló bajo una arquitectura desacoplada para garantizar que las credenciales críticas de la API (Bearer Token y Store ID) nunca sean expuestas al cliente frontend.', { align: 'justify', lineGap: 3 });

  doc.moveDown(0.8);
  doc.fillColor(PRIMARY_COLOR).fontSize(14).font('Helvetica-Bold')
     .text('Flujo General de Datos (Request y Response):', 50, doc.y);

  doc.moveDown(0.5);
  
  // Dibujar flujo paso a paso
  const steps = [
    'El Frontend inicia el Request cargando el CDN del SDK de la Cajita de Pagos de PayPhone.',
    'Se instancia PPaymentButtonBox configurando el monto, impuestos y una redirección segura (responseUrl).',
    'El cliente realiza el pago interactuando con el formulario seguro embebido de PayPhone.',
    'PayPhone redirige al cliente a la responseUrl de nuestra app, adjuntando "id" y "clientTransactionId".',
    'El Backend recibe la redirección y ejecuta el Response enviando una petición HTTP POST segura a /Confirm.',
    'La API de PayPhone responde con el estado final (APPROVED, REJECTED) y detalles de la transacción.'
  ];

  steps.forEach((step, idx) => {
    doc.fillColor(SECONDARY_COLOR).font('Helvetica-Bold').fontSize(10)
       .text(`Paso ${idx + 1}: `, 65, doc.y);
    doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10)
       .text(step, 110, doc.y - 12, { width: 435, lineGap: 2 });
    doc.moveDown(0.4);
  });

  // --- SECCIÓN 2: EL REQUEST - CONFIGURACIÓN DEL FRONTEND (PÁGINA 3) ---
  doc.addPage();
  addHeader();

  doc.fillColor(PRIMARY_COLOR).fontSize(18).font('Helvetica-Bold')
     .text('2. Implementación del Request (Cajita de Pagos en Frontend)', 50, doc.y);

  doc.moveDown(0.5);
  doc.fillColor(TEXT_COLOR).fontSize(10.5).font('Helvetica')
     .text('El Request se refiere a la inicialización y despliegue de la interfaz de pago en el navegador. Se realiza cargando la hoja de estilos y el SDK de Javascript directamente desde el CDN de PayPhone. La función de inicialización del botón se declara en el frontend de la siguiente manera:', { align: 'justify', lineGap: 3 });

  doc.moveDown(0.8);

  // Cuadro de código para Frontend
  const frontendCode = `// 1. Cargar dependencias de PayPhone en HTML:
// <link rel="stylesheet" href="https://cdn.payphonetodoesposible.com/box/v1.1/...css">
// <script type="module" src="https://cdn.payphonetodoesposible.com/box/v1.1/...js"></script>

// 2. Lógica de inicialización del botón de pagos en js/app.js:
const payphoneButton = new PPaymentButtonBox({
    token: "BEARER_TOKEN_DEV", // Token obtenido de la Consola de Desarrollador
    storeId: "ID_TIENDA_DEV", // Store ID obtenido de la aplicación PayPhone
    clientTransactionId: "TX-" + Date.now(), // ID único autogenerado
    amount: 1150, // Monto total en centavos (ej: $11.50)
    amountWithoutTax: 1000, // Base imponible 0% IVA o sin impuestos en centavos
    amountWithTax: 0, // Base imponible con IVA en centavos
    taxValue: 150, // Valor del impuesto (IVA 15%) en centavos
    currency: "USD", // Moneda oficial de transacción
    email: "correo_comprador@ejemplo.com", // Opcional, precarga en formulario
    phoneNumber: "0999999999", // Opcional, número celular del comprador
    documentId: "1712345678", // Opcional, documento de identificación
    responseUrl: window.location.origin + "/payment-result.html" // URL de redirección
});

// Renderiza el botón en el contenedor con id="payphone-btn"
payphoneButton.render('#payphone-btn');`;

  doc.rect(50, doc.y, 495, 270).fill(CODE_BG);
  doc.fillColor('#0f172a').font('Courier').fontSize(8.5);
  doc.text(frontendCode, 60, doc.y + 10, { lineGap: 2.5 });
  
  doc.y += 280;

  doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10)
     .text('Parámetros clave detallados:', 50, doc.y);
  
  doc.moveDown(0.3);
  doc.fontSize(9.5)
     .text('• amount: Especificado estrictamente en centavos de dólar. Por ejemplo, $10.00 se envía como 1000.', 60, doc.y, { lineGap: 2 })
     .text('• clientTransactionId: Debe ser único por cada intento de pago. Permite mapear e identificar la orden en tu base de datos.', 60, doc.y, { lineGap: 2 })
     .text('• responseUrl: URL absoluta del sistema a la cual PayPhone redirigirá tras culminar el intento de cobro.', 60, doc.y, { lineGap: 2 });

  // --- SECCIÓN 3: EL RESPONSE - CONFIRMACIÓN EN EL BACKEND (PÁGINA 4) ---
  doc.addPage();
  addHeader();

  doc.fillColor(PRIMARY_COLOR).fontSize(18).font('Helvetica-Bold')
     .text('3. Manejo del Response (Confirmación y Verificación)', 50, doc.y);

  doc.moveDown(0.5);
  doc.fillColor(TEXT_COLOR).fontSize(10.5).font('Helvetica')
     .text('El Response es el flujo posterior a la transacción. Cuando el usuario termina el pago, PayPhone redirige su navegador a la "responseUrl" especificada en el request, agregando parámetros clave en el query string de la URL: "id" (ID de Transacción PayPhone) y "clientTransactionId".', { align: 'justify', lineGap: 3 });

  doc.moveDown(0.5);
  doc.fillColor(TEXT_COLOR).fontSize(10.5).font('Helvetica-Bold')
     .text('Por seguridad, el resultado visible en la redirección URL nunca debe ser considerado como definitivo.', { lineGap: 3 });

  doc.fillColor(TEXT_COLOR).fontSize(10.5).font('Helvetica')
     .text('Es mandatorio implementar una confirmación Server-to-Server. El backend debe realizar un POST HTTP a la API de Confirmación de PayPhone en un lapso de 5 minutos, o de lo contrario, PayPhone revertirá automáticamente el pago al usuario.', { align: 'justify', lineGap: 3 });

  doc.moveDown(0.8);

  // Cuadro de código para Backend
  const backendCode = `// Ruta del Backend en Express (server.js) para la confirmación:
app.post('/api/confirm', async (req, res) => {
  const { id, clientTxId } = req.body;

  try {
    // Petición POST segura Server-to-Server
    const payphoneResponse = await fetch(
      'https://pay.payphonetodoesposible.com/api/button/V2/Confirm', 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${config.token}\` // Bearer Token privado
        },
        body: JSON.stringify({
          id: parseInt(id, 10), // ID de transacción de PayPhone
          clientTxId: clientTxId // ID de transacción de tu sistema
        })
      }
    );

    const data = await payphoneResponse.json();
    
    // Evaluamos el estado final retornado oficialmente
    if (payphoneResponse.ok && data.transactionStatus === "APPROVED") {
      res.json({ success: true, transaction: data });
    } else {
      res.status(400).json({ success: false, error: data.message || "Rechazado" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});`;

  doc.rect(50, doc.y, 495, 275).fill(CODE_BG);
  doc.fillColor('#0f172a').font('Courier').fontSize(8.5);
  doc.text(backendCode, 60, doc.y + 10, { lineGap: 2.5 });

  doc.y += 285;
  doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(10)
     .text('El JSON de respuesta de la confirmación nos provee datos indispensables como: "transactionId", "transactionStatus" ("APPROVED", "REJECTED"), "authorizationCode", "amount", y metadatos de tarjeta de crédito (marca, últimos 4 dígitos).', 50, doc.y, { align: 'justify', lineGap: 2 });

  // --- SECCIÓN 4: CONCLUSIÓN Y RESULTADOS DE PRUEBAS (PÁGINA 5) ---
  doc.addPage();
  addHeader();

  doc.fillColor(PRIMARY_COLOR).fontSize(18).font('Helvetica-Bold')
     .text('4. Conclusiones e Historial de Pruebas', 50, doc.y);

  doc.moveDown(0.5);
  doc.fillColor(TEXT_COLOR).fontSize(10.5).font('Helvetica')
     .text('La integración del botón/caja de pago de PayPhone siguiendo este modelo garantiza una experiencia de usuario sobresaliente y libre de fricciones, permitiendo pagos con tarjeta sin salir de la plataforma comercial. El flujo completo ha sido validado satisfactoriamente en el ambiente de pruebas utilizando credenciales temporales generadas desde la consola de desarrollo.', { align: 'justify', lineGap: 3 });

  doc.moveDown(1);
  doc.fillColor(PRIMARY_COLOR).fontSize(14).font('Helvetica-Bold')
     .text('Resumen de Respuestas Comunes del Servidor PayPhone:', 50, doc.y);

  doc.moveDown(0.5);

  // Tabla explicativa
  const tableTop = doc.y;
  doc.rect(50, tableTop, 495, 20).fill(PRIMARY_COLOR);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(9);
  doc.text('Campo / Estado', 60, tableTop + 6);
  doc.text('Descripción Técnica', 180, tableTop + 6);
  doc.text('Acción Recomendada', 380, tableTop + 6);

  const rows = [
    { campo: 'APPROVED', desc: 'Pago procesado y aprobado con éxito por el emisor de la tarjeta.', accion: 'Entregar el producto/servicio.' },
    { campo: 'REJECTED', desc: 'Pago rechazado por el banco (fondos insuficientes, tarjeta bloqueada, etc.).', accion: 'Sugerir al cliente reintentar con otra tarjeta.' },
    { campo: 'PENDING', desc: 'Transacción en espera de verificación o autorización diferida.', accion: 'Monitorear el estado o contactar soporte.' },
    { campo: 'CANCELED', desc: 'El cliente cerró la ventana de pago o canceló activamente la transacción.', accion: 'Retornar al carro y vaciar campos de pago.' }
  ];

  let currentY = tableTop + 20;
  rows.forEach((row, idx) => {
    // Fondo alterno para filas
    if (idx % 2 === 0) {
      doc.rect(50, currentY, 495, 30).fill('#f8fafc');
    } else {
      doc.rect(50, currentY, 495, 30).fill('#ffffff');
    }
    
    doc.fillColor(TEXT_COLOR).font('Helvetica-Bold').fontSize(8.5);
    doc.text(row.campo, 60, currentY + 10);
    
    doc.font('Helvetica').fontSize(8.5);
    doc.text(row.desc, 180, currentY + 5, { width: 190, lineGap: 1 });
    doc.text(row.accion, 380, currentY + 5, { width: 155, lineGap: 1 });
    
    currentY += 30;
  });

  doc.y = currentY + 30;
  
  // Pie de firma
  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor(BORDER_COLOR).lineWidth(1).stroke();
  doc.moveDown(1);
  doc.fillColor(PRIMARY_COLOR).font('Helvetica-Bold').fontSize(11)
     .text('Documentación Técnica de Práctica de Laboratorio', 50, doc.y);
  doc.fillColor(TEXT_COLOR).font('Helvetica').fontSize(9)
     .text('Este documento fue generado de forma automatizada por el sistema backend como parte del entregable práctico de la integración de pasarelas de pago.', 50, doc.y + 4);

  // Finalizar el documento
  doc.end();
}

module.exports = { generatePDF };
