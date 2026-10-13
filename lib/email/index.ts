export {
  resend,
  sendEmail,
  DEFAULT_FROM_EMAIL,
  type SendEmailOptions,
  type SendEmailResult,
} from "./resend";

export {
  renderEmailLayout,
  type EmailLayoutOptions,
} from "./templates/base";

export {
  renderApplicationStatusEmail,
  type ApplicationStatusEmailData,
} from "./templates/statusUpdate";

export {
  renderApplicationAcceptedEmail,
  type ApplicationAcceptedEmailData,
} from "./templates/applicationAccepted";

export {
  sendApplicationStatusEmailNotification,
  type SendApplicationStatusNotificationParams,
} from "./service";
