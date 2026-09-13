import { inputCls, inputStyle } from "./inputStyles.js";

export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${inputCls} bg-white`} style={inputStyle}>
      {children}
    </select>
  );
}
