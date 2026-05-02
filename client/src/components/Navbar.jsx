import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white border-b z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src="/image/img/light bg.svg" className="h-8" />
        </div>

        {/* Links */}
        <div className="hidden md:flex gap-6 text-sm font-medium">
          <a href="/" className="hover:text-blue-600">Home</a>
          <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
          <a href="/read-more" className="hover:text-blue-600">Read More</a>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          
          <a
            href="/form"
            className="px-4 py-2 bg-black text-white rounded-lg text-sm"
          >
            Sign Up
          </a>

          <a
            href="/login"
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Login
          </a>

          {/* Profile dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button>
              <img
                src="https://i.pravatar.cc/40"
                className="rounded-full w-9 h-9"
              />
            </Menu.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg p-2">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="/profile"
                      className={`block px-3 py-2 rounded ${
                        active ? "bg-gray-100" : ""
                      }`}
                    >
                      Profile
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>

        {/* Mobile menu icon */}
        <div className="md:hidden">
          <Bars3Icon className="w-6 h-6" />
        </div>
      </div>
    </nav>
  );
}