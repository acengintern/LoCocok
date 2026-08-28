"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "@/hooks/useAuth";
import { useSettings } from "@/hooks/useSettings";
import {
  GridIcon,
  FolderIcon,
  GroupIcon,
  TaskIcon,
  DocsIcon,
  FileIcon,
  PieChartIcon,
  CalenderIcon,
  UserCircleIcon,
  LockIcon,
  TableIcon,
  TimeIcon,
  SettingsIcon,
  ChevronDownIcon,
  HorizontaLDots,
} from "../icons/index";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  requiredRoles?: string[];
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

// 1. Core Operations & Production Navigation with matching icons
const mainNavItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/dashboard",
  },
  {
    icon: <FolderIcon />,
    name: "Projects",
    subItems: [
      { name: "All Projects", path: "/projects" },
      { name: "My Projects", path: "/projects/my" },
      { name: "Project Calendar", path: "/projects/calendar" },
    ],
  },
  {
    icon: <GroupIcon />,
    name: "Clients",
    path: "/administration/clients",
  },
  {
    icon: <TaskIcon />,
    name: "Production",
    subItems: [
      { name: "All Tasks", path: "/production/tasks" },
      { name: "Daily Workload", path: "/production/workload" },
      { name: "Approval Queue", path: "/production/approval-queue" },
      { name: "Production Board", path: "/production/board" },
      { name: "Additional Load", path: "/production/additional-load" },
    ],
  },
  {
    icon: <DocsIcon />,
    name: "Content Planning",
    subItems: [
      { name: "Briefs", path: "/content/brief" },
      { name: "Content Plans", path: "/content/content-plan" },
      { name: "Script / Ideation", path: "/content/script" },
      { name: "Published Content", path: "/content/published" },
    ],
  },
  {
    icon: <FileIcon />,
    name: "Media & Files",
    path: "/files",
  },
  {
    icon: <PieChartIcon />,
    name: "Reports & Analytics",
    path: "/reports",
  },
  {
    icon: <CalenderIcon />,
    name: "Timeline & Calendar",
    subItems: [
      { name: "Project Calendar", path: "/projects/calendar" },
      { name: "Production Timeline", path: "/timeline" },
    ],
  },
];

