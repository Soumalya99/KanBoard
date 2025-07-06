import React from "react";

/**
 * Shadcn-like animated black shiny input component.
 * - Accepts all standard input props.
 * - Accepts `className` for additional styling.
 * - Has a shiny animated border and focus effect.
 */
const Input = React.forwardRef(
  (
    {
      className = "",
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={type}
          className={`
            block w-full rounded-md px-4 py-2 bg-gradient-to-br from-neutral-900 via-neutral-800 to-black
            text-white placeholder-gray-400
            border border-neutral-700
            shadow-lg
            outline-none
            transition-all duration-300
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            focus:bg-gradient-to-br focus:from-black focus:via-neutral-900 focus:to-neutral-800
            ${className}
            animate-shine
          `}
          {...props}
        />
        {/* Animated shine effect */}
        <span className="pointer-events-none absolute inset-0 rounded-md overflow-hidden">
          <span className="absolute -left-1/2 top-0 h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 animate-input-shine" />
        </span>
        <style>
          {`
            @keyframes input-shine {
              0% { left: -50%; opacity: 0; }
              40% { opacity: 0.7; }
              60% { opacity: 0.7; }
              100% { left: 100%; opacity: 0; }
            }
            .animate-input-shine {
              animation: input-shine 3.4s infinite;
            }
          `}
        </style>
      </div>
    );
  }
);

export default Input;