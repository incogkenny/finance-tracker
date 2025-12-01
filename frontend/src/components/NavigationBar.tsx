import { Link } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar.tsx";
import { Home, Activity, PieChart, Layers } from "lucide-react";

export default function NavigationBar() {
  const IsLoggedIn = Boolean(localStorage.getItem("access"));
  if (!IsLoggedIn) {
    return null;
  }

  // const handleLogout = () => {
  //   localStorage.removeItem("access");
  //   localStorage.removeItem("refresh");
  //   navigate("/logout");
  // };

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    { title: "Transactions", url: "/transactions", icon: Activity },
    { title: "Analytics", url: "/analytics", icon: PieChart },
    { title: "Categories", url: "/categories", icon: Layers },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Welcome</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
