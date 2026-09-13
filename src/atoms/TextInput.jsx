import { inputCls, inputStyle } from "./inputStyles.js";

export function TextInput(props) {
  return <input {...props} className={`${inputCls} ${props.className || ""}`} style={inputStyle} />;
}
