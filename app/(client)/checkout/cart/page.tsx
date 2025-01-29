import React from "react";

interface Item {
  name: string;
  price: number;
  quantity: number;
}

const items: Item[] = [{ name: "Widget A", price: 10.99, quantity: 2 }];

export default function SimpleTable() {
  return (
    <div className="w-5/6 grid grid-flow-col space-x-10 mx-auto p-4 mt-[9.5rem] lg:mt-[11.5rem]">
      <table className="col-span-2 bg-white border-collapse border border-gray-300">
        <colgroup>
          <col className="w-1/2" />
          <col className="w-1/6" />
          <col className="w-1/6" />
          <col className="w-1/6" />
        </colgroup>
        <thead>
          <tr className="">
            <th className="py-2 px-4 border border-gray-300 text-left">Item</th>
            <th className="py-2 px-4 border border-gray-300 text-center">
              Price
            </th>
            <th className="py-2 px-4 border border-gray-300 text-center">
              Qty
            </th>
            <th className="py-2 px-4 border border-gray-300 text-center">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
              <td className="py-2 px-4 border border-gray-300">{item.name}</td>
              <td className="py-2 px-4 border border-gray-300 text-center">
                ${item.price.toFixed(2)}
              </td>
              <td className="py-2 px-4 border border-gray-300 text-center">
                <div className="grid grid-flow-col gap-2 py-2 px-3 border border-black rounded">
                  <button>-</button>
                  <p className="text-center">{item.quantity}</p>
                  <button>+</button>
                </div>
              </td>
              <td className="py-2 px-4 border border-gray-300 text-center">
                ${(item.price * item.quantity).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-100 font-bold">
            <td
              className="py-2 px-4 border border-gray-300 text-center"
              colSpan={3}>
              Total:
            </td>
            <td className="py-2 px-4 border border-gray-300 text-center">
              $
              {items
                .reduce((total, item) => total + item.price * item.quantity, 0)
                .toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
      <div className="border border-1 col-span-1">
        <h2>Summary</h2>
      </div>
    </div>
  );
}
