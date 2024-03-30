import { children, JSX } from "solid-js";
import { cn } from "~/lib/utils";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  color: "accent" | "gray";
}

export default function Button(props: ButtonProps) {
  const c = children(() => props.children);

  return (
    <button
      {...props}
      class={cn(
        props.class,
        "w-full cursor-pointer rounded-md bg-sky-500 py-2 text-sky-50 transition-colors hover:bg-sky-600",
      )}
      classList={{
        "bg-slate-300 text-slate-800 hover:bg-slate-400":
          props.color === "gray",
      }}
    >
      {c()}
    </button>
  );
}
