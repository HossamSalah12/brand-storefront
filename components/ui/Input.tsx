import { clsx } from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, name, className, ...props }, ref) {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={name}
          className="text-xs uppercase tracking-widest2 text-stone"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={name}
          name={name}
          className={clsx(
            "border border-stone-light bg-transparent px-4 py-3 text-sm text-ink placeholder:text-stone focus:border-ink",
            className,
          )}
          {...props}
        />
      </div>
    );
  },
);
