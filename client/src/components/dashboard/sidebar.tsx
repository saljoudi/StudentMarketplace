import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "wouter";
import {
  Home,
  FileText,
  CheckSquare,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  User,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isPartner = user?.role === "partner";
  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.username.substring(0, 2).toUpperCase();

  const partnerNavItems = [
    {
      title: "Dashboard",
      href: "/partner/dashboard",
      icon: Home,
    },
    {
      title: "Available Surveys",
      href: "/partner/surveys",
      icon: FileText,
    },
    {
      title: "Completed Surveys",
      href: "/partner/completed-surveys",
      icon: CheckSquare,
    },
    {
      title: "Rewards Wallet",
      href: "/partner/rewards",
      icon: Wallet,
    },
  ];

  const businessNavItems = [
    {
      title: "Dashboard",
      href: "/business/dashboard",
      icon: Home,
    },
    {
      title: "Surveys",
      href: "/business/surveys",
      icon: FileText,
    },
    {
      title: "Results",
      href: "/business/results",
      icon: BarChart3,
    },
    {
      title: "Settings",
      href: "/business/settings",
      icon: Settings,
    },
  ];

  const navItems = isPartner ? partnerNavItems : businessNavItems;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className={cn("hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-gray-800 text-white", className)}>
      <div className="flex items-center justify-center h-16 px-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Survey Platform</h1>
      </div>

      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  isActive
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white",
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md"
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-medium">{userInitials}</span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.fullName || user?.username}</p>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-gray-400 hover:text-gray-300 flex items-center"
            >
              <LogOut className="h-3 w-3 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
