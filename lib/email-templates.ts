type OtpTemplateParams = {
  otp: string;
};

export function otpEmailTemplate({ otp }: OtpTemplateParams) {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Verify your email</title>
      <style>
        body {
          background-color: #f8fafc;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
            sans-serif;
          margin: 0;
          padding: 0;
          color: #0f172a;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          padding: 48px 24px 56px;
        }
        .card {
          background-color: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
          padding: 48px 40px 44px;
          text-align: center;
        }
        .brand-mark {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          margin: 0 auto 28px;
          border-radius: 28px;
          background: linear-gradient(140deg, #f97316, #f43f5e);
          color: #ffffff;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.6px;
        }
        .title {
          font-size: 26px;
          font-weight: 600;
          margin: 6px 0 12px;
          color: #0f172a;
        }
        .subtitle {
          color: #475569;
          font-size: 15px;
          line-height: 1.7;
          margin-bottom: 28px;
        }
        .otp-box {
          display: inline-flex;
          gap: 12px;
          padding: 18px 26px;
          border-radius: 16px;
          background: #f1f5f9;
          border: 1px solid #cbd5f5;
          letter-spacing: 8px;
          font-size: 28px;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 18px;
        }
        .meta {
          color: #64748b;
          font-size: 13px;
          margin-top: 24px;
          line-height: 1.6;
        }
        .footer {
          margin-top: 32px;
          text-align: center;
          font-size: 12px;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <div class="brand-mark">KnowledgeShare</div>
          <h1 class="title">Verify your email address</h1>
          <p class="subtitle">
            Enter the one-time passcode below to continue signing in to
            KnowledgeShare. The code expires in 10 minutes for your security.
          </p>
          <div class="otp-box">${otp}</div>
          <p class="subtitle" style="margin-bottom: 6px;">
            If you did not initiate this, ignore this email.
          </p>
          <div class="meta">
            Need help? Reply to this email or contact
            <a href="mailto:sohag.zayan@gmail.com" style="color: #2563eb;">
              sohag.zayan@gmail.com
            </a>
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} KnowledgeShare. All rights
          reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}


