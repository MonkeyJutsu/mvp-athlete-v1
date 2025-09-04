"use client";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DailyLog() {
  // ---- Food DB (fetched from /public) ----
  const [foodDatabase, setFoodDatabase] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetch("/data/foodDatabase.json")
      .then((res) => res.json())
      .then((data) => setFoodDatabase(data))
      .catch((err) => console.error("Error loading food database:", err));
  }, []);

  // ---- Weight Tracker ----
  const [weightLogs, setWeightLogs] = useState([]);
  const [weightInput, setWeightInput] = useState("");
  const [weightNotes, setWeightNotes] = useState("");

  useEffect(() => {
    const savedWeight = localStorage.getItem("weightLogs");
    if (savedWeight) setWeightLogs(JSON.parse(savedWeight));
  }, []);

  useEffect(() => {
    localStorage.setItem("weightLogs", JSON.stringify(weightLogs));
  }, [weightLogs]);

  const addWeightLog = () => {
    if (!weightInput) return;
    const newLog = {
      date: new Date().toLocaleDateString(),
      weight: parseFloat(weightInput),
      notes: weightNotes || "",
    };
    setWeightLogs([newLog, ...weightLogs]);
    setWeightInput("");
    setWeightNotes("");
  };

  // ---- Food Logger ----
  const [foods, setFoods] = useState([]);
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [foodNotes, setFoodNotes] = useState("");

  useEffect(() => {
    const savedFoods = localStorage.getItem("foodLogs");
    if (savedFoods) setFoods(JSON.parse(savedFoods));
  }, []);

  useEffect(() => {
    localStorage.setItem("foodLogs", JSON.stringify(foods));
  }, [foods]);

  const addFood = () => {
    if (!food || !quantity) return;
    const dbItem = foodDatabase[food.toLowerCase()];
    if (!dbItem) {
      alert("Food not found in database. Try a suggestion from the dropdown.");
      return;
    }
    const qty = parseFloat(quantity);
    const mult = qty / 100; // all entries are per 100 g / ml

    const newFood = {
      date: new Date().toLocaleDateString(),
      name: food,
      unit: dbItem.unit || "g",
      quantity: qty,
      calories: +(dbItem.calories * mult).toFixed(1),
      protein: +(dbItem.protein * mult).toFixed(1),
      carbs: +(dbItem.carbs * mult).toFixed(1),
      fat: +(dbItem.fat * mult).toFixed(1),
      notes: foodNotes || "",
      per100: {
        calories: dbItem.calories,
        protein: dbItem.protein,
        carbs: dbItem.carbs,
        fat: dbItem.fat,
      },
    };
    setFoods([newFood, ...foods]);
    setFood("");
    setQuantity("");
    setFoodNotes("");
  };

  // ---- Clear Logs ----
  const clearLogs = () => {
    if (confirm("Clear all logs? This cannot be undone.")) {
      setFoods([]);
      setWeightLogs([]);
      localStorage.removeItem("foodLogs");
      localStorage.removeItem("weightLogs");
    }
  };

  // ---- Suggestions for food autosuggest ----
  const suggestions =
    food && Object.keys(foodDatabase).length
      ? Object.keys(foodDatabase)
          .filter((k) => k.toLowerCase().includes(food.toLowerCase()))
          .slice(0, 8)
      : [];

  // ---- Daily Totals ----
  const today = new Date().toLocaleDateString();
  const todayFoods = foods.filter((f) => f.date === today);

  const totals = todayFoods.reduce(
    (acc, f) => {
      acc.calories += parseFloat(f.calories);
      acc.protein += parseFloat(f.protein);
      acc.carbs += parseFloat(f.carbs);
      acc.fat += parseFloat(f.fat);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-slate-700">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white p-4 flex gap-4 mb-6 rounded-lg">
        <a href="/" className="hover:underline">Daily Log</a>
        <a href="/roll-journal" className="hover:underline">Roll Journal</a>
      </nav>

      <h1 className="text-3xl font-bold mb-6 text-center text-sky-500">
        MVP Athlete V1
      </h1>

      {/* ===== Weight Tracker ===== */}
      <section className="bg-white shadow-md rounded-lg p-4 max-w-2xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Weight Tracker</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            className="border p-2 w-full text-slate-700"
            placeholder="Weight (lbs)"
            type="number"
            value={weightInput}
            onChange={(e) => setWeightInput(e.target.value)}
          />
          <input
            className="border p-2 w-full md:col-span-2 text-slate-700"
            placeholder="Notes (optional)"
            value={weightNotes}
            onChange={(e) => setWeightNotes(e.target.value)}
          />
        </div>

        <button
          className="bg-blue-600 text-white p-2 rounded w-full md:w-auto"
          onClick={addWeightLog}
        >
          Save Weight
        </button>

        {/* Chart */}
        <div className="mt-6 h-[300px]">
          {weightLogs.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[...weightLogs].reverse()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#2563eb"
                  strokeWidth={3}
                  name="Weight (lbs)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500">No weight data yet. Add a weight to see your progress.</p>
          )}
        </div>
      </section>

      {/* ===== Food Log ===== */}
      <section className="bg-white shadow-md rounded-lg p-4 max-w-2xl mx-auto mb-8">
        <h2 className="text-xl font-bold mb-4">Food Log</h2>

        {/* Food + Suggestions */}
        <div className="relative mb-3">
          <input
            className="border p-2 w-full text-slate-700"
            placeholder="Food (e.g. chicken breast)"
            value={food}
            onChange={(e) => {
              setFood(e.target.value);
              setShowSuggestions(true);
            }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          />
          {showSuggestions && food && suggestions.length > 0 && (
            <ul className="absolute bg-white border w-full mt-1 max-h-40 overflow-y-auto z-10 rounded">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="p-2 hover:bg-blue-100 cursor-pointer"
                  onClick={() => {
                    setFood(s);
                    setShowSuggestions(false);
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <input
            className="border p-2 w-full text-slate-700"
            placeholder="Quantity (g/ml)"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <input
            className="border p-2 w-full md:col-span-2 text-slate-700"
            placeholder="Notes (optional)"
            value={foodNotes}
            onChange={(e) => setFoodNotes(e.target.value)}
          />
        </div>

        <button
          className="bg-emerald-600 text-white p-2 rounded w-full md:w-auto"
          onClick={addFood}
        >
          Save Food
        </button>

        {/* Meals list */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Meals</h3>
          {foods.length === 0 && <p className="text-slate-500">No food logged yet.</p>}
          <ul>
            {foods.map((f, i) => (
              <li key={i} className="bg-gray-50 border p-3 rounded mb-2">
                <p><b>Date:</b> {f.date}</p>
                <p><b>Food:</b> {f.name}</p>
                <p><b>Quantity:</b> {f.quantity} {f.unit}</p>
                <p><b>Calories:</b> {f.calories}</p>
                <p>
                  <b>Protein:</b> {f.protein} g ·{" "}
                  <b>Carbs:</b> {f.carbs} g ·{" "}
                  <b>Fat:</b> {f.fat} g
                </p>
                {f.notes ? <p><b>Notes:</b> {f.notes}</p> : null}

                {/* ✅ Safe check for per100 */}
                {f.per100 && (
                  <p className="text-xs text-slate-500 mt-1">
                    per 100{f.unit}: {f.per100.calories} kcal, {f.per100.protein} P, {f.per100.carbs} C, {f.per100.fat} F
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* ✅ Daily Totals Bar */}
        {todayFoods.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-700">Today's Totals</h3>
            <p>
              <b>Calories:</b> {totals.calories.toFixed(1)} kcal ·{" "}
              <b>Protein:</b> {totals.protein.toFixed(1)} g ·{" "}
              <b>Carbs:</b> {totals.carbs.toFixed(1)} g ·{" "}
              <b>Fat:</b> {totals.fat.toFixed(1)} g
            </p>
          </div>
        )}
      </section>

      {/* Clear logs button */}
      <div className="max-w-2xl mx-auto text-center">
        <button
          className="bg-red-600 text-white p-2 rounded"
          onClick={clearLogs}
        >
          Clear All Logs
        </button>
      </div>
    </div>
  );
}
