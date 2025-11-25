import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";
import { env } from "./env";

let apiInstance: TransactionalEmailsApi | null = null;

export function getBrevoClient(): TransactionalEmailsApi {
  if (!apiInstance) {
    if (!env.BREVO_API_KEY) {
      throw new Error("BREVO_API_KEY is not configured");
    }
    apiInstance = new TransactionalEmailsApi();
    apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, env.BREVO_API_KEY);
  }
  return apiInstance;
}

export { SendSmtpEmail };

