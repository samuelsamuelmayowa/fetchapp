import { useState } from "react";
import { Listbox } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/24/solid";
import { getNames } from "country-list";

const countries = getNames();

export default function CountrySelect() {
  const [selected, setSelected] = useState("Nigeria");

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        Country
      </label>

      <Listbox value={selected} onChange={setSelected}>
        <div className="relative">
          <Listbox.Button className="w-full rounded-xl border border-slate-300 px-4 py-3 text-left bg-white shadow-sm focus:ring-2 focus:ring-blue-500">
            <span>{selected}</span>
            <ChevronUpDownIcon className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
          </Listbox.Button>

          <Listbox.Options className="absolute z-50 mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white shadow-lg border">
            {countries.map((country, index) => (
              <Listbox.Option
                key={index}
                value={country}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 ${
                    active ? "bg-blue-100" : ""
                  }`
                }
              >
                {({ selected }) => (
                  <div className="flex justify-between">
                    <span>{country}</span>
                    {selected && (
                      <CheckIcon className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}