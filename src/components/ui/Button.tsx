import { children, JSX, mergeProps, Show } from "solid-js";
import { cn } from "~/lib/utils";
import { RiLoader2Line } from "solidjs-remixicon";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "accent" | "gray";
  loading?: boolean;
}

export default function Button(props: ButtonProps) {
  const defaultedProps = mergeProps({ color: "accent", loading: false }, props);
  const c = children(() => defaultedProps.children);

  return (
    <button
      {...defaultedProps}
      class={cn(
        defaultedProps.class,
        "relative min-h-10 w-full cursor-pointer rounded-md bg-sky-500 py-2 text-sky-50 transition-colors hover:bg-sky-600",
      )}
      classList={{
        "bg-slate-300 text-slate-800 hover:bg-slate-400":
          defaultedProps.color === "gray",
      }}
    >
      <Show when={defaultedProps.loading} fallback={c()}>
        <div class="anim absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div class="animate-spin">
            <RiLoader2Line></RiLoader2Line>
          </div>
        </div>
      </Show>
    </button>
  );
}
