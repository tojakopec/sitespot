import Link from "../components/ui/Link";

export default function Home() {
  return (
    <div className="flex flex-row gap-4 items-center justify-center h-screen">
      <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
    </div>
  );
}
