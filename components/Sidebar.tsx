"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Sun, Fuel, History, Settings, Zap,
  ChevronLeft, ChevronRight, HelpCircle, Bell, User,
  LogOut, BarChart3, Menu, X, Clock, Shield, Sparkles,
  ChevronDown,
} from "lucide-react";

/* ═══ Types ═══ */
interface MenuItemType {
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  href: string;
  badge?: string;
  badgeColor?: string;
  useRouter?: boolean;
}

/* ═══ Menu Config ═══ */
const menuItems: MenuItemType[] = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", useRouter: true },
  { name: "AI Forecast", icon: Sun, href: "/predict", badge: "AI", badgeColor: "orange" },
  { name: "Solar Times", icon: Clock, href: "/solar-insights" },
  { name: "Fuel Management", icon: Fuel, href: "/fuel" },
  { name: "History", icon: History, href: "/history" },
  { name: "Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Users", icon: User, href: "/?tab=users" },
];

const bottomMenuItems: MenuItemType[] = [
  { name: "Settings", icon: Settings, href: "/settings" },
  { name: "Help & Support", icon: HelpCircle, href: "/help" },
];

/* ═══ 3D Floating Logo ═══ */
function Logo3D({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="relative" style={{ perspective: "200px" }}>
      <div
        className="absolute inset-0 rounded-xl blur-lg opacity-50"
        style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
      />
      <div
        className="absolute -bottom-1 left-0.5 rounded-xl opacity-25 blur-sm"
        style={{
          width: collapsed ? 36 : 40,
          height: collapsed ? 36 : 40,
          background: "#000",
        }}
      />
      <div
        className="relative rounded-xl flex items-center justify-center shadow-lg transition-all duration-300"
        style={{
          width: collapsed ? 36 : 40,
          height: collapsed ? 36 : 40,
          background: "linear-gradient(135deg, #f97316, #ea580c)",
          transform: "translateZ(6px)",
          boxShadow:
            "0 8px 24px rgba(249,115,22,0.35), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <Zap
          size={collapsed ? 16 : 20}
          className="text-white drop-shadow-sm"
          fill="currentColor"
        />
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 50%)",
          }}
        />
      </div>
    </div>
  );
}

