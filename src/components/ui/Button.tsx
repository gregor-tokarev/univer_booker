import { children, JSX, mergeProps, Show } from "solid-js";
import { cn } from "~/lib/utils";
import { RiLoader2Line } from "solidjs-remixicon";

interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "accent" | "gray" | "red";
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
        "relative min-h-10 w-full cursor-pointer rounded-md py-2 transition-colors",
      )}
      classList={{
        "bg-sky-500 text-sky-50  hover:bg-sky-600":
          defaultedProps.color === "accent",
        "bg-slate-300 text-slate-800 hover:bg-slate-400":
          defaultedProps.color === "gray",
        "bg-red-400 text-slate-50 hover:bg-red-500":
          defaultedProps.color === "red",
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
