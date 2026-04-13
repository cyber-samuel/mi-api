const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía el código de recuperación de contraseña por email.
 * @param {string} to      - Email destinatario
 * @param {string} codigo  - Código de 6 dígitos
 */
const enviarCodigoRecuperacion = async (to, codigo) => {
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

  await resend.emails.send({
    from,
    to,
    subject: 'Tu código de recuperación — ChocoFreseo',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #fff; border-radius: 12px;">
        <div style="text-align:center; margin-bottom: 24px;">
          <div style="display:inline-block; background:#B91C1C; color:#fff; font-weight:900; font-size:18px; padding: 10px 18px; border-radius: 8px; letter-spacing:1px;">
            CF
          </div>
          <span style="font-size:20px; font-weight:800; color:#1a1a1a; margin-left:10px; vertical-align:middle;">ChocoFreseo</span>
        </div>

        <h2 style="color:#1a1a1a; font-size:22px; margin-bottom:8px;">Recuperar contraseña</h2>
        <p style="color:#666; font-size:15px; margin-bottom:24px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.<br>
          Usa el siguiente código en la app:
        </p>

        <div style="background:#FFF5F5; border: 2px solid #FECACA; border-radius:10px; padding: 20px; text-align:center; margin-bottom:24px;">
          <span style="font-size:40px; font-weight:900; letter-spacing:12px; color:#B91C1C; font-family:monospace;">${codigo}</span>
        </div>

        <p style="color:#888; font-size:13px; margin-bottom:8px;">
          ⏱ Este código expira en <strong>15 minutos</strong>.
        </p>
        <p style="color:#aaa; font-size:12px;">
          Si no solicitaste esto, puedes ignorar este email. Tu contraseña no cambiará.
        </p>
      </div>
    `,
  });
};

module.exports = { enviarCodigoRecuperacion };
