import React from "react";

const statusColors = {
  online: "bg-emerald-500",
  idle: "bg-amber-500",
  dnd: "bg-rose-500",
  offline: "bg-gray-500",
};

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-20 h-20 text-2xl font-bold",
};

const statusSizeClasses = {
  xs: "w-2 h-2 border",
  sm: "w-2.5 h-2.5 border-2",
  md: "w-3.5 h-3.5 border-2",
  lg: "w-4 h-4 border-2",
  xl: "w-5 h-5 border-[3px]",
};

// Generates consistent pleasing background colors based on username
const getAvatarBg = (name = "") => {
  const colors = [
    "bg-indigo-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-rose-600",
    "bg-purple-600",
    "bg-cyan-600",
    "bg-blue-600",
    "bg-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function Avatar({
  src,
  name = "User",
  status = null,
  size = "md",
  className = "",
  onClick,
}) {
  const initial = (name || "U").charAt(0).toUpperCase();
  const bg = getAvatarBg(name);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${bg} text-white rounded-full flex items-center justify-center font-semibold shadow-inner`}
        >
          {initial}
        </div>
      )}

      {status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-[#1e1f22] ${
            statusColors[status] || statusColors.offline
          } ${statusSizeClasses[size]}`}
          title={status.toUpperCase()}
        />
      )}
    </div>
  );
}
