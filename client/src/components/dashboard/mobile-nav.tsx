import React from "react";
import { Link, useLocation } from "wouter";
import { Home, FileText, CheckSquare, Wallet, BarChart3, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function MobileHeader() {
  const { user } = useAuth();
  
  return (
    <div className="lg:hidden bg-gray-800 text-white">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Survey Platform</h1>
        </div>
        <button className="text-gray-300 hover:text-white focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();
  
  const isPartner = user?.role === "partner";
  
  const partnerNavItems = [
    {
      title: "Home",
      href: "/partner/dashboard",
      icon: Home,
    },
    {
      title: "Surveys",
      href: "/partner/surveys",
      icon: FileText,
    },
    {
      title: "Completed",
      href: "/partner/completed-surveys",
      icon: CheckSquare,
    },
    {
      title: "Rewards",
      href: "/partner/rewards",
      icon: Wallet,
    },
  ];

  const businessNavItems = [
    {
      title: "Home",
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
      title: "Profile",
      href: "/business/settings",
      icon: User,
    },
  ];

  const navItems = isPartner ? partnerNavItems : businessNavItems;
  
  return (
    <div className="lg:hidden fixed bottom-0 w-full bg-white border-t border-gray-200">
      <div className="grid grid-cols-4">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center py-3",
                isActive
                  ? "text-primary border-t-2 border-primary"
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs mt-1">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