/* ═══ 3D Menu Item Wrapper ═══ */
function MenuItem3D({
  children,
  isActive,
  isCollapsed,
}: {
  children: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {isActive && (
        <>
          <div
            className="absolute inset-0 rounded-xl blur-md opacity-30 transition-opacity duration-300"
            style={{ background: "linear-gradient(135deg, #f97316, #ea580c)" }}
          />
          {!isCollapsed && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-white rounded-r-full shadow-sm shadow-white/50" />
          )}
        </>
      )}
      {hovering && !isActive && (
        <div className="absolute inset-0 rounded-xl bg-white/[0.04] transition-opacity duration-200" />
      )}
      <div
        className="relative transition-transform duration-200"
        style={{
          transform:
            hovering && !isActive ? "translateX(2px)" : "translateX(0)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══ Collapsible Section ═══ */
function CollapsibleSection({
  label,
  isOpen,
  onToggle,
  isCollapsed,
  icon,
  accentColor = "white",
  children,
  itemCount,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  icon?: React.ReactNode;
  accentColor?: "white" | "orange";
  children: React.ReactNode;
  itemCount?: number;
}) {
  return (
    <div>
      {/* Section header / toggle */}
      {isCollapsed ? (
        <div className="flex justify-center py-2">
          <button
            onClick={onToggle}
            className="group relative flex items-center justify-center w-10 h-6 rounded-lg hover:bg-white/[0.06] transition-all duration-200"
            title={`${isOpen ? "Hide" : "Show"} ${label}`}
          >
            <div className="flex gap-0.5 items-center">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-1 h-1 rounded-full transition-colors duration-200 ${isOpen ? "bg-orange-400/60" : "bg-white/20"
                    }`}
                />
              ))}
            </div>
            <ChevronDown
              size={8}
              className={`absolute -bottom-0.5 text-white/20 transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                }`}
            />
          </button>
        </div>
      ) : (
        <div className="px-3 py-1.5">
          <button
            onClick={onToggle}
            className="w-full group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.04] transition-all duration-200"
          >
            {icon && (
              <div className="flex-shrink-0 text-white/15 group-hover:text-white/25 transition-colors duration-200">
                {icon}
              </div>
            )}
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-200 ${isOpen
                  ? accentColor === "orange"
                    ? "text-orange-400/50"
                    : "text-white/25"
                  : "text-white/15 group-hover:text-white/25"
                }`}
            >
              {label}
            </span>
            <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />

            {/* Item count badge */}
            {itemCount !== undefined && (
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md transition-all duration-200 ${isOpen
                    ? "bg-orange-500/15 text-orange-400/60"
                    : "bg-white/5 text-white/20"
                  }`}
              >
                {itemCount}
              </span>
            )}

            {/* Chevron */}
            <div
              className={`flex-shrink-0 p-0.5 rounded transition-all duration-300 ${isOpen
                  ? "bg-orange-500/10 text-orange-400/60"
                  : "text-white/20 group-hover:text-white/40"
                }`}
            >
              <ChevronDown
                size={12}
                className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""
                  }`}
              />
            </div>
          </button>
        </div>
      )}

      {/* Collapsible content */}
      <div
        className="overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          maxHeight: isOpen ? "600px" : "0px",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(-4px)",
          transition:
            "max-height 400ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms ease, transform 300ms ease",
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ═══ SIDEBAR ═══ */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  /* ── Section toggle states ── */
  const [navOpen, setNavOpen] = useState(true);
  const [sysOpen, setSysOpen] = useState(false);

  useEffect(() => {
    setCurrentTab(searchParams.get("tab"));
  }, [searchParams]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname, searchParams]);

  /* Auto-expand section when active item is inside it */
  useEffect(() => {
    const isNavActive = menuItems.some((item) => isActive(item));
    const isSysActive = bottomMenuItems.some(
      (item) => pathname === item.href
    );
    if (isNavActive && !navOpen) setNavOpen(true);
    if (isSysActive && !sysOpen) setSysOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, currentTab]);

  const toggleSidebar = () => setIsCollapsed((v) => !v);
  const toggleMobile = () => setIsMobileOpen((v) => !v);

  const handleLogout = async () => {
    try {
      const r = await fetch("/api/auth/logout", { method: "POST" });
      if (r.ok) router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  const handleMenuClick = (item: MenuItemType, e: React.MouseEvent) => {
    setIsMobileOpen(false);
    if (item.useRouter) {
      e.preventDefault();
      router.push(item.href);
    }
  };

  const isActive = (item: MenuItemType) => {
    if (item.name === "Users") return pathname === "/" && currentTab === "users";
    if (item.name === "Dashboard") return pathname === "/" && !currentTab;
    return pathname === item.href;
  };

  const sidebarW = isCollapsed ? "w-[76px]" : "w-[270px]";

  return (
    <>
      {/* ── Mobile Hamburger ── */}
      <button
        onClick={toggleMobile}
        aria-label="Toggle navigation"
        className={`
          lg:hidden fixed top-4 left-4 z-[60] p-2.5 rounded-xl
          bg-gradient-to-br from-blue-950 to-blue-900 text-white
          shadow-lg shadow-blue-950/50 border border-blue-800/50
          backdrop-blur-sm transition-all duration-200 active:scale-95
          ${isMobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
      >
        <Menu size={22} />
      </button>

      {/* ── Mobile Overlay ── */}
      <div
        className={`
          lg:hidden fixed inset-0 z-[49] transition-all duration-300
          ${isMobileOpen
            ? "bg-black/60 backdrop-blur-sm visible"
            : "bg-black/0 invisible pointer-events-none"
          }
        `}
        onClick={toggleMobile}
      />

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-50 h-screen ${sidebarW}
          flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
          lg:flex-shrink-0
        `}
        style={{
          minWidth: isCollapsed ? 76 : 270,
          background:
            "linear-gradient(180deg, #0a1628 0%, #0c1a3a 40%, #0f1f40 100%)",
        }}
      >
        {/* ── Background effects ── */}
        <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-orange-500/50 via-blue-500/20 to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-10 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* ── Header / Logo ── */}
        <div
          className={`relative flex items-center gap-3 h-[68px] border-b border-white/[0.06] flex-shrink-0 ${isCollapsed ? "justify-center px-3" : "px-5"
            }`}
        >
          <Logo3D collapsed={isCollapsed} />
          {!isCollapsed && (
            <div className="overflow-hidden">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-white tracking-wider leading-tight">
                  LAKDHANVI
                </h1>
                <span className="text-[8px] font-bold text-orange-400 bg-orange-500/15 px-1.5 py-0.5 rounded border border-orange-500/20">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-orange-400/60 font-medium tracking-wide">
                Solar Energy System
              </p>
            </div>
          )}
          <button
            onClick={toggleMobile}
            className="lg:hidden ml-auto p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* ── User Card ── */}
        <div
          className={`flex-shrink-0 ${isCollapsed ? "px-2 py-3" : "px-4 py-3"}`}
        >
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 rounded-full bg-orange-500/20 scale-0 group-hover:scale-125 transition-transform duration-300 blur-sm" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center ring-2 ring-orange-500/20 group-hover:ring-orange-500/40 transition-all shadow-lg shadow-orange-500/20">
                  <User size={16} className="text-white" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-500 rounded-full ring-2 ring-[#0c1a3a] animate-pulse" />
              </div>
            </div>
          ) : (
            <div
              className="relative group flex items-center gap-3 p-3 rounded-xl overflow-hidden cursor-pointer transition-all duration-300"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/30 transition-shadow">
                  <User size={16} className="text-white" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#0c1a3a]">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-50" />
                </div>
              </div>
              <div className="relative flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate leading-tight">
                  Admin User
                </p>
                <p className="text-[11px] text-white/30 truncate">
                  admin@lakdhanvi.com
                </p>
              </div>
              <button className="relative p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 group/bell">
                <Bell
                  size={16}
                  className="text-white/40 group-hover/bell:text-white/70 transition-colors"
                />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-[#0c1a3a]" />
              </button>
            </div>
          )}
        </div>

        {/* ── Scrollable Area ── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <style jsx global>{`
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {/* ══════════ NAVIGATION SECTION ══════════ */}
          <CollapsibleSection
            label="Navigation"
            isOpen={navOpen}
            onToggle={() => setNavOpen((v) => !v)}
            isCollapsed={isCollapsed}
            itemCount={menuItems.length}
            accentColor="orange"
          >
            <nav className="px-3 pb-2 space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item);
                return (
                  <MenuItem3D
                    key={item.name}
                    isActive={active}
                    isCollapsed={isCollapsed}
                  >
                    <Link
                      href={item.href}
                      onClick={(e) => handleMenuClick(item, e)}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`
                        relative flex items-center gap-3 rounded-xl transition-all duration-200
                        ${isCollapsed
                          ? "justify-center p-2.5 mx-auto w-12 h-12"
                          : "px-4 py-2.5"
                        }
                        ${active
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                          : "text-white/45 hover:text-white/80"
                        }
                      `}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className="relative flex-shrink-0">
                        {active && (
                          <div
                            className="absolute inset-0 blur-md opacity-40"
                            style={{
                              background:
                                "radial-gradient(circle, #fbbf24, transparent)",
                              transform: "scale(2)",
                            }}
                          />
                        )}
                        <item.icon
                          size={20}
                          className={`relative transition-all duration-200 ${active
                              ? "text-white drop-shadow-sm"
                              : hoveredItem === item.name
                                ? "text-white/80 scale-110"
                                : "text-current"
                            }`}
                        />
                      </div>
                      {!isCollapsed && (
                        <>
                          <span className="text-[13px] font-semibold flex-1 tracking-wide">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span
                              className={`
                                text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wider
                                ${active
                                  ? "bg-white/25 text-white shadow-sm"
                                  : "bg-orange-500/15 text-orange-400 border border-orange-500/20"
                                }
                              `}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                      {active && (
                        <div className="absolute inset-0 rounded-xl pointer-events-none overflow-hidden">
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                            }}
                          />
                        </div>
                      )}
                    </Link>

                    {/* Collapsed tooltip */}
                    {isCollapsed && hoveredItem === item.name && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] pointer-events-none">
                        <div
                          className="relative px-3 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap shadow-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, #1e293b, #0f172a)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                          }}
                        >
                          <div
                            className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
                            style={{
                              background: "#1e293b",
                              borderLeft:
                                "1px solid rgba(255,255,255,0.1)",
                              borderBottom:
                                "1px solid rgba(255,255,255,0.1)",
                            }}
                          />
                          {item.name}
                          {item.badge && (
                            <span className="ml-2 text-[8px] text-orange-400 bg-orange-500/20 px-1.5 py-0.5 rounded">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </MenuItem3D>
                );
              })}
            </nav>
          </CollapsibleSection>

          {/* ══════════ SYSTEM SECTION ══════════ */}
          <CollapsibleSection
            label="System"
            isOpen={sysOpen}
            onToggle={() => setSysOpen((v) => !v)}
            isCollapsed={isCollapsed}
            itemCount={bottomMenuItems.length + 1}
            accentColor="white"
          >
            <div className="px-3 pb-2 space-y-0.5">
              {bottomMenuItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={`
                      relative group flex items-center gap-3 rounded-xl transition-all duration-200
                      ${isCollapsed
                        ? "justify-center p-2.5 mx-auto w-12 h-12"
                        : "px-4 py-2.5"
                      }
                      ${active
                        ? "bg-white/10 text-white"
                        : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                      }
                    `}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <item.icon
                      size={18}
                      className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                    />
                    {!isCollapsed && (
                      <span className="text-[13px] font-medium">
                        {item.name}
                      </span>
                    )}
                    {isCollapsed && hoveredItem === item.name && (
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] pointer-events-none">
                        <div
                          className="relative px-3 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap shadow-xl"
                          style={{
                            background:
                              "linear-gradient(135deg, #1e293b, #0f172a)",
                            border: "1px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          <div
                            className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
                            style={{
                              background: "#1e293b",
                              borderLeft:
                                "1px solid rgba(255,255,255,0.1)",
                              borderBottom:
                                "1px solid rgba(255,255,255,0.1)",
                            }}
                          />
                          {item.name}
                        </div>
                      </div>
                    )}
                  </Link>
                );
              })}

              {/* ── Divider ── */}
              {!isCollapsed && (
                <div className="px-4 py-1">
                  <div className="h-px bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent" />
                </div>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                onMouseEnter={() => setHoveredItem("logout")}
                onMouseLeave={() => setHoveredItem(null)}
                className={`
                  relative w-full group flex items-center gap-3 rounded-xl transition-all duration-200
                  ${isCollapsed
                    ? "justify-center p-2.5 mx-auto w-12 h-12"
                    : "px-4 py-2.5"
                  }
                  text-red-400/40 hover:text-red-400 hover:bg-red-500/10
                `}
                title={isCollapsed ? "Logout" : undefined}
              >
                <LogOut
                  size={18}
                  className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110 group-hover:-translate-x-0.5"
                />
                {!isCollapsed && (
                  <span className="text-[13px] font-medium">Logout</span>
                )}
                {isCollapsed && hoveredItem === "logout" && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[100] pointer-events-none">
                    <div
                      className="relative px-3 py-2 rounded-xl text-xs font-bold text-red-400 whitespace-nowrap shadow-xl"
                      style={{
                        background:
                          "linear-gradient(135deg, #1e293b, #0f172a)",
                        border: "1px solid rgba(248,113,113,0.2)",
                      }}
                    >
                      <div
                        className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45"
                        style={{
                          background: "#1e293b",
                          borderLeft:
                            "1px solid rgba(248,113,113,0.2)",
                          borderBottom:
                            "1px solid rgba(248,113,113,0.2)",
                        }}
                      />
                      Logout
                    </div>
                  </div>
                )}
              </button>
            </div>
          </CollapsibleSection>
        </div>

        {/* ── System Status ── */}
        {!isCollapsed ? (
          <div className="flex-shrink-0 px-4 pb-4 pt-1">
            <div
              className="relative p-3.5 rounded-xl overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.03))",
                border: "1px solid rgba(16, 185, 129, 0.12)",
              }}
            >
              <div className="absolute top-3 left-3">
                <div className="relative">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                  <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-40" />
                </div>
              </div>
              <div className="ml-5">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-400/90 tracking-wide">
                    System Online
                  </span>
                  <Shield size={10} className="text-emerald-400/50" />
                </div>
                <p className="text-[10px] text-white/20 mt-0.5">
                  All services running • Uptime 99.9%
                </p>
              </div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-emerald-400/5 rounded-full -translate-x-2 translate-y-4 blur-xl pointer-events-none" />
            </div>
          </div>
        ) : (
          <div
            className="flex-shrink-0 flex justify-center pb-4 pt-2"
            title="System Online • All services running"
          >
            <div className="relative">
              <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50" />
              <div className="absolute inset-0 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping opacity-30" />
            </div>
          </div>
        )}

        {/* ── Branding Footer ── */}
        {!isCollapsed && (
          <div className="flex-shrink-0 px-4 pb-3">
            <div className="flex items-center justify-center gap-1.5 py-2">
              <Sparkles size={10} className="text-white/10" />
              <span className="text-[9px] text-white/10 font-medium tracking-widest uppercase">
                Powered by AI
              </span>
              <Sparkles size={10} className="text-white/10" />
            </div>
          </div>
        )}

        {/* ── Collapse Toggle (Desktop) ── */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex absolute -right-3.5 top-[72px] w-7 h-7 rounded-full items-center justify-center z-10 transition-all duration-200 group/toggle active:scale-90"
          style={{
            background: "linear-gradient(135deg, #0f1f40, #0c1a3a)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 4px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <div className="absolute inset-0 rounded-full bg-orange-500 opacity-0 group-hover/toggle:opacity-100 transition-opacity duration-200" />
          <div className="relative">
            {isCollapsed ? (
              <ChevronRight
                size={14}
                className="text-white/50 group-hover/toggle:text-white transition-colors"
              />
            ) : (
              <ChevronLeft
                size={14}
                className="text-white/50 group-hover/toggle:text-white transition-colors"
              />
            )}
          </div>
        </button>
      </aside>
    </>
  );
}