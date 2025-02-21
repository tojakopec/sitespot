import * as crypto from "node:crypto";

// hash user password with user's id and and a string as salt
export function hashPassword(password: string) {
  const saltString = "the night is dark and full of terrors";

  return crypto
    .createHash("sha256")
    .update(password + saltString)
    .digest("hex");
}
