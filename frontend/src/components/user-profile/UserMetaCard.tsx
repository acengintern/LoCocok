"use client";
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import Badge from "../ui/badge/Badge";
import UserAvatar from "../common/UserAvatar";

interface UserMetaCardProps {
  onEdit?: () => void;
}

export default function UserMetaCard({ onEdit }: UserMetaCardProps) {
  const { user } = useAuth();

  const displayName = user?.name ?? "User";
  const username = user?.username
    ? `@${user.username}`
    : user?.email
    ? `@${user.email.split("@")[0]}`
    : "@user";

  const displayRole =
    user?.roles && user.roles.length > 0
      ? typeof user.roles[0] === "string"
      : "Team Member";

  const isGoogleLinked = Boolean(user?.google_id || user?.email_verified_at);
  const status = user?.status || "Active";
  const isStatusActive = status.toLowerCase() === "active";

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    } else {
      const el = document.getElementById("personal-info-card");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl bg-white dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            <UserAvatar
              src={user?.avatar}
              name={displayName}
              size={80}
              className="border-2 border-brand-500/20 dark:border-brand-500/30"
            />
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {displayName}
              </h4>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {username}
              </span>
            </div>

            {/* Badges & Meta Info */}
            <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {/* Role Badge */}
              <Badge variant="light" color="primary" size="sm">
                {displayRole}
              </Badge>

              {/* Status Badge */}
              <Badge
                variant="light"
                color={isStatusActive ? "success" : "warning"}
                size="sm"
              >
                {status.toUpperCase()}
              </Badge>

              {/* Google Verified Badge */}
              {isGoogleLinked && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-theme-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
                  <svg
                    className="h-3.5 w-3.5 fill-current text-emerald-600 dark:text-emerald-400"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  Google Verified
                </span>
              )}
            </div>

            {/* Secondary Meta: Email & Join Date */}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 sm:justify-start">
              <span className="flex items-center gap-1">
                <svg
                  className="h-3.5 w-3.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {user?.email ?? "—"}
              </span>

              {joinDate && (
                <span className="flex items-center gap-1">
                  <svg
                    className="h-3.5 w-3.5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Member since {joinDate}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center sm:justify-end">
          <button
            onClick={handleEditClick}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-white/[0.03] dark:hover:text-white transition-colors cursor-pointer"
          >
            <svg
              className="h-4 w-4 fill-current"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
