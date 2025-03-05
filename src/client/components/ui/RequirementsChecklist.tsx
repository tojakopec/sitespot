import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

interface RequirementsChecklistProps {
  passwordRequirements: {
    minLength: boolean;
    hasDigit: boolean;
    hasSpecialChar: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
  };
}

export default function RequirementsChecklist({
  passwordRequirements,
}: Readonly<RequirementsChecklistProps>) {
  return (
    <div className="text-md space-y-1 mt-2">
      <p className="font-medium text-gray-200">Password requirements:</p>
      <ul className="pl-5 mx-auto space-y-1">
        <li className="flex items-center gap-2">
          {passwordRequirements.minLength ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XMarkIcon className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              passwordRequirements.minLength
                ? "text-green-700"
                : "text-gray-200"
            }
          >
            Minimum 8 characters
          </span>
        </li>
        <li className="flex items-center gap-2">
          {passwordRequirements.hasDigit ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XMarkIcon className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              passwordRequirements.hasDigit ? "text-green-700" : "text-gray-200"
            }
          >
            At least 1 number
          </span>
        </li>
        <li className="flex items-center gap-2">
          {passwordRequirements.hasSpecialChar ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XMarkIcon className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              passwordRequirements.hasSpecialChar
                ? "text-green-700"
                : "text-gray-200"
            }
          >
            At least 1 special character
          </span>
        </li>
        <li className="flex items-center gap-2">
          {passwordRequirements.hasUppercase ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XMarkIcon className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              passwordRequirements.hasUppercase
                ? "text-green-700"
                : "text-gray-200"
            }
          >
            At least 1 uppercase letter
          </span>
        </li>
        <li className="flex items-center gap-2">
          {passwordRequirements.hasLowercase ? (
            <CheckIcon className="h-4 w-4 text-green-500" />
          ) : (
            <XMarkIcon className="h-4 w-4 text-red-500" />
          )}
          <span
            className={
              passwordRequirements.hasLowercase
                ? "text-green-700"
                : "text-gray-200"
            }
          >
            At least 1 lowercase letter
          </span>
        </li>
      </ul>
    </div>
  );
}
