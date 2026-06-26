import type { HTMLAttributes } from "react";

type PrestigeFooterProps = HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
  compact?: boolean;
};

export function PrestigeFooter({ className = "", fixed = true, compact = true, ...props }: PrestigeFooterProps) {
  return <footer
    className={[
      "prestige-footer",
      fixed ? "prestige-footer--fixed" : "",
      compact ? "prestige-footer--compact" : "",
      className,
    ].filter(Boolean).join(" ")}
    {...props}
  >
    <a
      className="prestige-footer-inner"
      href="https://theprestige-group.com/"
      target="_blank"
      rel="noreferrer"
      aria-label="The Prestige Group"
    >
      <img src="/prestige-diamond.png" alt="The Prestige Group" className="prestige-diamond" />
      <span>The Prestige Group</span>
    </a>
  </footer>;
}
