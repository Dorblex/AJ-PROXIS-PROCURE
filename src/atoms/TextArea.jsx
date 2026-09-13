import { inputCls, inputStyle } from "./inputStyles.js";

export function TextArea(props) {
  return <textarea {...props} className={`${inputCls} ${props.className || ""}`} style={inputStyle} />;
}
