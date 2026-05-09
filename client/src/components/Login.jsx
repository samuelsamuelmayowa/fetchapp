import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// const API_URL = "http://localhost:5000/api/";

const API_URL = import.meta.env.VITE_PRODUCTION_API_URL 


export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("earner");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      const user = res.data.user;

      if (user.role !== role) {
        toast.error(`This account is not a ${role} account`);
        setError(`This account is registered as ${user.role}, not ${role}`);
        return;
      }

      toast.success("Login successful");

      localStorage.setItem("ppt_user", JSON.stringify(user));

      if (user.role === "creator") {
        navigate("/creator-dashboard");
      } else {
        navigate("/earner-dashboard");
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || "Login failed";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <button
          onClick={() => window.history.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>

        <div className="text-center">
          <LockClosedIcon className="mx-auto h-14 w-14 text-blue-600" />
          <h2 className="mt-4 text-3xl font-bold text-slate-900">Login</h2>
          <p className="mt-2 text-slate-500">
            Select your account type and continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Account Type
            </label>

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="earner">Earner</option>
              <option value="creator">Creator</option>
            </select>
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
          />

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 flex justify-between text-sm">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgotten Password?
          </a>

          <a href="/signup" className="text-blue-600 hover:underline">
            Create Account
          </a>
        </div>
      </div>
    </section>
  );
}

function Input({ label, type, placeholder, value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </div>
  );
}
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ArrowLeftIcon,
//   LockClosedIcon,
// } from "@heroicons/react/24/outline";

// export default function Login() {
//   const navigate = useNavigate();

//   const [role, setRole] = useState("earner");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // temporary fake login until backend is ready
//     const fakeUser = {
//       email,
//       role,
//       loggedIn: true,
//     };

//     localStorage.setItem("ppt_user", JSON.stringify(fakeUser));

//     if (role === "creator") {
//       navigate("/creator-dashboard");
//     } else {
//       navigate("/earner-dashboard");
//     }
//   };

//   return (
//     <section className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
//         <button
//           onClick={() => window.history.back()}
//           className="mb-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
//         >
//           <ArrowLeftIcon className="h-4 w-4" />
//           Back
//         </button>

//         <div className="text-center">
//           <LockClosedIcon className="mx-auto h-14 w-14 text-blue-600" />
//           <h2 className="mt-4 text-3xl font-bold text-slate-900">
//             Login
//           </h2>
//           <p className="mt-2 text-slate-500">
//             Select your account type and continue
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-8 space-y-5">
//           <div>
//             <label className="mb-2 block text-sm font-semibold text-slate-700">
//               Account Type
//             </label>

//             <select
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//             >
//               <option value="earner">Earner</option>
//               <option value="creator">Creator</option>
//             </select>
//           </div>

//           <Input
//             label="Email"
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={setEmail}
//           />

//           <Input
//             label="Password"
//             type="password"
//             placeholder="Enter your password"
//             value={password}
//             onChange={setPassword}
//           />

//           <button
//             type="submit"
//             className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-blue-700"
//           >
//             Login
//           </button>
//         </form>

//         <div className="mt-6 flex justify-between text-sm">
//           <a href="/forgot-password" className="text-blue-600 hover:underline">
//             Forgotten Password?
//           </a>

//           <a href="/signup" className="text-blue-600 hover:underline">
//             Create Account
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Input({ label, type, placeholder, value, onChange }) {
//   return (
//     <div>
//       <label className="mb-2 block text-sm font-semibold text-slate-700">
//         {label}
//       </label>

//       <input
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         required
//         className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//       />
//     </div>
//   );
// }
// import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";

// export default function Login() {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert("Login submitted");
//   };

//   return (
//     <section className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
//       <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
//         <button
//           onClick={() => window.history.back()}
//           className="mb-6 inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
//         >
//           <ArrowLeftIcon className="h-4 w-4" />
//           Back
//         </button>

//         <div className="text-center">
//           <LockClosedIcon className="mx-auto h-14 w-14 text-blue-600" />
//           <h2 className="mt-4 text-3xl font-bold text-slate-900">
//             Login
//           </h2>
//           <p className="mt-2 text-slate-500">
//             Welcome back to your account
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-8 space-y-5">
//           <Input label="Email" type="email" placeholder="Enter your email" />
//           <Input label="Password" type="password" placeholder="Enter your password" />

//           <button
//             type="submit"
//             className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg hover:bg-blue-700"
//           >
//             Login
//           </button>
//         </form>

//         <div className="mt-6 flex justify-between text-sm">
//           <a href="/forgot-password" className="text-blue-600 hover:underline">
//             Forgotten Password?
//           </a>

//           <a href="/signup" className="text-blue-600 hover:underline">
//             Create Account
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }

// function Input({ label, type, placeholder }) {
//   return (
//     <div>
//       <label className="mb-2 block text-sm font-semibold text-slate-700">
//         {label}
//       </label>
//       <input
//         type={type}
//         placeholder={placeholder}
//         required
//         className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//       />
//     </div>
//   );
// }