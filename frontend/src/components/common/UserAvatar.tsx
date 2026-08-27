"use client";

import React, { useState } from "react";

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  src,
  name = "User",
  size = 44,
  className = "",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  // Generate 1-2 initials from user name
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

  // Deterministic palette for initials
  const getAvatarGradient = (str: string) => {
    const gradients = [
      "from-blue-600 to-indigo-600",
      "from-violet-600 to-purple-600",
      "from-emerald-600 to-teal-600",
      "from-amber-500 to-orange-600",
      "from-rose-500 to-pink-600",
      "from-cyan-500 to-blue-600",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % gradients.length;
    return gradients[index];
  };

  const gradientClass = getAvatarGradient(name);
  const isValidUrl = Boolean(
    src &&
      src.trim() !== "" &&
      !src.includes("owner.jpg") &&
      !src.includes("undefined") &&
      !src.includes("null")
  );

  if (isValidUrl && !hasError) {
    return (
      <div
        className={`relative overflow-hidden rounded-full shrink-0 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      >
        <img
          src={src!}
          alt={name}
          className="h-full w-full object-cover rounded-full"
          onError={() => setHasError(true)}
          loading="eager"
        />
      </div>
    );
  }

  // Fallback: Elegant initial badge with gradient & subtle shadow
  return (
    <div
      className={`relative flex items-center justify-center rounded-full shrink-0 bg-gradient-to-tr ${gradientClass} text-white font-semibold shadow-xs select-none ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(12, Math.round(size * 0.4))}px`,
      }}
      title={name}
    >
      <span>{initials}</span>
    </div>
  );
}
