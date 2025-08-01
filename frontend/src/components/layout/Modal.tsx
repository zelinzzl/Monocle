import { useEffect, useRef, ReactNode } from "react";
import Animate from "../animations/Animate";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  closeOnOutsideClick?: boolean;
  theme?: "dark" | "light";
}

function Modal({
  children,
  onClose,
  closeOnOutsideClick = true,
  theme = "dark",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        closeOnOutsideClick &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, closeOnOutsideClick]);

  const overlayClasses = `fixed inset-0 flex justify-center items-center z-[1000] ${
    theme === "dark" ? "bg-black/70" : "bg-white/70"
  }`;

  return (
    <div className={overlayClasses}>
      <Animate type="pop" ref={modalRef}>
        {children}
      </Animate>
    </div>
  );
}

export default Modal;
