import { ThemeSwitcher } from "../layout/theme-switch";
import { Button } from "@/components/UI/button";
import { Icon } from "../UI/icons/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "../UI/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../UI/popover";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { P } from "../UI/typography";

function DashboardHeader({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-10 flex h-15 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <Icon
          name={isCollapsed ? "ChevronDoubleRight" : "ChevronDoubleLeft"}
          size="md"
        />
      </Button>

      <P className="w-full">Insurance portal</P>

      <div className="flex w-full items-center justify-end gap-4">
        <ThemeSwitcher />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size="md" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="text-sm font-semibold mb-2">Notifications</div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>No new notifications.</p>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user?.avatar_url} alt="@shadcn" />
              <AvatarFallback>{}</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-4" align="end">
            <div className="text-sm font-medium mb-1">{user?.name}</div>
            <div className="text-sm text-muted-foreground mb-3">
              {user?.email}
            </div>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" onClick={handleProfileClick}>
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleSettingsClick}>
                Settings
              </Button>
              <Button variant="destructive" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}

export default DashboardHeader;
