/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

interface Props {
  items: Array<string>;
}

function Dropdown({items}: Props) {
  const [selectedFile, setSelectedFile] = useState("");

  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {selectedFile || "Select a file"}
      </button>
      <ul className="dropdown-menu">
        {items.map((item) => (
          <li key={item}>
          <a className={
            selectedFile === item
            ? "dropdown-item active"
            : "dropdown-item"
          } href="#" onClick={(event) => (
            setSelectedFile(item)
          )}>
            {item}
          </a>
        </li>
        ))}
      </ul>
    </div>
  );
}

export default Dropdown;
