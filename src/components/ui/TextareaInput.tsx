import { JSX, splitProps } from "solid-js";

type TextareaInput = {
  name: string;
  // type: "text" | "email" | "tel" | "password" | "url" | "date";
  label?: string;
  placeholder?: string;
  value: string | undefined;
  error: string;
  required?: boolean;
  ref: (element: HTMLTextAreaElement) => void;
  onInput: JSX.EventHandler<HTMLTextAreaElement, InputEvent>;
  onChange: JSX.EventHandler<HTMLTextAreaElement, Event>;
  onBlur: JSX.EventHandler<HTMLTextAreaElement, FocusEvent>;
};

export function TextareaInput(props: TextareaInput) {
  const [, inputProps] = splitProps(props, ["value", "label", "error"]);

  let textareaRef: HTMLTextAreaElement;

  function oninput(evt: InputEvent) {
    props.onInput(evt);
    textareaRef.style.height = "0px";
    textareaRef.style.height = textareaRef.scrollHeight + "px";
  }

  return (
    <div class="space-y-0.5">
      {props.label && (
        <label for={props.name} class="text-slate-500">
          {props.label} {props.required && <span>*</span>}
        </label>
      )}
      <textarea
        {...inputProps}
        onInput={oninput}
        id={props.name}
        ref={textareaRef}
        value={props.value || ""}
        aria-invalid={!!props.error}
        aria-errormessage={`${props.name}-error`}
        rows="2"
        class="min-h-[64px] w-full resize-none rounded border-2 border-slate-300 px-3 py-1.5 outline-0 transition-colors focus:border-sky-400"
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
