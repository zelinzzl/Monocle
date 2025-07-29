import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import { ThemeSwitcher } from "../layout/theme-switch";

function DashboardHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-15 items-center gap-4 border-b bg-background px-4 md:px-6">
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
