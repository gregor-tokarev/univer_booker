import { JSX } from "solid-js";

interface TimeCardProps extends JSX.HTMLAttributes<HTMLDivElement> {
  selected: boolean;
  disabled: boolean;
}

export default function TimeCard(props: TimeCardProps) {
  return (
    <div
      {...props}
      class="cursor-pointer rounded-lg border-2 border-slate-300 p-4"
      classList={{
        "border-slate-900": props.selected,
        "opacity-40": props.disabled,
      }}
      title={props.disabled ? "Это время уже забронировано другими людьми" : ""}
    >
      {props.children}
    </div>
  );
}
