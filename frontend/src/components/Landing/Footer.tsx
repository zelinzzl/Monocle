import { Icon } from "../UI/icons/Icon";
import { P } from "../UI/typography";

export default function Footer() {
  return (
    <footer className="flex flex-row justify-between p-4  ">
      <P className="text-primary">@Monocle group</P>

      {/* TODO: Update this link */}
      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
        <Icon name="Github" isLottie className="cursor-pointer" />
      </a>
    </footer>
  );
}
