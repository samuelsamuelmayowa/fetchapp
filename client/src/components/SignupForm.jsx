import { UserIcon } from "@heroicons/react/24/outline";
import CountrySelect from "./CountrySelect";

export default function SignupForm({
  title,
  buttonText,
  buttonClass,
  showSocials = false,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`${title} submitted`);
  };

  return (
    <section className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-8 rounded-3xl shadow-xl">

        <div className="text-center">
          <UserIcon className="mx-auto h-14 w-14 text-blue-600" />
          <h2 className="text-3xl font-bold mt-4">{title}</h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">

          <Input label="Full Name" type="text" />
          <Input label="Email" type="email" />
          <Input label="Password" type="password" />

          <CountrySelect />

          {showSocials && (
            <>
              <Input label="Facebook Link" type="url" required={false} />
              <Input label="YouTube Link" type="url" required={false} />
              <Input label="Instagram Link" type="url" required={false} />
              <Input label="TikTok Link" type="url" required={false} />
            </>
          )}

          <button className={`w-full py-3 rounded-xl text-white ${buttonClass}`}>
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  );
}

function Input({ label, type, required = true }) {
  return (
    <div>
      <label className="text-sm font-semibold">{label}</label>
      <input
        type={type}
        required={required}
        className="w-full mt-2 p-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}