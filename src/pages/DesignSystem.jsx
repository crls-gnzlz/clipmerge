import React from "react";

// Utilidades de Tailwind para colores y estilos según DESIGN_SYSTEM.md
const COLORS = [
  { name: "Primary Blue", class: "bg-primary-600", hex: "#0355d2" },
  { name: "Primary Dark", class: "bg-primary-700", hex: "#023e97" },
  { name: "Primary Light", class: "bg-primary-50", hex: "#eaf2fb" },
  { name: "Secondary Gray", class: "bg-secondary-600", hex: "#64748b" },
  { name: "Secondary Dark", class: "bg-secondary-700", hex: "#475569" },
  { name: "Secondary Light", class: "bg-secondary-50", hex: "#f1f5f9" },
  { name: "Gray 900", class: "bg-gray-900", hex: "#111827" },
  { name: "Gray 100", class: "bg-gray-100", hex: "#f3f4f6" },
  { name: "Success", class: "bg-green-600", hex: "#059669" },
  { name: "Warning", class: "bg-amber-600", hex: "#d97706" },
  { name: "Error", class: "bg-red-600", hex: "#dc2626" },
];

const BUTTON_VARIANTS = [
  {
    label: "Primary",
    class:
      "bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50",
    disabledClass: "bg-primary-200 text-white cursor-not-allowed",
  },
  {
    label: "Secondary",
    class:
      "bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-xl font-medium transition-all duration-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50",
    disabledClass: "bg-gray-100 text-gray-400 border-gray-100 cursor-not-allowed",
  },
  {
    label: "Tertiary",
    class:
      "bg-primary-50 text-primary-600 px-4 py-2 rounded-lg font-medium border border-transparent hover:bg-primary-100 hover:text-primary-700 hover:border-primary-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 transition-all duration-200 flex items-center gap-2",
    disabledClass: "bg-primary-50 text-primary-200 cursor-not-allowed border-transparent",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
    ),
  },
  {
    label: "Text",
    class:
      "bg-transparent text-primary-600 hover:text-primary-700 px-4 py-2 font-medium transition-all duration-200 focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50",
    disabledClass: "text-gray-300 cursor-not-allowed",
  },
];

const TEXT_STYLES = [
  { label: "Page Title", class: "text-2xl font-light text-gray-900" },
  { label: "Section Header", class: "text-base font-medium text-gray-900" },
  { label: "Form Label", class: "text-xs font-medium text-gray-700" },
  { label: "Body Text", class: "text-sm text-gray-600" },
  { label: "Small Text", class: "text-xs text-gray-500 font-light" },
  { label: "Link", class: "text-primary-600 hover:text-primary-700 underline cursor-pointer" },
];

export default function DesignSystem() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 space-y-12">
      <h1 className="text-3xl font-light mb-8">Design System Demo</h1>

      {/* Paleta de colores */}
      <section>
        <h2 className="text-xl font-medium mb-4">Paleta de Colores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {COLORS.map((color) => (
            <div key={color.name} className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-xl border border-gray-200 ${color.class}`}></div>
              <span className="text-xs mt-2 text-gray-700">{color.name}</span>
              <span className="text-xs text-gray-400">{color.hex}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Botones */}
      <section>
        <h2 className="text-xl font-medium mb-4">Botones</h2>
        <div className="space-y-6">
          {BUTTON_VARIANTS.map((btn) => (
            <div key={btn.label} className="flex items-center space-x-4">
              <button className={btn.class}>{btn.icon}{btn.label} (Normal)</button>
              <button className={btn.class + " hover:bg-primary-100 hover:text-primary-700 hover:border-primary-200"}>{btn.icon}{btn.label} (Hover)</button>
              <button className={btn.class + " focus:ring-2 ring-primary-600"}>{btn.icon}{btn.label} (Focus)</button>
              <button className={btn.class + " " + btn.disabledClass} disabled>{btn.icon}{btn.label} (Disabled)</button>
            </div>
          ))}
        </div>
      </section>

      {/* Campos de texto */}
      <section>
        <h2 className="text-xl font-medium mb-4">Fields / Inputs</h2>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Normal</label>
            <input className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 transition-all duration-200" placeholder="Placeholder..." />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Focus</label>
            <input className="w-full border border-primary-500 rounded-xl px-4 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500 ring-2 ring-primary-500" placeholder="Placeholder..." />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Error</label>
            <input className="w-full border border-red-300 text-red-600 rounded-xl px-4 py-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500" placeholder="Error state..." />
            <span className="text-xs text-red-600 mt-1 block">Mensaje de error</span>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">Disabled</label>
            <input className="w-full border border-gray-100 bg-gray-50 text-gray-400 rounded-xl px-4 py-2 text-sm" placeholder="Disabled..." disabled />
          </div>
        </div>
      </section>

      {/* Tipografías */}
      <section>
        <h2 className="text-xl font-medium mb-4">Textos y Tipografías</h2>
        <div className="space-y-2">
          {TEXT_STYLES.map((txt) => (
            <div key={txt.label} className="flex items-center space-x-4">
              <span className={txt.class}>{txt.label} - Ejemplo de texto</span>
            </div>
          ))}
        </div>
      </section>

      {/* Bordes y sombras */}
      <section>
        <h2 className="text-xl font-medium mb-4">Borders & Shadows</h2>
        <div className="flex space-x-8">
          <div className="w-32 h-16 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center">rounded-2xl<br/>shadow-sm</div>
          <div className="w-32 h-16 rounded-xl border border-gray-200 shadow-md flex items-center justify-center">rounded-xl<br/>shadow-md</div>
        </div>
      </section>

      {/* Avisos / Info Tips */}
      <section>
        <h2 className="text-xl font-medium mb-4">Avisos / Info Tips</h2>
        <div className="max-w-md">
          <div className="flex items-start space-x-2 bg-primary-50 border border-primary-100 text-primary-700 text-xs rounded-lg px-4 py-3 mb-2">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>
              Tip: You can pause the video and use <b>Copy Time</b> to capture the current moment.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
