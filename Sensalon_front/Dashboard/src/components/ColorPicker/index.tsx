import { useEffect, useState } from "react";

export function ColorPickerField({
  onChange,
  value,
}: {
  onChange: (value: { name: string; hex: string }) => void;
  value?: { name: string; hex: string } | string | null;
}) {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");

  // 👉 Este useEffect precarga el valor si viene desde edición
  useEffect(() => {
    if (value) {
      try {
        // Si viene como string (ej. '{"name":"Rojo","hex":"#ff0000"}')
        const parsed =
          typeof value === "string" ? JSON.parse(value) : value;

        if (parsed?.name) setColorName(parsed.name);
        if (parsed?.hex) setColorHex(parsed.hex);
      } catch (error) {
        console.warn("Error parsing colorVariant:", error);
      }
    }
  }, [value]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHex = e.target.value;
    setColorHex(newHex);
    onChange({ name: colorName, hex: newHex });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setColorName(newName);
    onChange({ name: newName, hex: colorHex });
  };

  return (
    <div className="col-span-2 lg:col-span-4">
      <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
        Color del producto
      </label>

      <div className="flex items-center gap-3">
        {/* Picker de color */}
        <input
          type="color"
          value={colorHex}
          onChange={handleColorChange}
          className="w-12 h-10 p-0 cursor-pointer dark:border-gray-600"
        />

        {/* Nombre del color */}
        <input
          type="text"
          placeholder="Ej. Rojo Ferrari"
          value={colorName}
          onChange={handleNameChange}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
        />
      </div>
    </div>
  );
}
