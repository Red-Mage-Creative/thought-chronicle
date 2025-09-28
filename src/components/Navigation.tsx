import { Home, Users, History, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Navigation = () => {
  const [open, setOpen] = useState(false);

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/entities", icon: Users, label: "Entities" },
    { to: "/history", icon: History, label: "History" },
  ];

  return (
    <>
      {/* Desktop Navigation - Horizontal */}
      <nav className="hidden md:flex items-center">
        {navItems.map(({ to, icon: Icon, label }, index) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2 py-2 px-3 text-sm font-medium transition-colors ${
                index > 0 ? "border-l border-border" : ""
              } ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-foreground hover:bg-muted"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Mobile Navigation - Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Navigation</h2>
            <nav className="space-y-2">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted/50 transition-colors rounded-md ${
                      isActive ? "bg-primary text-primary-foreground" : ""
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};