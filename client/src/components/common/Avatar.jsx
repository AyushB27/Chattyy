import React from "react";

const statusColorStyles = {
  online: "bg-[#23a55a]",
  idle: "bg-[#f0b232]",
  dnd: "bg-[#f23f43]",
  offline: "bg-[#80848e]",
};

const sizeClasses = {
  xs: "w-5 h-5 text-[10px]",
  sm: "w-8 h-8 text-xs font-semibold",
  md: "w-10 h-10 text-sm font-semibold",
  lg: "w-12 h-12 text-base font-semibold",
  xl: "w-20 h-20 text-2xl font-bold",
};

const statusSizeClasses = {
  xs: "w-2 h-2 border-[1.5px]",
  sm: "w-3 h-3 border-2 -bottom-0.5 -right-0.5",
  md: "w-3.5 h-3.5 border-2 -bottom-0.5 -right-0.5",
  lg: "w-4 h-4 border-[2.5px] -bottom-0.5 -right-0.5",
  xl: "w-5 h-5 border-[3px] bottom-0 right-0",
};

const getAvatarBg = (name = "") => {
  const colors = [
    "bg-[#5865f2]",
    "bg-[#57f287]",
    "bg-[#fee75c]",
    "bg-[#eb459e]",
    "bg-[#ed4245]",
    "bg-[#5865f2]",
    "bg-[#3ba55d]",
    "bg-[#faa81a]",
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
          className={`${sizeClasses[size]} ${bg} text-white rounded-full flex items-center justify-center`}
        >
          {initial}
        </div>
      )}

      {status && (
        <span
          className={`absolute rounded-full border-[#1e1f22] ${
            statusColorStyles[status] || statusColorStyles.offline
          } ${statusSizeClasses[size]}`}
          title={status.toUpperCase()}
        />
      )}
    </div>
  );
}
