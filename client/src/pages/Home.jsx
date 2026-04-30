import { Disclosure } from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  PlayCircleIcon,
  BanknotesIcon,
  TrophyIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

const features = [
  {
    title: "Complete Tasks",
    desc: "Watch videos, follow pages, subscribe to channels, and complete simple online activities.",
    icon: PlayCircleIcon,
  },
  {
    title: "Earn Points",
    desc: "Every completed task gives you points that help you grow your earning profile.",
    icon: TrophyIcon,
  },
  {
    title: "Withdraw Money",
    desc: "Convert your points into real rewards and withdraw using secure payment options.",
    icon: BanknotesIcon,
  },
  {
    title: "Safe Platform",
    desc: "Simple, trusted, and easy-to-use platform for users and companies.",
    icon: ShieldCheckIcon,
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* NAVBAR */}
      <Disclosure as="nav" className="fixed top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        {({ open }) => (
          <>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/image/img/light bg.svg"
                  alt="PPT Logo"
                  className="h-10 w-10 rounded-xl bg-white p-1"
                />
                <span className="text-xl font-bold tracking-tight">PPT</span>
              </Link>

              <div className="hidden items-center gap-8 md:flex">
                <Link to="/" className="text-sm text-slate-300 hover:text-white">Home</Link>
                <Link to="/dashboard" className="text-sm text-slate-300 hover:text-white">Dashboard</Link>
                <Link to="/read-more" className="text-sm text-slate-300 hover:text-white">Read More</Link>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <Link
                  to="/login"
                  className="rounded-xl px-5 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-slate-950 shadow-lg hover:bg-slate-200"
                >
                  Sign Up
                </Link>
              </div>

              <Disclosure.Button className="md:hidden">
                {open ? <XMarkIcon className="h-7 w-7" /> : <Bars3Icon className="h-7 w-7" />}
              </Disclosure.Button>
            </div>

            <Disclosure.Panel className="border-t border-white/10 px-6 py-4 md:hidden">
              <div className="flex flex-col gap-4">
                <Link to="/">Home</Link>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/read-more">Read More</Link>
                <Link to="/login">Login</Link>
                <Link
                  to="/signup"
                  className="rounded-xl bg-white px-5 py-3 text-center font-bold text-slate-950"
                >
                  Sign Up
                </Link>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pt-36 pb-24">
        <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-500/30 blur-3xl"></div>
        <div className="absolute right-10 top-40 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl"></div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-blue-200">
              Earn online with simple daily tasks
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
              Earn Money by Watching Videos & Completing Tasks
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              PPT helps users earn points from simple activities like watching videos,
              following pages, subscribing, and completing brand tasks.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-500 px-7 py-4 font-bold text-white shadow-xl shadow-blue-500/30 hover:bg-blue-400"
              >
                Start Earning Now
                <ArrowRightIcon className="h-5 w-5" />
              </Link>

              <Link
                to="/read-more"
                className="rounded-2xl border border-white/10 px-7 py-4 text-center font-bold text-white hover:bg-white/10"
              >
                Learn More
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
              <div>
                <h3 className="text-2xl font-black">10k+</h3>
                <p className="text-sm text-slate-400">Tasks</p>
              </div>
              <div>
                <h3 className="text-2xl font-black">24/7</h3>
                <p className="text-sm text-slate-400">Access</p>
              </div>
              <div>
                <h3 className="text-2xl font-black">Fast</h3>
                <p className="text-sm text-slate-400">Withdraw</p>
              </div>
            </div>
          </div>

          {/* HERO CARD */}
          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl bg-slate-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today Earnings</p>
                  <h2 className="text-4xl font-black">$12,500</h2>
                </div>
                <div className="rounded-2xl bg-green-500/20 px-4 py-2 text-sm font-bold text-green-300">
                  +28%
                </div>
              </div>

              <div className="space-y-4">
                {["Watch YouTube Video", "Follow Instagram Page", "Subscribe to Channel"].map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="h-6 w-6 text-green-400" />
                      <span>{item}</span>
                    </div>
                    <span className="font-bold text-blue-300">+50 pts</span>
                  </div>
                ))}
              </div>

              <button className="mt-6 w-full rounded-2xl bg-white py-4 font-black text-slate-950 hover:bg-slate-200">
                Withdraw Earnings
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-black md:text-5xl">How PPT Works</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-400">
              Simple system: complete tasks, earn points, build your profile, and withdraw.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 transition hover:-translate-y-2 hover:bg-white/10"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20">
                    <Icon className="h-7 w-7 text-blue-300" />
                  </div>

                  <h3 className="mb-3 text-xl font-black">{feature.title}</h3>
                  <p className="text-sm leading-7 text-slate-400">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 p-10 text-center shadow-2xl">
          <h2 className="text-3xl font-black md:text-5xl">
            Ready to Start Earning?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-blue-100">
            Create your PPT account today and start completing simple online tasks.
          </p>

          <Link
            to="/signup"
            className="mt-8 inline-flex rounded-2xl bg-white px-8 py-4 font-black text-slate-950 hover:bg-slate-200"
          >
            Create Free Account
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <img
              src="/image/img/light bg.svg"
              alt="PPT Logo"
              className="h-10 w-10 rounded-xl bg-white p-1"
            />
            <div>
              <h3 className="font-black">PPT</h3>
              <p className="text-sm text-slate-500">© 2026 PPT. All rights reserved.</p>
            </div>
          </div>

          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/faq">FAQ</Link>
            <Link to="/admin">PPT</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;