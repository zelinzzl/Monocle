import { Icon } from "../ui/icons/Icon";
import { P } from "../ui/typography";

export default function Footer() {
  return (
    <footer className="flex flex-row justify-between p-4  ">
      <P className="text-primary">@Monocle</P>

      <a
        href="https://github.com/zelinzzl/Monocle"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Icon name="Github" isLottie className="cursor-pointer" />
      </a>
    </footer>
  );
}
