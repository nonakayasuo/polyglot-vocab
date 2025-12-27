import { Resend } from "resend";

// Resendクライアント（遅延初期化）
let resend: Resend | null = null;

/**
 * Resendクライアントを取得（遅延初期化）
 */
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

// 送信元メールアドレス（Resendで設定したドメインのアドレス）
const FROM_EMAIL =
  process.env.EMAIL_FROM || "NewsLingua <noreply@newslingua.app>";

interface SendEmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

/**
 * メールを送信する汎用関数
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const client = getResendClient();

  // APIキーが設定されていない場合はコンソールにログ出力のみ
  if (!client) {
    console.log("📧 Email (no API key):", {
      to,
      subject,
      text: text?.slice(0, 100),
    });
    return { success: true, messageId: "no-api-key" };
  }

  try {
    const { data, error } = await client.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error("Failed to send email:", error);
      throw new Error(error.message);
    }

    return { success: true, messageId: data?.id };
  } catch (error) {
    console.error("Email sending error:", error);
    throw error;
  }
}

/**
 * パスワードリセットメールを送信
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const subject = "【NewsLingua】パスワードリセットのご案内";

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📰 NewsLingua</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">ニュースで学ぶ語学</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600;">パスワードリセット</h2>
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                パスワードリセットのリクエストを受け付けました。<br>
                下のボタンをクリックして、新しいパスワードを設定してください。
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                  パスワードをリセット
                </a>
              </div>
              
              <p style="margin: 0 0 16px; color: #64748b; font-size: 14px; line-height: 1.6;">
                このリンクは1時間で有効期限が切れます。<br>
                心当たりがない場合は、このメールを無視してください。
              </p>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
              
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                ボタンが動作しない場合は、以下のURLをブラウザにコピーしてください：<br>
                <a href="${resetUrl}" style="color: #10b981; word-break: break-all;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} NewsLingua. All rights reserved.
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

  const text = `
NewsLingua - パスワードリセット

パスワードリセットのリクエストを受け付けました。
以下のリンクから新しいパスワードを設定してください：

${resetUrl}

このリンクは1時間で有効期限が切れます。
心当たりがない場合は、このメールを無視してください。

© ${new Date().getFullYear()} NewsLingua
`;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * メール確認メールを送信
 */
export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
) {
  const subject = "【NewsLingua】メールアドレスの確認";

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); border-radius: 12px 12px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">📰 NewsLingua</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">ニュースで学ぶ語学</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; color: #1e293b; font-size: 24px; font-weight: 600;">メールアドレスの確認</h2>
              <p style="margin: 0 0 16px; color: #475569; font-size: 16px; line-height: 1.6;">
                NewsLinguaへのご登録ありがとうございます！<br>
                下のボタンをクリックして、メールアドレスを確認してください。
              </p>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                  メールアドレスを確認
                </a>
              </div>
              
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #e2e8f0;">
              
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                ボタンが動作しない場合は、以下のURLをブラウザにコピーしてください：<br>
                <a href="${verificationUrl}" style="color: #10b981; word-break: break-all;">${verificationUrl}</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px; text-align: center;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                © ${new Date().getFullYear()} NewsLingua. All rights reserved.
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

  const text = `
NewsLingua - メールアドレスの確認

NewsLinguaへのご登録ありがとうございます！
以下のリンクからメールアドレスを確認してください：

${verificationUrl}

© ${new Date().getFullYear()} NewsLingua
`;

  return sendEmail({ to: email, subject, html, text });
}
