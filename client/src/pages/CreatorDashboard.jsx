import { useMemo, useState } from "react";
import {
  CheckCircleIcon,
  CreditCardIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Navbar from "../components/Navbar";

const plans = [
  { name: "Standard", discount: 0, monthly: 0, label: "No discount" },
  { name: "Premium", discount: 10, monthly: 20, label: "10% discount" },
  { name: "Diamond", discount: 20, monthly: 30, label: "20% discount + top priority" },
];

const platforms = [
  { key: "facebook_follow", label: "Facebook follower", price: 0.01 },
  { key: "facebook_view", label: "Facebook view", price: 0.007 },
  { key: "youtube_sub", label: "YouTube subscriber", price: 0.02 },
  { key: "youtube_view", label: "YouTube view", price: 0.007 },
  { key: "tiktok_follow", label: "TikTok follower", price: 0.01 },
  { key: "tiktok_view", label: "TikTok view", price: 0.005 },
  { key: "instagram_follow", label: "Instagram follower", price: 0.01 },
  { key: "instagram_view", label: "Instagram view", price: 0.005 },
  { key: "app_install", label: "App Install", price: 0.03 },
];

export default function CreatorDashboard() {
  const [selectedPlan, setSelectedPlan] = useState(plans[0]);
  const [creatorName, setCreatorName] = useState("");
  const [platform, setPlatform] = useState("facebook_follow");
  const [actionCount, setActionCount] = useState(1000);
  const [socialLink, setSocialLink] = useState("");
  const [creatorBalance, setCreatorBalance] = useState(100);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);

  const selectedPlatform = platforms.find((item) => item.key === platform);

  const totalCost = useMemo(() => {
    const baseCost = Number(actionCount || 0) * selectedPlatform.price;
    const discountAmount = (baseCost * selectedPlan.discount) / 100;
    return baseCost - discountAmount;
  }, [actionCount, selectedPlatform, selectedPlan]);

  const handleCreateTask = () => {
    if (!creatorName.trim() || !socialLink.trim()) {
      alert("Please enter creator name and social link");
      return;
    }

    if (Number(creatorBalance) < totalCost) {
      alert("Insufficient balance");
      return;
    }

    const newTask = {
      id: Date.now(),
      creatorName,
      platform: selectedPlatform.label,
      actionCount,
      socialLink,
      plan: selectedPlan.name,
      cost: totalCost,
      status: "Active",
      date: new Date().toLocaleString(),
    };

    setTasks((prev) => [newTask, ...prev]);

    setPayments((prev) => [
      {
        id: Date.now() + 1,
        amount: totalCost,
        plan: selectedPlan.name,
        date: new Date().toLocaleString(),
      },
      ...prev,
    ]);

    setCreatorBalance((prev) => Number(prev) - totalCost);
    setSocialLink("");
  };

  return (
    <section className="min-h-screen bg-gray-50 px-4 py-8">
      <Navbar/>
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            🎯 PPT Creator Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Select your plan, post tasks, and track performance.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-center text-xl font-semibold">
            Choose Your Creator Plan
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {plans.map((plan) => {
              const active = selectedPlan.name === plan.name;

              return (
                <button
                  key={plan.name}
                  onClick={() => setSelectedPlan(plan)}
                  className={`rounded-2xl border-2 p-5 text-center transition hover:scale-[1.02] ${
                    active
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <h3 className="text-lg font-bold">{plan.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{plan.label}</p>
                  <p className="mt-3 font-semibold">
                    {plan.monthly === 0 ? "0% OFF" : `$${plan.monthly}/month`}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 p-5">
            <div className="mb-3 flex items-center gap-2">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-bold">Plan Summary</h3>
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-5">
              <p><strong>Plan:</strong> {selectedPlan.name}</p>
              <p><strong>Discount:</strong> {selectedPlan.discount}%</p>
              <p><strong>Monthly:</strong> ${selectedPlan.monthly}</p>
              <p><strong>6 Months:</strong> ${selectedPlan.monthly * 6}</p>
              <p><strong>12 Months:</strong> ${selectedPlan.monthly * 12}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-center text-xl font-semibold">Post a Task</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Creator Name</label>
              <input
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                placeholder="Your name"
                value={creatorName}
                onChange={(e) => setCreatorName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Platform & Action</label>
              <select
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                {platforms.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label} ${item.price.toFixed(3)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Action Count</label>
              <input
                type="number"
                min="1"
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                value={actionCount}
                onChange={(e) => setActionCount(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Creator Balance USD</label>
              <input
                type="number"
                min="0"
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                value={creatorBalance}
                onChange={(e) => setCreatorBalance(Number(e.target.value))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Social Link</label>
              <input
                className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                placeholder="https://..."
                value={socialLink}
                onChange={(e) => setSocialLink(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-blue-50 p-4 text-blue-700">
            <strong>Total with discount:</strong> ${totalCost.toFixed(2)}
          </div>

          <button
            onClick={handleCreateTask}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            <CreditCardIcon className="h-5 w-5" />
            Pay & Post Task
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Your Posted Tasks</h2>

          <div className="mt-4 space-y-4">
            {tasks.length === 0 ? (
              <p className="text-gray-500">No task posted yet.</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="rounded-2xl border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-bold">{task.platform}</h3>
                    <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                      {task.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-gray-600 md:grid-cols-2">
                    <p>Creator: {task.creatorName}</p>
                    <p>Actions: {Number(task.actionCount).toLocaleString()}</p>
                    <p>Plan: {task.plan}</p>
                    <p>Cost: ${task.cost.toFixed(2)}</p>
                    <p>Date: {task.date}</p>
                  </div>

                  <a
                    href={task.socialLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-sm text-blue-600 underline"
                  >
                    View Link
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Payment / Creator History</h2>

          <div className="mt-4 space-y-3">
            {payments.length === 0 ? (
              <p className="text-gray-500">No payment history yet.</p>
            ) : (
              payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap justify-between gap-3 border-b pb-3"
                >
                  <div>
                    <p className="font-semibold">{payment.plan} Plan</p>
                    <p className="text-sm text-gray-500">{payment.date}</p>
                  </div>

                  <p className="font-bold text-green-600">
                    ${payment.amount.toFixed(2)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}