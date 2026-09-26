import { BrevoClient } from "@getbrevo/brevo";

let brevo;

const getBrevo = () => {
  if (!brevo) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Dev mode — caller will detect via isEmailConfigured() and skip the API call
      brevo = null;
      return null;
    }
    brevo = new BrevoClient({ apiKey });
  }
  return brevo;
};

export const isEmailConfigured = () => Boolean(process.env.BREVO_API_KEY);

const frontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const sender = () => ({
  email: process.env.BREVO_SENDER_EMAIL || "prlens.app@gmail.com",
  name: process.env.BREVO_SENDER_NAME || "PRLens",
});

// Template IDs (optional). If set, we call Brevo with `{ templateId, params }`
// and let Brevo render the email. Otherwise we fall back to inline HTML.
const templateId = (name) => {
  const id = process.env[`BREVO_TEMPLATE_${name}`];
  return id ? Number(id) : null;
};

const devLog = (label, payload) => {
  console.log(`\n📧 [DEV EMAIL — Brevo not configured] ${label}`);
  for (const [k, v] of Object.entries(payload)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log("");
};

/**
 * Send the email-verification message.
 *
 * @param {string} email
 * @param {string} rawToken - The unhashed token, embedded in the verification link.
 * @param {string} [firstName] - Optional first name for the template (Brevo uses {{ params.FIRST_NAME }})
 */
export const sendVerificationEmail = async (email, rawToken, firstName = "") => {
  const verificationLink = `${frontendUrl()}/verify-email?token=${rawToken}`;
  const tplId = templateId("VERIFY");

  if (!isEmailConfigured()) {
    devLog("Verification email", {
      to: email,
      link: verificationLink,
      expiresIn: "30 minutes",
    });
    return;
  }

  try {
    const baseMsg = {
      sender: sender(),
      to: [{ email }],
    };

    if (tplId) {
      // Use Brevo template. The template must define params:
      //   FIRST_NAME, VERIFICATION_URL
      await getBrevo().transactionalEmails.sendTransacEmail({
        ...baseMsg,
        templateId: tplId,
        params: { FIRST_NAME: firstName, VERIFICATION_URL: verificationLink },
      });
    } else {
      await getBrevo().transactionalEmails.sendTransacEmail({
        ...baseMsg,
        subject: "Verify your email address",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Verify your email</h2>
          <p style="color: #555;">
            Thanks for signing up! Please verify your email address by clicking the button below.
            This link will expire in <strong>30 minutes</strong>.
          </p>
          <a href="${verificationLink}"
             style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                    color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email
          </a>
          <p style="color: #999; font-size: 12px;">
            If you did not create an account, you can safely ignore this email.
          </p>
          <p style="color: #999; font-size: 12px;">
            Or copy this link: ${verificationLink}
          </p>
        </div>
      `,
      });
    }
    console.log(`[Email] Verification sent to ${email}`);
  } catch (error) {
    console.error("[Email] Brevo email error:", error?.body || error.message);
    // Don't throw — registration should succeed even if email fails
  }
};

/**
 * Send the password-reset OTP.
 *
 * @param {string} email
 * @param {string} otp - 6-digit numeric code (NOT hashed)
 * @param {string} [firstName]
 */
export const sendOtpEmail = async (email, otp, firstName = "") => {
  const tplId = templateId("RESET");

  if (!isEmailConfigured()) {
    devLog("Password reset OTP", {
      to: email,
      otp,
      expiresIn: "10 minutes",
    });
    return;
  }

  try {
    const baseMsg = {
      sender: sender(),
      to: [{ email }],
    };

    if (tplId) {
      // Template params: FIRST_NAME, OTP
      await getBrevo().transactionalEmails.sendTransacEmail({
        ...baseMsg,
        templateId: tplId,
        params: { FIRST_NAME: firstName, OTP: otp },
      });
    } else {
      await getBrevo().transactionalEmails.sendTransacEmail({
        ...baseMsg,
        subject: "Your password reset OTP",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Password Reset OTP</h2>
          <p style="color: #555;">Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                      color: #4F46E5; margin: 30px 0; text-align: center;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 12px;">
            If you did not request a password reset, ignore this email.
          </p>
        </div>
      `,
      });
    }
    console.log(`[Email] OTP sent to ${email}`);
  } catch (error) {
    console.error("[Email] Brevo OTP email error:", error?.body || error.message);
    throw new Error("Failed to send OTP email. Please try again.");
  }
};

/**
 * Notify the user that their password was changed. Non-blocking in callers —
 * we never want to fail a successful reset just because the notification
 * email couldn't be sent.
 *
 * @param {string} email
 * @param {string} [firstName]
 */
export const sendPasswordChangedEmail = async (email, firstName = "") => {
  const tplId = templateId("PASSWORD_CHANGED");

  if (!isEmailConfigured()) {
    devLog("Password changed notification", {
      to: email,
      note: "Your password was changed. If this wasn't you, secure your account immediately.",
    });
    return;
  }

  try {
    const baseMsg = {
      sender: sender(),
      to: [{ email }],
    };

    if (tplId) {
      // Template params: FIRST_NAME
      await getBrevo().transactionalEmails.sendTransacEmail({
        ...baseMsg,
        templateId: tplId,
        params: { FIRST_NAME: firstName },
      });
    } else {
      await getBrevo().transactionalEmails.sendTransacEmail({
        ...baseMsg,
        subject: "Your password was changed",
        htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">Your password was changed</h2>
          <p style="color: #555;">
            ${firstName ? `Hi ${firstName},` : "Hi,"} the password for your
            PRLens account was just changed. All other active sessions have been
            signed out.
          </p>
          <p style="color: #555;">
            If you made this change, no action is needed.
          </p>
          <p style="color: #c0392b;">
            If you did <strong>not</strong> make this change, please reset your
            password immediately or contact support.
          </p>
        </div>
      `,
      });
    }
    console.log(`[Email] Password-changed notice sent to ${email}`);
  } catch (error) {
    console.error(
      "[Email] Brevo password-changed error:",
      error?.body || error.message
    );
    // Swallow — caller treats this as best-effort.
  }
};
