"use client";
import { useState, useEffect } from "react";

export default function RollJournal() {
  const [rolls, setRolls] = useState([]);
  const [partner, setPartner] = useState("");
  const [duration, setDuration] = useState("");
  const [focus, setFocus] = useState("");
  const [notes, setNotes] = useState("");

  // Load saved rolls on first render
  useEffect(() => {
    const saved = localStorage.getItem("rollJournal");
    if (saved) {
      setRolls(JSON.parse(saved));
    }
  }, []);

  // Save rolls whenever they change
  useEffect(() => {
    localStorage.setItem("rollJournal", JSON.stringify(rolls));
  }, [rolls]);

  const addRoll = () => {
    if (!partner) return;
    const newRoll = {
      date: new Date().toLocaleDateString(),
      partner,
      duration,
      focus,
      notes,
    };
    setRolls([newRoll, ...rolls]);
    setPartner("");
    setDuration("");
    setFocus("");
    setNotes("");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ✅ Navbar at top */}
      <nav className="bg-gray-900 text-slate-700 p-4 flex gap-4 mb-6">
        <a href="/" className="hover:underline">Daily Log</a>
        <a href="/roll-journal" className="hover:underline">Roll Journal</a>
      </nav>

      <h1 className="text-3xl font-bold mb-4 text-center text-green-600">
        MVP Athlete V1 - Roll Journal
      </h1>

      {/* Input Form */}
      <div className="bg-white shadow-md rounded-lg p-4 max-w-md mx-auto mb-6">
        <input
          className="border p-2 w-full mb-2 text-slate-700"
          placeholder="Training Partner"
          value={partner}
          onChange={(e) => setPartner(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2 text-slate-700"
          placeholder="Duration (mins)"
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
        <input
          className="border p-2 w-full mb-2 text-slate-700"
          placeholder="Focus (guard passing, escapes, submissions...)"
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
        />
        <textarea
          className="border p-2 w-full mb-2 text-slate-700"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button
          className="bg-green-500 text-white p-2 rounded w-full"
          onClick={addRoll}
        >
          Save Roll
        </button>
      </div>

      {/* Saved Rolls */}
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2 text-slate-900">Previous Rolls</h2>
        {rolls.length === 0 && <p className="text-gray-500">No rolls yet.</p>}
        <ul>
          {rolls.map((roll, i) => (
            <li key={i} className="bg-white p-3 rounded-lg shadow mb-2 text-slate-900">
              <p><b>Date:</b> {roll.date}</p>
              <p><b>Partner:</b> {roll.partner}</p>
              <p><b>Duration:</b> {roll.duration} min</p>
              <p><b>Focus:</b> {roll.focus}</p>
              <p><b>Notes:</b> {roll.notes}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
