import Select, { MultiValue } from "react-select";
import { useState, useEffect } from "react";

interface Option {
  label: string;
  value: string;
  groupColor?: string;
}

interface GroupedOption {
  label: string;
  color: string;
  options: Option[];
}

interface DataStructure {
  color: string;
  items: string[];
}

interface MultiSelectDropdownProps {
  title: string;
  required?: boolean;
  data: Record<string, DataStructure>;
  placeholder?: string;
  onChange?: (selected: Option[]) => void;
  error?: string;
  name: string;
  defaultValue?: string[];
  registerField?: (name: string, values: string[]) => void;
}

function formatGroupLabel(group: GroupedOption) {
  return (
    <div
      className="flex items-center justify-between font-semibold py-2"
      style={{ color: group.color }}
    >
      <span>{group.label}</span>
    </div>
  );
}

export default function MultiSelectDropdown({
  title,
  data,
  required = false,
  placeholder = "Select items...",
  onChange,
  error,
  name,
  defaultValue = [],
  registerField,
}: Readonly<MultiSelectDropdownProps>) {
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);

  const groupedOptions: GroupedOption[] = Object.entries(data).map(
    ([category, { color, items }]) => ({
      label: category,
      color,
      options: items.map((item) => ({
        label: item,
        value: item,
        groupColor: color,
      })),
    })
  );

  const allOptions = groupedOptions.flatMap((group) => group.options);

  useEffect(() => {
    if (defaultValue.length > 0) {
      const defaultOptions = allOptions.filter((option) =>
        defaultValue.includes(option.value)
      );
      setSelectedOptions(defaultOptions);
    }
  }, [allOptions, defaultValue]);

  const handleChange = (newValue: MultiValue<Option>) => {
    const selected = newValue as Option[];
    setSelectedOptions(selected);

    const values = selected.map((option) => option.value);

    onChange?.(selected);
    registerField?.(name, values);
  };

  return (
    <div className="flex flex-col mb-2">
      <label
        htmlFor={name}
        className="text-lg text-left font-medium text-gray-200"
      >
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Select
        id={name}
        name={name}
        options={groupedOptions}
        value={selectedOptions}
        onChange={handleChange}
        isMulti
        className="text-gray-800 text-left"
        placeholder={placeholder}
        formatGroupLabel={formatGroupLabel}
        styles={{
          control: (base) => ({
            ...base,
            backgroundColor: "transparent",
            borderColor: "#4B5563",
          }),
          menu: (base) => ({
            ...base,
            backgroundColor: "#1F2937",
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? "#374151" : "#1F2937",
            color: "#E5E7EB",
          }),
          multiValue: (base, { data }) => ({
            ...base,
            backgroundColor: data.groupColor ?? "#374151",
            opacity: 0.9,
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "#ffffff",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "#ffffff",
            ":hover": {
              backgroundColor: "#4B5563",
            },
          }),
        }}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1 font-medium">{error}</p>
      )}
    </div>
  );
}
