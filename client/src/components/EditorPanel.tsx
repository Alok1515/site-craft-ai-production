import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface EditorPanelProps {
  selectedElement: any;
  onUpdate: (updates: any) => void;
  onClose: () => void;
}

const EditorPanel = ({
  selectedElement,
  onUpdate,
  onClose,
}: EditorPanelProps) => {
  const [values, setValues] = useState(selectedElement);

  useEffect(() => {
    setValues(selectedElement);
  }, [selectedElement]);

  if (!selectedElement || !values) return null;

  const handleChange = (field: string, value: string) => {
    const updated = { ...values, [field]: value };
    setValues(updated);
    onUpdate({ [field]: value });
  };

  const handleStyleChange = (field: string, value: string) => {
    const updated = {
      ...values,
      styles: { ...values.styles, [field]: value },
    };
    setValues(updated);
    onUpdate({ styles: { [field]: value } });
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white text-black animate-fade-in rounded-lg shadow-xl border p-4 z-[999]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Edit Element</h3>
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-gray-100"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Text */}
        <div>
          <label className="block text-xs text-gray-500">Text</label>
          <textarea
            value={values.text}
            onChange={(e) => handleChange("text", e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>

        {/* ClassName */}
        <div>
          <label className="block text-xs text-gray-500">Class Name</label>
          <input
            type="text"
            value={values.className}
            onChange={(e) => handleChange("className", e.target.value)}
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>

        {/* Padding + Margin */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Padding</label>
            <input
              value={values.styles.padding}
              onChange={(e) =>
                handleStyleChange("padding", e.target.value)
              }
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Margin</label>
            <input
              value={values.styles.margin}
              onChange={(e) =>
                handleStyleChange("margin", e.target.value)
              }
              className="w-full p-2 border rounded-md text-sm"
            />
          </div>
        </div>

        {/* Background + Text Color */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500">Background</label>
            <input
              type="color"
              value={values.styles.backgroundColor}
              onChange={(e) =>
                handleStyleChange("backgroundColor", e.target.value)
              }
              className="w-8 h-8"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Text Color</label>
            <input
              type="color"
              value={values.styles.color}
              onChange={(e) =>
                handleStyleChange("color", e.target.value)
              }
              className="w-8 h-8"
            />
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="text-xs text-gray-500">Font Size</label>
          <input
            value={values.styles.fontSize}
            onChange={(e) =>
              handleStyleChange("fontSize", e.target.value)
            }
            className="w-full p-2 border rounded-md text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
