/* eslint-disable @typescript-eslint/no-unused-vars */
import { on } from "events";
import { useState } from "react";

interface Props {
  items: Array<string>;
  onSelected: (item: string) => void;
}

function Dropdown({items, onSelected}: Props) {
  const [selectedFile, setSelectedFile] = useState("None");

  let _items = structuredClone(items);
  _items.push("None");

  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {selectedFile === "None" ? "Select a file" : selectedFile }
      </button>
      <ul className="dropdown-menu">
        {_items.map((item) => (
          <li key={item}>
          <a className={
            selectedFile === item
            ? "dropdown-item active"
            : "dropdown-item"
          } href="#" onClick={(event) => {
            setSelectedFile(item);
            onSelected(item === "None" ? "" : item);
          }}>
            {item}
          </a>
        </li>
        ))}
      </ul>
    </div>
  );
}

export default Dropdown;
