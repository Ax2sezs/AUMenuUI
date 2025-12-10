import React from "react";

function SearchBar() {
  return (
    <div className="flex gap-2 w-full px-4 p-2">
      <span className="w-2/3">
        <input
          type="text"
          placeholder="ค้นหา..."
          className="input input-error w-full"
        />
      </span>
      <span>
        <select className="select select-primary">
          <option value="1">Test 1</option>
          <option value="2">Test 2</option>
          <option value="3">Test 3</option>
          <option value="4">Test 4</option>
        </select>
      </span>
    </div>
  );
}

export default SearchBar;
