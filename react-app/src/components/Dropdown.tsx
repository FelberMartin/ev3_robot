/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";

interface Props {
  items: Array<string>;
  onSelected: (item: string) => void;
  defaultValue: string;
}

function Dropdown({items, onSelected, defaultValue}: Props) {
  const [selectedFile, setSelectedFile] = useState(defaultValue);

  let _items = structuredClone(items);
  _items.push(defaultValue);

  return (
    <div className="dropdown">
      <button
        className="btn btn-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        {selectedFile}
      </button>
      <ul className="dropdown-menu dropdown-menu-dark">
        {_items.map((item) => (
          <li key={item}>
          <a className={
            selectedFile === item
            ? "dropdown-item active"
            : "dropdown-item"
          } href="#" onClick={(_) => {
            setSelectedFile(item);
            onSelected(item);
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
