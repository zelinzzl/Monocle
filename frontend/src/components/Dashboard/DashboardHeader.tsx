import { ThemeSwitcher } from "../layout/theme-switch";
import { Button } from "@/components/UI/button";
import { Icon } from "../UI/icons/Icon";
import { Avatar, AvatarFallback, AvatarImage } from "../UI/avatar";

function DashboardHeader({
  isCollapsed,
  setIsCollapsed,
}: {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}) {
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
      <ThemeSwitcher />

      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto">
          <Avatar>
            <AvatarImage src="/avatars/01.png" alt="@shadcn" />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default DashboardHeader;