// 2. Dedicated Administration Navigation with matching security & data icons
const adminNavItems: NavItem[] = [
  {
    icon: <UserCircleIcon />,
    name: "User Accounts",
    path: "/administration/users",
    requiredRoles: ["System Administrator"],
  },
  {
    icon: <LockIcon />,
    name: "Roles & Permissions",
    path: "/administration/roles",
    requiredRoles: ["System Administrator"],
  },
  {
    icon: <TableIcon />,
    name: "Master Data",
    path: "/administration/master-data",
    requiredRoles: ["System Administrator"],
  },
  {
    icon: <TimeIcon />,
    name: "Activity Audit Log",
    path: "/activity-log",
    requiredRoles: ["System Administrator"],
  },
  {
    icon: <SettingsIcon />,
    name: "System Settings",
    path: "/administration/settings",
    requiredRoles: ["System Administrator"],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuth();
  const { settings } = useSettings();

  // Helper: check if current user has role
  const hasRole = useCallback(
    (roleName: string): boolean => {
      if (!user?.roles) return false;
      return user.roles.some((r: any) => {
        if (typeof r === "string") return r === roleName;
        return r?.name === roleName;
      });
    },
    [user]
  );

  // Filter nav items based on requiredRoles
  const filteredMainNavItems = useMemo(() => {
    return mainNavItems.filter((item) => {
      if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
      return item.requiredRoles.some((role) => hasRole(role));
    });
  }, [hasRole]);

  const filteredAdminNavItems = useMemo(() => {
    return adminNavItems.filter((item) => {
      if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
      return item.requiredRoles.some((role) => hasRole(role));
    });
  }, [hasRole]);

  // Track expanded menu state by menu name
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const isActive = useCallback(
    (path?: string) => {
      if (!path) return false;
      return pathname === path;
    },
    [pathname]
  );

  // Auto-expand menu when active path changes
  useEffect(() => {
    const allNav = [...mainNavItems, ...adminNavItems];
    allNav.forEach((nav) => {
      if (nav.subItems) {
        const isChildActive = nav.subItems.some((s) => s.path === pathname);
        if (isChildActive) {
          setExpandedMenus((prev) => ({
            ...prev,
            [nav.name]: true,
          }));
        }
      }
    });
  }, [pathname]);

  const toggleSubmenu = (menuName: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuName]: !prev[menuName],
    }));
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-1.5">
      {items.map((nav) => {
        const isMenuOpen = !!expandedMenus[nav.name];
        const isChildActive = nav.subItems?.some((s) => isActive(s.path));
        const isParentActive = nav.path ? isActive(nav.path) : false;
        const isItemActive = isChildActive || (!nav.subItems && isParentActive);

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => toggleSubmenu(nav.name)}
                  className={`menu-item group w-full flex items-center justify-between text-left cursor-pointer transition-colors ${
                    isItemActive ? "menu-item-active" : "menu-item-inactive"
                  } ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                  aria-expanded={isMenuOpen}
                  aria-label={`Toggle ${nav.name} submenu`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`${
                        isItemActive
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"
                      }`}
                    >
                      {nav.icon}
                    </span>
                    {(isExpanded || isHovered || isMobileOpen) && (
                      <span className="menu-item-text truncate">{nav.name}</span>
                    )}
                  </div>

                  {/* Toggle Dropdown Chevron */}
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span
                      className={`menu-item-arrow ${
                        isMenuOpen ? "menu-item-arrow-active" : "menu-item-arrow-inactive"
                      }`}
                    >
                      <ChevronDownIcon className="w-4 h-4 transition-transform duration-200" />
                    </span>
                  )}
                </button>

                {/* Submenu Dropdown List */}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isMenuOpen
                        ? "max-h-96 opacity-100 mt-1"
                        : "max-h-0 opacity-0 pointer-events-none"
                    }`}
                  >
                    <ul className="space-y-1 ml-9">
                      {nav.subItems.map((subItem) => (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.path}
                            onClick={() => {
                              if (isMobileOpen) {
                                toggleMobileSidebar();
                              }
                            }}
                            className={`menu-dropdown-item ${
                              isActive(subItem.path)
                                ? "menu-dropdown-item-active"
                                : "menu-dropdown-item-inactive"
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              nav.path && (
                <Link
                  href={nav.path}
                  onClick={() => {
                    if (isMobileOpen) {
                      toggleMobileSidebar();
                    }
                  }}
                  className={`menu-item group ${
                    isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  } ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center"
                      : "lg:justify-start"
                  }`}
                >
                  <span
                    className={`${
                      isActive(nav.path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }`}
                  >
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed top-0 left-0 flex flex-col px-5 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Brand Logo Header & Mobile Close Button */}
      <div
        className={`py-5 px-1 flex items-center justify-between ${
          !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-between"
        }`}
      >
        <Link
          href="/dashboard"
          onClick={() => {
            if (isMobileOpen) {
              toggleMobileSidebar();
            }
          }}
          className="flex items-center"
        >
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-3.5">
              <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 p-1 border border-gray-200/60 dark:border-gray-700/50 shadow-sm shrink-0 overflow-hidden">
                <Image
                  src="/images/logo/logo.jpeg"
                  alt={settings.agency_name || "LOCO TRACK"}
                  width={40}
                  height={40}
                  className="w-full h-full object-contain rounded-lg"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-white leading-tight truncate">
                  {settings.agency_name || "LOCO TRACK"}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-500 dark:text-brand-400 mt-0.5">
                  Agency Workspace
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100/80 dark:bg-gray-800/80 p-1 border border-gray-200/60 dark:border-gray-700/50 shadow-sm overflow-hidden">
              <Image
                src="/images/logo/logo.jpeg"
                alt="Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain rounded-lg"
                priority
              />
            </div>
          )}
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Close Sidebar"
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white transition-colors cursor-pointer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar flex-1 pb-6">
        <nav className="mb-6">
          <div className="flex flex-col gap-6">
            {/* Section 1: Main Operations */}
            <div>
              <h2
                className={`mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center flex"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Operations"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(filteredMainNavItems)}
            </div>

            {/* Section 2: Administration (Protected for System Admin) */}
            {filteredAdminNavItems.length > 0 && (
              <div>
                <h2
                  className={`mb-3 text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 ${
                    !isExpanded && !isHovered
                      ? "lg:justify-center flex"
                      : "justify-start"
                  }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Administration"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(filteredAdminNavItems)}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
