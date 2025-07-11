import { User, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Header = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const tabs = [
    { value: "/", label: "Dashboard" },
    { value: "/safety", label: "Safety" },
    { value: "/quality", label: "Quality" },
    { value: "/cost", label: "Cost" },
    { value: "/inventory", label: "Inventory" },
    { value: "/delivery", label: "Delivery" },
    { value: "/production", label: "Production" },
    { value: "/graph-view", label: "Graph View" }
  ];

  return (
    <header className="bg-gradient-header text-navy-foreground border-b border-navy/20 shadow-lg">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between mb-3">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-navy-foreground rounded-lg flex items-center justify-center">
              <span className="text-navy font-bold text-sm">KPI</span>
            </div>
            <span className="text-lg font-semibold">Operations Dashboard</span>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="hover:bg-navy/20">
                <User className="w-4 h-4 mr-2" />
                Admin User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs value={currentPath} className="w-full">
          <TabsList className="grid grid-cols-8 w-full bg-navy/20">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value}
                asChild
                className="data-[state=active]:bg-navy-foreground data-[state=active]:text-navy"
              >
                <Link to={tab.value}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
};