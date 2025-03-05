import { Button } from "@headlessui/react";

interface FormButtonProps {
  children: React.ReactNode;
  buttonStatus: "idle" | "loading" | "success" | "error";
  type?: "submit" | "button";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

const buttonText = {
  loading: "Submitting...",
  success: "Success",
  error: "Error",
};

const buttonColors = {
  idle: "bg-amber-500",
  loading: "bg-amber-500",
  success: "bg-green-600",
  error: "bg-red-600",
};

export default function FormButton({
  children,
  buttonStatus,
  type = "submit",
  className,
  disabled,
  onClick,
}: Readonly<FormButtonProps>) {
  return (
    <Button
      type={type}
      className={`${className} ${buttonColors[buttonStatus]}`}
      disabled={disabled}
      onClick={onClick}
    >
      {buttonStatus === "idle" ? children : buttonText[buttonStatus]}
    </Button>
  );
}
