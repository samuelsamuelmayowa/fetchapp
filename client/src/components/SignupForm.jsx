import { useState } from "react";
import axios from "axios";
import { UserIcon } from "@heroicons/react/24/outline";
import CountrySelect from "./CountrySelect";
import { useNavigate } from "react-router-dom"; 

const API_URL = import.meta.env.VITE_PRODUCTION_API_URL 

export default function SignupForm({
  title,
  buttonText,
  buttonClass,
  showSocials = false,
  role = "earner",
}) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "",
    facebookLink: "",
    youtubeLink: "",
    instagramLink: "",
    tiktokLink: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const navigate = useNavigate();
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCountryChange = (country) => {
    setFormData((prev) => ({
      ...prev,
      country,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const res = await axios.post(
      `${API_URL}auth/signup`,
      {
        ...formData,
        role,
      },
      {
        withCredentials: true,
      }
    );

    console.log(res.data);

    // success message
    setError("");

    // redirect to login page
    navigate("/login");

  } catch (err) {
    console.log(err);

    setError(
      err.response?.data?.message ||
      err.message ||
      "Signup failed"
    );
  } finally {
    setLoading(false);
  }
};
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   setError("");

  //   try {
  //     const res = await axios.post(
  //       `${API_URL}auth/signup`,
  //       {
  //         ...formData,
  //         role,
  //       },
  //       {
  //         withCredentials: true,
  //       }
  //     );

  //     console.log(res.data);
  //     alert("Signup successful");
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Signup failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <section className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl">
        <div className="text-center">
          <UserIcon className="mx-auto h-14 w-14 text-blue-600" />
          <h2 className="text-3xl font-bold mt-4">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
  <div className="bg-red-100 border border-red-300 text-red-600 px-4 py-3 rounded-xl text-sm">
    {error}
  </div>
)}

          <Input
            label="Full Name"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />

          <CountrySelect
            value={formData.country}
            onChange={handleCountryChange}
          />

          {showSocials && (
            <>
              <Input
                label="Facebook Link"
                name="facebookLink"
                type="url"
                required={false}
                value={formData.facebookLink}
                onChange={handleChange}
              />

              <Input
                label="YouTube Link"
                name="youtubeLink"
                type="url"
                required={false}
                value={formData.youtubeLink}
                onChange={handleChange}
              />

              <Input
                label="Instagram Link"
                name="instagramLink"
                type="url"
                required={false}
                value={formData.instagramLink}
                onChange={handleChange}
              />

              <Input
                label="TikTok Link"
                name="tiktokLink"
                type="url"
                required={false}
                value={formData.tiktokLink}
                onChange={handleChange}
              />
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl text-white flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${buttonClass}`}
          >
            {loading ? (
              <>
                <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Creating account...
              </>
            ) : (
              buttonText
            )}
          </button>
        </form>
      </div>
    </section>
  );
}

function Input({
  label,
  name,
  type,
  value,
  onChange,
  required = true,
}) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full mt-2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

// import { UserIcon } from "@heroicons/react/24/outline";
// import CountrySelect from "./CountrySelect";

// export default function SignupForm({
//   title,
//   buttonText,
//   buttonClass,
//   showSocials = false,
// }) {
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     alert(`${title} submitted`);
//   };

//   return (
//     <section className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
//       <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl">

//         <div className="text-center">
//           <UserIcon className="mx-auto h-14 w-14 text-blue-600" />
//           <h2 className="text-3xl font-bold mt-4">{title}</h2>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-8 space-y-5">

//           <Input label="Full Name" type="text" />
//           <Input label="Email" type="email" />
//           <Input label="Password" type="password" />

//           <CountrySelect />

//           {showSocials && (
//             <>
//               <Input label="Facebook Link" type="url" required={false} />
//               <Input label="YouTube Link" type="url" required={false} />
//               <Input label="Instagram Link" type="url" required={false} />
//               <Input label="TikTok Link" type="url" required={false} />
//             </>
//           )}

//           <button className={`w-full py-3 rounded-xl text-white ${buttonClass}`}>
//             {buttonText}
//           </button>
//         </form>
//       </div>
//     </section>
//   );
// }

// function Input({ label, type, required = true }) {
//   return (
//     <div>
//       <label className="text-sm font-semibold">{label}</label>
//       <input
//         type={type}
//         required={required}
//         className="w-full mt-2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
//       />
//     </div>
//   );
// }