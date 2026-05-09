import { useState, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  UserIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";

const demoTasks = [
  {
    id: 1,
    title: "Follow Facebook Page",
    platform: "Facebook",
    reward: 0.01,
    link: "https://facebook.com",
  },
  {
    id: 2,
    title: "Watch YouTube Video",
    platform: "YouTube",
    reward: 0.007,
    link: "https://youtube.com",
  },
  {
    id: 3,
    title: "Follow TikTok Account",
    platform: "TikTok",
    reward: 0.01,
    link: "https://tiktok.com",
  },
];

export default function EarnerDashboard() {
  const [username, setUsername] = useState("");
  const [activeUser, setActiveUser] = useState("");
  const [notify, setNotify] = useState("");
  const [balance, setBalance] = useState(0);
  const [activity, setActivity] = useState([]);

  const registerUser = () => {
    if (!username.trim()) {
      setNotify("Please enter your username.");
      return;
    }

    setActiveUser(username);
    setNotify(`Welcome ${username}. You can now start tasks.`);
  };

  const completeTask = (task) => {
    if (!activeUser) {
      setNotify("Register or switch user first.");
      return;
    }

    setBalance((prev) => prev + task.reward);

    setActivity((prev) => [
      {
        id: Date.now(),
        title: task.title,
        reward: task.reward,
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    setNotify(`Task completed. You earned $${task.reward.toFixed(3)}.`);
  };

  const requestWithdraw = () => {
    if (balance < 10) {
      setNotify("You need at least $10 before requesting withdrawal.");
      return;
    }

    setNotify("Withdrawal request submitted successfully.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <nav className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <a href="/" className="flex items-center gap-2">
            <img src="/image/img/light bg.svg" alt="Logo" className="h-9" />
          </a>

          <div className="hidden items-center gap-8 md:flex">
            <a href="/" className="text-sm font-medium hover:text-blue-600">
              Home
            </a>
            <a
              href="/earner-dashboard"
              className="text-sm font-medium hover:text-blue-600"
            >
              Dashboard
            </a>
            <a
              href="/read-more"
              className="text-sm font-medium hover:text-blue-600"
            >
              Read More
            </a>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/form"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Sign Up
            </a>

            <a
              href="/input"
              className="rounded-xl border px-4 py-2 text-sm font-medium"
            >
              Login
            </a>

            <Menu as="div" className="relative">
              <Menu.Button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                <UserIcon className="h-5 w-5" />
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
                <Menu.Items className="absolute right-0 mt-3 w-44 rounded-xl border bg-white p-2 shadow-lg">
                  <Menu.Item>
                    {({ active }) => (
                      <a
                        href="/user-profile"
                        className={`block rounded-lg px-3 py-2 text-sm ${
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

          <button className="md:hidden">
            <Bars3Icon className="h-7 w-7" />
          </button>
        </div>
      </nav> */}

      <Navbar/>

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
        <button
          onClick={() => window.history.back()}
          className="rounded-xl bg-white px-4 py-2 text-sm font-medium shadow-sm"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-gray-900">
          Earner Dashboard
        </h1>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="font-medium">User name</label>
          <p className="mt-1 text-sm text-gray-500">
            Users must use the same username for all tasks to keep daily records accurate.
          </p>

          <input
            className="mt-3 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            placeholder="e.g., Aisha"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button
            onClick={registerUser}
            className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Register / Switch
          </button>

          {notify && (
            <div className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-700">
              {notify}
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Available Tasks</h2>

          <div className="mt-4 space-y-4">
            {demoTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border p-5 transition hover:border-blue-400"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{task.title}</h3>
                    <p className="text-sm text-gray-500">
                      Platform: {task.platform}
                    </p>
                  </div>

                  <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                    ${task.reward.toFixed(3)}
                  </span>
                </div>

                <div className="mt-4 flex gap-3">
                  <a
                    href={task.link}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium"
                  >
                    Open Task
                  </a>

                  <button
                    onClick={() => completeTask(task)}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Mark Done
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">My Account</h2>

          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <p>
              <strong>User:</strong> {activeUser || "Not registered"}
            </p>
            <p>
              <strong>Balance:</strong> ${balance.toFixed(3)}
            </p>
          </div>

          <button
            onClick={requestWithdraw}
            className="mt-4 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Request Withdraw if $10+
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">My Activity</h2>

          <div className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <p className="text-gray-500">No activity yet.</p>
            ) : (
              activity.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.date}</p>
                  </div>

                  <p className="font-semibold text-green-600">
                    +${item.reward.toFixed(3)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}