import { useState } from "react";
import {
  ArrowLeftIcon,
  KeyIcon,
  UserGroupIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import CountrySelect from "./CountrySelect";

export default function Signup() {
  const [screen, setScreen] = useState("role");

  const goBack = () => {
    if (screen !== "role") setScreen("role");
    else window.history.back();
  };

  return (
    <section className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <button
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        {screen === "role" && (
          <>
            <div className="text-center">
              <UserGroupIcon className="mx-auto h-14 w-14 text-blue-600" />
              <h2 className="mt-4 text-3xl font-bold text-slate-900">
                Sign Up
              </h2>
              <p className="mt-2 text-slate-500">
                Choose how you want to join
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setScreen("earner")}
                className="rounded-2xl bg-blue-600 px-5 py-4 font-semibold text-white shadow-lg hover:bg-blue-700"
              >
                Sign Up as Earner
              </button>

              <button
                onClick={() => setScreen("creator")}
                className="rounded-2xl bg-cyan-600 px-5 py-4 font-semibold text-white shadow-lg hover:bg-cyan-700"
              >
                Sign Up as Creator
              </button>
            </div>

            <a
              href="/forgot-password"
              className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <KeyIcon className="h-4 w-4" />
              Forgotten Password
            </a>
          </>
        )}

        {screen === "earner" && (
          <SignupForm
            title="Earner Signup"
            buttonText="Submit"
            buttonClass="bg-green-600 hover:bg-green-700"
            showSocials
          />
        )}

        {screen === "creator" && (
          <SignupForm
            title="Creator Signup"
            buttonText="Submit"
            buttonClass="bg-blue-600 hover:bg-blue-700"
          />
        )}
      </div>
    </section>
  );
}

function SignupForm({ title, buttonText, buttonClass, showSocials = false }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${title} submitted`);
  };

  return (
    <>
      <div className="text-center">
        <UserIcon className="mx-auto h-14 w-14 text-blue-600" />
        <h2 className="mt-4 text-3xl font-bold text-slate-900">{title}</h2>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <Input label="Full Name" type="text" placeholder="Enter your full name" />
        <Input label="Email" type="email" placeholder="Enter your email" />
        <Input label="Password" type="password" placeholder="Enter your password" />
        {/* <Input label="Country" type="text" placeholder="Enter your country" /> */}
        <CountrySelect />

        {showSocials && (
          <>
            <Input label="Facebook Link" type="url" placeholder="Enter your Facebook profile link" required={false} />
            <Input label="YouTube Link" type="url" placeholder="Enter your YouTube channel link" required={false} />
            <Input label="Instagram Link" type="url" placeholder="Enter your Instagram profile link" required={false} />
            <Input label="TikTok Link" type="url" placeholder="Enter your TikTok profile link" required={false} />
          </>
        )}

        <button
          type="submit"
          className={`w-full rounded-2xl px-5 py-3 font-semibold text-white shadow-lg ${buttonClass}`}
        >
          {buttonText}
        </button>
      </form>
    </>
  );
}

function Input({ label, type, placeholder, required = true }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}