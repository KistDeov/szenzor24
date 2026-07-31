import { sendEmail } from "./email";
import { OrderPayload } from "@/types/order";

/**
 * Rendelés visszaigazoló email küldése
 * - Sikeres vásárlás visszaigazolás
 * - Regisztráció ösztönzése a rendszer.szenzor24.hu-ra
 */
export const sendOrderConfirmationEmail = async (order: OrderPayload) => {
  const szenzorokList = order.szenzorok
    .map((sz) => `<li>${sz.name} - ${sz.price.toLocaleString("hu-HU")} Ft</li>`)
    .join("");

  // EGYSZERŰSÍTETT MEGRENDELÉS: ha fix áras eszközt küld a frontend (order.eszkoz),
  // akkor csak az eszközt és a színeket soroljuk fel, az összetevőnkénti bontás
  // (szenzorok, burkolat, doboz, tápellátás) ideiglenesen ki van kommentelve.
  const termekReszletek = order.eszkoz
    ? `
                    <!-- Eszköz (fix ár) -->
                    <p style="margin: 0 0 5px 0; color: #4b5563;">
                      📡 <strong>Eszköz:</strong> ${order.eszkoz.name}
                      (${order.eszkoz.quantity} db × ${order.eszkoz.price.toLocaleString("hu-HU")} Ft + ÁFA)
                    </p>

                    <!-- Színek -->
                    <p style="margin: 0 0 20px 0; color: #4b5563;">
                      🎨 <strong>Színek:</strong> ${order.colors.dobozSzin.name} doboz / ${order.colors.tetoSzin.name} tető
                    </p>
    `
    : `
                    <!-- Szenzorok -->
                    <p style="margin: 0 0 10px 0; font-weight: bold; color: #1f2937; font-size: 14px; text-transform: uppercase;">
                      📡 Szenzorok (${order.szenzorok.length} db)
                    </p>
                    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #4b5563;">
                      ${szenzorokList}
                    </ul>

                    <!-- Anyag -->
                    <p style="margin: 0 0 5px 0; color: #4b5563;">
                      🧱 <strong>Burok anyag:</strong> ${order.anyag.name}
                      ${order.anyag.price > 0 ? `(+${order.anyag.price.toLocaleString("hu-HU")} Ft)` : "(alap ár)"}
                    </p>

                    <!-- Doboz -->
                    <p style="margin: 0 0 5px 0; color: #4b5563;">
                      📦 <strong>Doboz:</strong> ${order.doboz.name} (${order.doboz.price.toLocaleString("hu-HU")} Ft)
                    </p>

                    <!-- Színek -->
                    <p style="margin: 0 0 5px 0; color: #4b5563;">
                      🎨 <strong>Színek:</strong> ${order.colors.dobozSzin.name} doboz / ${order.colors.tetoSzin.name} tető
                    </p>

                    <!-- Tápellátás -->
                    <p style="margin: 0 0 20px 0; color: #4b5563;">
                      🔌 <strong>Tápellátás:</strong> ${order.tapellatas.name} (${order.tapellatas.price.toLocaleString("hu-HU")} Ft)
                    </p>
    `;

  const html = `
<!DOCTYPE html>
<html lang="hu">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rendelés visszaigazolás - Szenzor24</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">🎉 Sikeres rendelés!</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Szenzor24.hu</p>
            </td>
          </tr>
          
          <!-- Greeting -->
          <tr>
            <td style="padding: 30px 30px 20px 30px;">
              <p style="margin: 0; font-size: 18px; color: #1f2937;">
                Kedves <strong>${order.userName}</strong>!
              </p>
              <p style="margin: 15px 0 0 0; font-size: 16px; color: #4b5563; line-height: 1.6;">
                Köszönjük a rendelésed! Az alábbi termékeket rendeltéd meg:
              </p>
            </td>
          </tr>
          
          <!-- Order Details -->
          <tr>
            <td style="padding: 0 30px 20px 30px;">
              <table style="width: 100%; border-collapse: collapse; background-color: #f9fafb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    
                    ${termekReszletek}

                    <!-- Összegek -->
                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">
                    <table style="width: 100%;">
                      <tr>
                        <td style="color: #6b7280; padding: 5px 0;">Nettó összeg:</td>
                        <td style="text-align: right; color: #1f2937; font-weight: 500;">${order.subtotal.toLocaleString("hu-HU")} Ft</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; padding: 5px 0;">ÁFA (${order.vatPercent}%):</td>
                        <td style="text-align: right; color: #1f2937; font-weight: 500;">${order.vatAmount.toLocaleString("hu-HU")} Ft</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; padding: 5px 0;">Szállítás (ÁFA-mentes):</td>
                        <td style="text-align: right; color: #1f2937; font-weight: 500;">${order.shippingFee.toLocaleString("hu-HU")} Ft</td>
                      </tr>
                      <tr>
                        <td style="color: #1f2937; padding: 10px 0 0 0; font-size: 18px; font-weight: bold;">Összesen:</td>
                        <td style="text-align: right; color: #3b82f6; font-size: 20px; font-weight: bold; padding: 10px 0 0 0;">${order.total.toLocaleString("hu-HU")} Ft</td>
                      </tr>
                    </table>
                    
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CTA - Regisztráció -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <table style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 8px;">
                <tr>
                  <td style="padding: 25px; text-align: center;">
                    <p style="margin: 0 0 15px 0; color: #ffffff; font-size: 18px; font-weight: bold;">
                      🚀 Hozd ki a legtöbbet a szenzoraidból!
                    </p>
                    <p style="margin: 0 0 20px 0; color: #d1fae5; font-size: 14px; line-height: 1.6;">
                      Regisztrálj a <strong>rendszer.szenzor24.hu</strong> oldalon és kövesd valós időben a szenzorjaid adatait, 
                      állíts be riasztásokat, és férj hozzá a részletes statisztikákhoz!
                    </p>
                    <a href="https://rendszer.szenzor24.hu/auth/signup" 
                       style="display: inline-block; background-color: #ffffff; color: #059669; padding: 14px 30px; 
                              text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                      Regisztráció most →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Status Info -->
          <tr>
            <td style="padding: 0 30px 30px 30px;">
              <p style="margin: 0; font-size: 14px; color: #6b7280; line-height: 1.6;">
                📊 <strong>Rendelésed státusza:</strong> Fizetve<br>
                A gyártás megkezdése után emailben értesítünk a haladásról.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                Kérdésed van? Írj nekünk: <a href="mailto:info@szenzor24.hu" style="color: #3b82f6;">info@szenzor24.hu</a>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} Szenzor24.hu - Minden jog fenntartva
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;


console.log('Küldés megkezdése, email:', order?.userEmail);
try {
  const result = await sendEmail({
    to: order.userEmail,
    subject: `✅ Rendelés visszaigazolás - Szenzor24`,
    html,
  });

  console.log('SendEmail result:', result);

  if (!result || result.accepted?.length === 0) {
    console.error('Az email nem lett elküldve: nincs elfogadott cím a result-ban');
    return null;
  }

  return result;
} catch (error) {
  console.error('Hiba az email küldésekor:', error);
  return null;
}
};
