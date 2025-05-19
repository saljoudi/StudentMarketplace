import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface RoleBadgeProps {
  role: "partner" | "business";
  active?: boolean;
  className?: string;
  onClick?: () => void;
}

export function RoleBadge({ role, active = false, className, onClick }: RoleBadgeProps) {
  const variants = {
    partner: {
      active: "bg-primary text-primary-foreground hover:bg-primary/90",
      inactive: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    },
    business: {
      active: "bg-primary text-primary-foreground hover:bg-primary/90",
      inactive: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    },
  };

  const variant = active ? variants[role].active : variants[role].inactive;

  return (
    <Badge 
      variant="outline"
      className={cn(
        "text-xs px-3 py-1 cursor-pointer transition-colors",
        variant,
        className
      )}
      onClick={onClick}
    >
      {role === "partner" ? "Partner" : "Business"}
    </Badge>
  );
}
