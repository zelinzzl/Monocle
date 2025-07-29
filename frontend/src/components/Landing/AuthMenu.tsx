import Link from "next/link";
import { Menubar } from "../UI/menubar";

function AuthMenu() {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Menubar className="w-fit h-fit rounded-full px-6 py-2 bg-blue-20/30 border border-white/20 shadow-sm backdrop-blur-md ">
        <Link
          href="login"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Login
        </Link>

        {/* <Separator orientation="vertical" className="w-10 h-6 bg-red-50" /> */}
        <span className="px-2 text-muted-foreground">|</span>

        <Link
          href="signup"
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Signup
        </Link>
      </Menubar>
    </div>
  );
}

export default AuthMenu;
