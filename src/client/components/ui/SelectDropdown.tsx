import { forwardRef } from "react";

interface SelectDropdownProps {
  name?: string;
  label: string;
  options: string[];
  className?: string;
  error?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  value?: string;
  ref?: React.Ref<HTMLSelectElement>;
}

const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(
  (
    {
      name,
      label,
      options,
      className,
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
      <div className={`flex flex-col gap-2 mb-4 ${className}`}>
        <label htmlFor={name} className="block text-2xl font-medium text-white">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          ref={ref}
          id={name}
          name={name}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          required={required}
          className={`block w-full rounded-md border px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...rest}
        >
          {options.map((option) => (
            <option key={option} value={option.toLowerCase()}>
              {option}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

SelectDropdown.displayName = "SelectDropdown";

export default SelectDropdown;
