export class ApiError extends Error {
  status: number;
  details?: string;

  constructor(message: string, status = 500, details?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function messageForStatus(status: number, serverMessage?: string) {
  if (serverMessage && !looksLikeStackTrace(serverMessage)) {
    return humanizeServerMessage(serverMessage);
  }

  switch (status) {
    case 400:
      return "The request could not be processed. Please review the details and try again.";
    case 401:
      return "Your session has expired. Please sign in again.";
    case 403:
      return "You do not have permission to perform this action.";
    case 404:
      return "We could not find what you were looking for.";
    case 409:
      return "This request conflicts with an existing record.";
    case 422:
      return "Some of the information provided is invalid.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
    case 502:
    case 503:
      return "The server could not complete this request right now.";
    default:
      return "We could not complete this request. Please try again.";
  }
}

function looksLikeStackTrace(message: string) {
  return message.includes("\n") || message.includes("at ") && message.includes(".js");
}

function humanizeServerMessage(message: string) {
  if (message === "user not found!") return "No account was found for this email address.";
  if (message === "Email or Password is Invalid!") return "The email or password is incorrect.";
  if (message === "User already exists!") return "An account with this email already exists.";
  if (message === "No token provided!") return "There is no active session to sign out.";
  return message;
}
