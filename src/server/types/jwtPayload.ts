import { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  id: number;
  email: string;
}
