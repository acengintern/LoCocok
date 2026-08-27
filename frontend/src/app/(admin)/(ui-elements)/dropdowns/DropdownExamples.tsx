"use client";
import React, { useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import Select from "@/components/form/Select";
import Label from "@/components/form/Label";

export default function DropdownExamples() {
  // Dropdown 1: Default
  const [isOpen1, setIsOpen1] = useState(false);
  // Dropdown 2: With Divider
  const [isOpen2, setIsOpen2] = useState(false);
  // Dropdown 3: With Icon
  const [isOpen3, setIsOpen3] = useState(false);
  // Dropdown 4: With Icon & Divider
  const [isOpen4, setIsOpen4] = useState(false);

  // Form Select Demo
  const [selectedCity, setSelectedCity] = useState("jkt");
  const [selectedRole, setSelectedRole] = useState("");

  const cityOptions = [
    { value: "jkt", label: "Jakarta (ID)" },
    { value: "bdg", label: "Bandung (ID)" },
    { value: "sby", label: "Surabaya (ID)" },
    { value: "sin", label: "Singapore (SG)" },
    { value: "kl", label: "Kuala Lumpur (MY)" },
    { value: "tok", label: "Tokyo (JP)" },
  ];

  const roleOptions = [
    { value: "admin", label: "System Administrator" },
    { value: "pm", label: "Project Manager" },
    { value: "designer", label: "UI/UX Designer" },
    { value: "developer", label: "Full-Stack Engineer" },
    { value: "qa", label: "QA Specialist" },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Form Select Dropdown Showcase */}
      <ComponentCard title="Custom Form Select Dropdowns (New)">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>Select Location</Label>
            <Select
              options={cityOptions}
              value={selectedCity}
              onChange={(val) => setSelectedCity(val)}
              placeholder="Choose a location"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Selected Value: <span className="font-semibold text-brand-500">{selectedCity}</span>
            </p>
          </div>

          <div>
            <Label>Assign User Role</Label>
            <Select
              options={roleOptions}
              value={selectedRole}
              onChange={(val) => setSelectedRole(val)}
              placeholder="Select user role"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Selected Value: <span className="font-semibold text-brand-500">{selectedRole || "None"}</span>
            </p>
          </div>
        </div>
      </ComponentCard>

      {/* Grid of 4 TailAdmin Dropdown Styles */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2 xl:gap-6">
        {/* 1. Default Dropdown */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Default Dropdown
            </h3>
          </div>
          <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
            <div className="space-y-6 pb-48">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsOpen1(!isOpen1)}
                  className="dropdown-toggle inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  Account Menu
                  <svg
                    className={`stroke-current duration-200 ease-in-out ${isOpen1 ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
                      stroke=""
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <Dropdown
                  isOpen={isOpen1}
                  onClose={() => setIsOpen1(false)}
                  className="absolute left-0 top-full z-40 mt-2 w-full min-w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]"
                >
                  <ul className="flex flex-col gap-1">
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen1(false)}
                        className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        Edit Profile
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen1(false)}
                        className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        Account Settings
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen1(false)}
                        className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        License
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen1(false)}
                        className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        Support
                      </DropdownItem>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Dropdown With Divider */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Dropdown With Divider
            </h3>
          </div>
          <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
            <div className="space-y-6 pb-48">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsOpen2(!isOpen2)}
                  className="dropdown-toggle inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  Options
                  <svg
                    className={`stroke-current duration-200 ease-in-out ${isOpen2 ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
                      stroke=""
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <Dropdown
                  isOpen={isOpen2}
                  onClose={() => setIsOpen2(false)}
                  className="absolute left-0 top-full z-40 mt-2 w-full min-w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]"
                >
                  <ul className="flex flex-col gap-1">
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen2(false)}
                        className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        View Details
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen2(false)}
                        className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        Edit Item
                      </DropdownItem>
                    </li>
                    <li>
                      <span className="my-1.5 block h-px w-full bg-gray-200 dark:bg-[#353C49]" />
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen2(false)}
                        className="flex rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        Delete
                      </DropdownItem>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Dropdown With Icon */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Dropdown With Icon
            </h3>
          </div>
          <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
            <div className="space-y-6 pb-48">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsOpen3(!isOpen3)}
                  className="dropdown-toggle inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  Settings
                  <svg
                    className={`stroke-current duration-200 ease-in-out ${isOpen3 ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
                      stroke=""
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <Dropdown
                  isOpen={isOpen3}
                  onClose={() => setIsOpen3(false)}
                  className="absolute left-0 top-full z-40 mt-2 w-full min-w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]"
                >
                  <ul className="flex flex-col gap-1">
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen3(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 1116 0H2z" fill="currentColor"/>
                        </svg>
                        Edit Profile
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen3(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20" fill="none">
                          <path fillRule="evenodd" clipRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" fill="currentColor"/>
                        </svg>
                        Account Settings
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen3(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20" fill="none">
                          <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" fill="currentColor"/>
                        </svg>
                        Support Center
                      </DropdownItem>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Dropdown With Icon & Divider */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="px-6 py-5">
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              Dropdown With Icon and Divider
            </h3>
          </div>
          <div className="border-t border-gray-100 p-4 sm:p-6 dark:border-gray-800">
            <div className="space-y-6 pb-48">
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsOpen4(!isOpen4)}
                  className="dropdown-toggle inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
                >
                  More Actions
                  <svg
                    className={`stroke-current duration-200 ease-in-out ${isOpen4 ? "rotate-180" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
                      stroke=""
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <Dropdown
                  isOpen={isOpen4}
                  onClose={() => setIsOpen4(false)}
                  className="absolute left-0 top-full z-40 mt-2 w-full min-w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]"
                >
                  <ul className="flex flex-col gap-1">
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen4(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20" fill="none">
                          <path d="M10 2a4 4 0 100 8 4 4 0 000-8zM2 18a8 8 0 1116 0H2z" fill="currentColor"/>
                        </svg>
                        Edit Profile
                      </DropdownItem>
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen4(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
                      >
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20" fill="none">
                          <path fillRule="evenodd" clipRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" fill="currentColor"/>
                        </svg>
                        Files
                      </DropdownItem>
                    </li>
                    <li>
                      <span className="my-1.5 block h-px w-full bg-gray-200 dark:bg-[#353C49]" />
                    </li>
                    <li>
                      <DropdownItem
                        onItemClick={() => setIsOpen4(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <svg className="fill-current h-5 w-5" viewBox="0 0 20 20" fill="none">
                          <path fillRule="evenodd" clipRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" fill="currentColor"/>
                        </svg>
                        Delete
                      </DropdownItem>
                    </li>
                  </ul>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
