import { JSX, splitProps } from "solid-js";

type TextInputProps = {
  name: string;
  type: "text" | "email" | "tel" | "password" | "url" | "date";
  label?: string;
  placeholder?: string;
  value: string | undefined;
  error: string;
  required?: boolean;
  ref: (element: HTMLInputElement) => void;
  onInput: JSX.EventHandler<HTMLInputElement, InputEvent>;
  onChange: JSX.EventHandler<HTMLInputElement, Event>;
  onBlur: JSX.EventHandler<HTMLInputElement, FocusEvent>;
};

export function TextInput(props: TextInputProps) {
  const [, inputProps] = splitProps(props, ["value", "label", "error"]);

  return (
    <div class="space-y-0.5">
      {props.label && (
        <label for={props.name} class="text-slate-500">
          {props.label} {props.required && <span>*</span>}
        </label>
      )}
      <input
        {...inputProps}
        id={props.name}
        value={props.value || ""}
        aria-invalid={!!props.error}
        aria-errormessage={`${props.name}-error`}
        class="w-full rounded border-2 border-slate-300 px-3 py-1.5 outline-0 transition-colors focus:border-sky-400"
        classList={{ "border-red-500": !!props.error }}
      />
      {props.error && (
        <div class="text-xs text-red-500" id={`${props.name}-error`}>
          {props.error}
        </div>
      )}
    </div>
  );
}
