import { forwardRef } from "react";

interface FormInputFieldProps {
  title: string;
  name?: string;
  type: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
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
      placeholder,
      onChange,
      onBlur,
      value,
      ...rest
    },
    ref
  ) => {
    return (
      <div className="flex flex-col mb-2">
        <label
          htmlFor={name}
          className="text-lg text-left font-medium text-gray-200"
        >
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
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
          placeholder={placeholder}
          className={`
            mt-1 block w-full rounded-md border px-3 py-2 text-gray-200
            bg-transparent border-gray-600
            shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
            sm:text-lg transition-colors
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                : ""
            }
            ${type === "checkbox" ? "w-4 h-4" : ""}
          `}
          {...rest}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1 font-medium">{error}</p>
        )}
      </div>
    );
  }
);

FormInputField.displayName = "FormInputField";

export default FormInputField;
