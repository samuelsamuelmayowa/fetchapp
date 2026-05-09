import { Menu, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import {
  Bars3Icon,
  UserIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("ppt_user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const [theme, setTheme] = useState(
  localStorage.getItem("theme") || "dark"
);

useEffect(() => {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  localStorage.setItem("theme", theme);
}, [theme]);

const toggleTheme = () => {
  setTheme((prev) => (prev === "dark" ? "light" : "dark"));
};

  const dashboardLink =
    user?.role === "creator" ? "/creator-dashboard" : "/earner-dashboard";

  const handleLogout = () => {
    localStorage.removeItem("ppt_user");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <img src="/image/img/light bg.svg" alt="Logo" className="h-8" />
        </Link>

        <div className="hidden gap-6 text-sm font-medium md:flex">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>

          {user && (
            <Link to={dashboardLink} className="hover:text-blue-600">
              Dashboard
            </Link>
          )}

          <Link to="/read-more" className="hover:text-blue-600">
            Read More
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          {!user ? (
            <>
              <Link
                to="/form"
                className="rounded-lg bg-black px-4 py-2 text-sm text-white"
              >
                Sign Up
              </Link>

              <Link to="/login" className="rounded-lg border px-4 py-2 text-sm">
                Login
              </Link>
            </>
          ) : (
            <>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {user.fullName || user.email}
                </p>

                <p className="text-xs capitalize text-slate-500">
                  {user.role} Account
                </p>
              </div>

              <Menu as="div" className="relative">
                <Menu.Button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <UserIcon className="h-5 w-5 text-slate-700" />
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
                  <Menu.Items className="absolute right-0 mt-2 w-56 rounded-xl border bg-white p-2 shadow-lg">
                    <div className="border-b px-3 py-2">
                      <p className="text-sm font-semibold">
                        {user.fullName || "User"}
                      </p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <p className="mt-1 text-xs font-medium capitalize text-blue-600">
                        {user.role}
                      </p>
                    </div>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to={dashboardLink}
                          className={`block rounded-lg px-3 py-2 text-sm ${
                            active ? "bg-gray-100" : ""
                          }`}
                        >
                          Dashboard
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/user-profile"
                          className={`block rounded-lg px-3 py-2 text-sm ${
                            active ? "bg-gray-100" : ""
                          }`}
                        >
                          Profile
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 ${
                            active ? "bg-red-50" : ""
                          }`}
                        >
                          <ArrowRightOnRectangleIcon className="h-4 w-4" />
                          Logout
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </>
          )}
        </div>

<button
  onClick={toggleTheme}
  className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
>
  {theme === "dark" ? (
    <SunIcon className="h-5 w-5" />
  ) : (
    <MoonIcon className="h-5 w-5" />
  )}
</button>
        <button className="md:hidden">
          <Bars3Icon className="h-6 w-6" />
        </button>
      </div>
    </nav>
  );
}
// import { Menu, Transition } from "@headlessui/react";
// import { Fragment } from "react";
// import { Bars3Icon } from "@heroicons/react/24/outline";

// export default function Navbar() {
//   return (
//     <nav className="fixed top-0 w-full bg-white border-b z-50">
//       <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        
//         {/* Logo */}
//         <div className="flex items-center gap-2">
//           <img src="/image/img/light bg.svg" className="h-8" />
//         </div>

//         {/* Links */}
//         <div className="hidden md:flex gap-6 text-sm font-medium">
//           <a href="/" className="hover:text-blue-600">Home</a>
//           <a href="/dashboard" className="hover:text-blue-600">Dashboard</a>
//           <a href="/read-more" className="hover:text-blue-600">Read More</a>
//         </div>

//         {/* Right side */}
//         <div className="flex items-center gap-4">
          
//           <a
//             href="/form"
//             className="px-4 py-2 bg-black text-white rounded-lg text-sm"
//           >
//             Sign Up
//           </a>

//           <a
//             href="/login"
//             className="px-4 py-2 border rounded-lg text-sm"
//           >
//             Login
//           </a>

//           {/* Profile dropdown */}
//           <Menu as="div" className="relative">
//             <Menu.Button>
//               <img
//                 src="https://i.pravatar.cc/40"
//                 className="rounded-full w-9 h-9"
//               />
//             </Menu.Button>

//             <Transition
//               as={Fragment}
//               enter="transition ease-out duration-100"
//               enterFrom="opacity-0 scale-95"
//               enterTo="opacity-100 scale-100"
//               leave="transition ease-in duration-75"
//               leaveFrom="opacity-100 scale-100"
//               leaveTo="opacity-0 scale-95"
//             >
//               <Menu.Items className="absolute right-0 mt-2 w-40 bg-white border rounded-xl shadow-lg p-2">
//                 <Menu.Item>
//                   {({ active }) => (
//                     <a
//                       href="/profile"
//                       className={`block px-3 py-2 rounded ${
//                         active ? "bg-gray-100" : ""
//                       }`}
//                     >
//                       Profile
//                     </a>
//                   )}
//                 </Menu.Item>
//               </Menu.Items>
//             </Transition>
//           </Menu>
//         </div>

//         {/* Mobile menu icon */}
//         <div className="md:hidden">
//           <Bars3Icon className="w-6 h-6" />
//         </div>
//       </div>
//     </nav>
//   );
// }