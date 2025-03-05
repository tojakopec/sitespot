import { Link as RouterLink } from "react-router-dom";

interface LinkProps {
  to: string;
  children: Readonly<React.ReactNode>;
  className?: string;
}

export default function Link({ to, children, className }: Readonly<LinkProps>) {
  return (
    <RouterLink
      to={to}
      className={`px-4 py-2 bg-amber-500 text- rounded hover:bg-amber-600 ${className}`}
    >
      {children}
    </RouterLink>
  );
}
