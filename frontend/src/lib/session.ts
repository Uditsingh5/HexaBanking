import { SESSION_USER_KEY } from "@/constants";
import type { User } from "@/types";

export function readSessionUser(): User | null {
  try {
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as User;
    if (!parsed?._id || !parsed.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSessionUser(user: User) {
  sessionStorage.setItem(
    SESSION_USER_KEY,
    JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role ?? "user",
    }),
  );
}


export function clearSessionUser() {
  sessionStorage.removeItem(SESSION_USER_KEY);
}
