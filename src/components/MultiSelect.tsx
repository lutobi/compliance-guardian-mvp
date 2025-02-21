import * as React from "react";
import { cn } from "@/lib/utils";

interface Item {
  id: string;
  name: string;
}

interface MultiSelectProps {
  items: Item[];
  selected: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function MultiSelect({
  items,
  selected,
  onChange,
  placeholder = "Select items",
  disabled = false,
}: MultiSelectProps) {
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const values = Array.from(event.target.selectedOptions, option => option.value);
    onChange(values);
  };

  return (
    <select
      multiple
      value={selected}
      onChange={handleChange}
      disabled={disabled}
      className={cn(
        "min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        disabled && "cursor-not-allowed opacity-50"
      )}
    >
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
  );
}
