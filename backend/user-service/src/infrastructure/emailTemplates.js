function escapeHtml(value = '') {
    return String(value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
}

function money(value) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));
}

/* ─────────────────────────────────────────────
   Shared helpers
───────────────────────────────────────────── */

function rows(items = []) {
    return items.map((item, i) => {
        const bg = i % 2 === 0 ? '#ffffff' : '#f9fafb';
        const nombre = escapeHtml(item.nombre_producto || item.nombre);
        const subtotal = money(item.subtotal ?? Number(item.precio) * Number(item.cantidad));
        return `
        <tr bgcolor="${bg}" style="background-color:${bg};">
          <td style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;
                     font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">
            ${nombre}
          </td>
          <td align="center" style="padding:12px 10px;font-family:Arial,Helvetica,sans-serif;
                     font-size:14px;color:#6b7280;border-bottom:1px solid #e5e7eb;
                     white-space:nowrap;">
            ${item.cantidad}
          </td>
          <td align="right" style="padding:12px 16px;font-family:Arial,Helvetica,sans-serif;
                     font-size:14px;color:#111827;font-weight:bold;
                     border-bottom:1px solid #e5e7eb;white-space:nowrap;">
            ${subtotal}
          </td>
        </tr>`;
    }).join('');
}

function shell(title, accentColor, badgeText, badgeBg, bodyContent) {
    return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="es">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>${title}</title>
  <style type="text/css">
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;display:block}
    body{margin:0!important;padding:0!important;width:100%!important;background-color:#f3f4f6}
    @media only screen and (max-width:600px){
      .card{width:100%!important;border-radius:0!important}
      .pad{padding:24px 18px!important}
      .hide-mobile{display:none!important;width:0!important;max-height:0!important;overflow:hidden!important}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;">

<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
       bgcolor="#f3f4f6" style="background-color:#f3f4f6;">
  <tr>
    <td align="center" valign="top" style="padding:32px 16px;">

      <!-- CARD -->
      <table class="card" role="presentation" border="0" cellpadding="0" cellspacing="0"
             width="600" style="width:600px;max-width:600px;background-color:#ffffff;
             border-radius:12px;border:1px solid #e5e7eb;
             box-shadow:0 4px 16px rgba(0,0,0,0.08);">

        <!-- TOP ACCENT BAR -->
        <tr>
          <td height="4" bgcolor="${accentColor}"
              style="background-color:${accentColor};border-radius:12px 12px 0 0;
              line-height:4px;font-size:1px;">&nbsp;</td>
        </tr>

        <!-- HEADER -->
        <tr>
          <td class="pad" bgcolor="#ffffff"
              style="padding:32px 40px 24px;background-color:#ffffff;
              border-bottom:1px solid #f3f4f6;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td valign="middle">
                  <span style="font-family:Arial,Helvetica,sans-serif;font-size:20px;
                               font-weight:bold;color:#111827;letter-spacing:-0.3px;">
                    &#128722;&nbsp;E-Tienda
                  </span>
                </td>
                <td align="right" valign="middle">
                  <span style="display:inline-block;background-color:${badgeBg};
                               color:${accentColor};font-family:Arial,Helvetica,sans-serif;
                               font-size:11px;font-weight:bold;letter-spacing:1px;
                               text-transform:uppercase;padding:4px 10px;
                               border-radius:20px;">
                    ${badgeText}
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="pad" style="padding:32px 40px;background-color:#ffffff;">
            ${bodyContent}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td class="pad" bgcolor="#f9fafb"
              style="padding:20px 40px;background-color:#f9fafb;
              border-top:1px solid #e5e7eb;border-radius:0 0 12px 12px;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;
                      color:#9ca3af;line-height:1.6;margin:0;text-align:center;">
              Este correo fue enviado por E-Tienda. Si tienes dudas escríbenos a
              <a href="mailto:bytecatstudios@gmail.com"
                 style="color:#6b7280;text-decoration:none;">bytecatstudios@gmail.com</a><br/>
              &copy; 2026 E-Tienda &nbsp;&middot;&nbsp; Todos los derechos reservados
            </p>
          </td>
        </tr>

      </table>
      <!-- /CARD -->

    </td>
  </tr>
</table>

</body>
</html>`;
}

/* ─────────────────────────────────────────────
   Items table (shared across templates)
───────────────────────────────────────────── */

function itemsTable(items, total) {
    return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
           style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin:20px 0 0 0;">
      <!-- thead -->
      <tr bgcolor="#f9fafb" style="background-color:#f9fafb;">
        <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;
                   font-size:11px;font-weight:bold;color:#6b7280;
                   text-transform:uppercase;letter-spacing:1px;
                   border-bottom:1px solid #e5e7eb;">
          Producto
        </td>
        <td align="center"
            style="padding:10px 10px;font-family:Arial,Helvetica,sans-serif;
                   font-size:11px;font-weight:bold;color:#6b7280;
                   text-transform:uppercase;letter-spacing:1px;
                   border-bottom:1px solid #e5e7eb;white-space:nowrap;">
          Cant.
        </td>
        <td align="right"
            style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;
                   font-size:11px;font-weight:bold;color:#6b7280;
                   text-transform:uppercase;letter-spacing:1px;
                   border-bottom:1px solid #e5e7eb;white-space:nowrap;">
          Importe
        </td>
      </tr>
      ${rows(items)}
      <!-- total row -->
      <tr bgcolor="#f9fafb" style="background-color:#f9fafb;">
        <td colspan="2"
            style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;
                   font-size:14px;font-weight:bold;color:#374151;">
          Total
        </td>
        <td align="right"
            style="padding:14px 16px;font-family:Arial,Helvetica,sans-serif;
                   font-size:16px;font-weight:bold;color:#111827;white-space:nowrap;">
          ${money(total)}
        </td>
      </tr>
    </table>`;
}

/* ─────────────────────────────────────────────
   1. orderCreatedCustomer
   Correo al cliente: pedido recibido, pendiente de pago
───────────────────────────────────────────── */

function orderCreatedCustomer(order, customer, instructions) {
    const body = `
      <h2 style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;
                 color:#111827;margin:0 0 8px 0;line-height:1.3;">
        ¡Tu pedido fue recibido!
      </h2>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;
                line-height:1.6;margin:0 0 24px 0;">
        Hola <strong>${escapeHtml(customer.nombre)}</strong>, registramos tu pedido
        <strong style="color:#2563eb;">#${escapeHtml(String(order.id))}</strong>.
        Sigue las instrucciones de pago para completarlo.
      </p>

      <!-- Status pill -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
        <tr>
          <td bgcolor="#eff6ff" style="background-color:#eff6ff;border-radius:8px;
              padding:12px 20px;border-left:4px solid #2563eb;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;
                         color:#1d4ed8;font-weight:bold;">
              &#9679;&nbsp; Estado: Pendiente de pago
            </span>
          </td>
        </tr>
      </table>

      ${itemsTable(order.items, order.total)}

      <!-- Payment instructions -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
             style="margin-top:28px;">
        <tr>
          <td bgcolor="#fffbeb" style="background-color:#fffbeb;border-radius:8px;
              padding:20px 24px;border:1px solid #fde68a;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:bold;
                      color:#92400e;text-transform:uppercase;letter-spacing:1px;
                      margin:0 0 10px 0;">
              &#128179;&nbsp; Instrucciones de pago
            </p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#78350f;
                      line-height:1.7;margin:0;">
              ${escapeHtml(instructions).replace(/\n/g, '<br/>')}
            </p>
          </td>
        </tr>
      </table>

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;
                line-height:1.6;margin:24px 0 0 0;">
        Una vez que realices el pago, inicia sesi&oacute;n en E-Tienda y
        conf&iacute;rmalo para que podamos procesar tu pedido.
      </p>`;

    return shell(
        `Pedido #${order.id} recibido — E-Tienda`,
        '#2563eb', 'Pendiente de pago', '#eff6ff',
        body
    );
}

/* ─────────────────────────────────────────────
   2. orderCreatedAdmin
   Correo interno: nuevo pedido para el administrador
───────────────────────────────────────────── */

function orderCreatedAdmin(order, customer) {
    const body = `
      <h2 style="font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:bold;
                 color:#111827;margin:0 0 8px 0;line-height:1.3;">
        Nuevo pedido recibido
      </h2>
      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;
                line-height:1.6;margin:0 0 24px 0;">
        Se registr&oacute; el pedido
        <strong style="color:#2563eb;">#${escapeHtml(String(order.id))}</strong>
        y est&aacute; pendiente de confirmaci&oacute;n de pago.
      </p>

      <!-- Customer info box -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
             style="margin-bottom:24px;">
        <tr>
          <td bgcolor="#eff6ff" style="background-color:#eff6ff;border-radius:8px;
              padding:16px 20px;border-left:4px solid #2563eb;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;
                      color:#2563eb;text-transform:uppercase;letter-spacing:1px;
                      margin:0 0 8px 0;">
              &#128100;&nbsp; Datos del cliente
            </p>
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;
                           font-size:14px;color:#6b7280;padding-right:8px;">
                  Nombre:
                </td>
                <td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;
                           font-size:14px;color:#111827;font-weight:bold;">
                  ${escapeHtml(customer.nombre)}
                </td>
              </tr>
              <tr>
                <td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;
                           font-size:14px;color:#6b7280;padding-right:8px;">
                  Correo:
                </td>
                <td style="padding:2px 0;font-family:Arial,Helvetica,sans-serif;
                           font-size:14px;color:#111827;">
                  <a href="mailto:${escapeHtml(customer.email)}"
                     style="color:#2563eb;text-decoration:none;">
                    ${escapeHtml(customer.email)}
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>

      <!-- Status pill -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0"
             style="margin-bottom:4px;">
        <tr>
          <td bgcolor="#eff6ff" style="background-color:#eff6ff;border-radius:8px;
              padding:12px 20px;border-left:4px solid #2563eb;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;
                         color:#1d4ed8;font-weight:bold;">
              &#9679;&nbsp; Estado: Pendiente de pago
            </span>
          </td>
        </tr>
      </table>

      ${itemsTable(order.items, order.total)}`;

    return shell(
        `Nuevo pedido #${order.id} — E-Tienda Admin`,
        '#2563eb', 'Admin', '#eff6ff',
        body
    );
}

/* ─────────────────────────────────────────────
   3. paymentConfirmed
   Correo al cliente: pago confirmado
───────────────────────────────────────────── */

function paymentConfirmed(order, customer) {
    const body = `
      <!-- Checkmark hero -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
             style="margin-bottom:24px;">
        <tr>
          <td align="center" bgcolor="#f0fdf4"
              style="background-color:#f0fdf4;border-radius:8px;padding:24px 20px;
              border:1px solid #bbf7d0;">
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:32px;
                      margin:0 0 8px 0;line-height:1;">&#10003;</p>
            <p style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;
                      color:#15803d;margin:0;line-height:1.3;">
              &iexcl;Pago confirmado!
            </p>
          </td>
        </tr>
      </table>

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#374151;
                line-height:1.6;margin:0 0 20px 0;">
        Hola <strong>${escapeHtml(customer.nombre)}</strong>, confirmamos el pago de tu pedido
        <strong style="color:#2563eb;">#${escapeHtml(String(order.id))}</strong>.
        Ya estamos procesando tu compra.
      </p>

      <!-- Status pill -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0"
             style="margin-bottom:4px;">
        <tr>
          <td bgcolor="#f0fdf4" style="background-color:#f0fdf4;border-radius:8px;
              padding:12px 20px;border-left:4px solid #16a34a;">
            <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;
                         color:#15803d;font-weight:bold;">
              &#9679;&nbsp; Estado: Pagado
            </span>
          </td>
        </tr>
      </table>

      ${itemsTable(order.items, order.total)}

      <p style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#6b7280;
                line-height:1.6;margin:24px 0 0 0;">
        Gracias por comprar en <strong style="color:#111827;">E-Tienda</strong>.
        Si tienes alguna pregunta sobre tu pedido, no dudes en contactarnos.
      </p>`;

    return shell(
        `Pago confirmado #${order.id} — E-Tienda`,
        '#2563eb', 'Pago confirmado', '#eff6ff',
        body
    );
}

module.exports = { orderCreatedCustomer, orderCreatedAdmin, paymentConfirmed };