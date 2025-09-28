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

  const NavContent = () => (
    <nav className="space-y-2">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 text-foreground hover:bg-muted/50 transition-colors ${
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
  );

  return (
    <>
      {/* Desktop Navigation */}
      <aside className="hidden lg:block w-64 bg-card border-r border-border">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Navigation</h2>
          <NavContent />
        </div>
      </aside>

      {/* Mobile Navigation */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 bg-card">
          <div className="pt-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Navigation</h2>
            <NavContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};