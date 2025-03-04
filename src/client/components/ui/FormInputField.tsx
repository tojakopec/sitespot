import { forwardRef } from "react";

interface FormInputFieldProps {
  title: string;
  name?: string;
  type: string;
  error?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  value?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const FormInputField = forwardRef<HTMLInputElement, FormInputFieldProps>(
  (
    {
      title,
      name,
      type,
      error,
      required = false,
      onChange,
      onBlur,
      value,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-2 mb-4">
        <label
          htmlFor={name}
          className="block text-2xl font-medium text-gray-700"
        >
          {title} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          required={required}
          className={`mt-1 block w-full rounded-md border px-3  shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-lg ${
            error ? "border-red-500" : "border-gray-300"
          } ${type === "checkbox" ? "w-4 h-4" : ""}`}
          {...rest}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

FormInputField.displayName = "FormInputField";

export default FormInputField;
