import React from "react";

export default function Blindspot() {
  return (
    <div className="min-h-screen bg-[#e5d3ae] text-black font-serif text-center">
      {/* Header */}
      <header className="bg-green-600 text-white p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <img src="/newspaper-icon.svg" alt="logo" className="h-6 w-6" />
        </div>
        <div className="text-sm">Log In</div>
      </header>

      {/* Main Content */}
      <main className="mt-12 flex flex-col items-center gap-6">
        <div className="p-2 text-xl">
          Check your <span className="text-green-700 font-bold text-3xl">Blindspot</span>
        </div>

        <div className="text-lg font-semibold">Stay informed | Stay ahead</div>

        <div className="p-3 max-w-xl">
          Get real-time news from to help you stay informed from every angle. <br />
          Powered by AI. Curated by you.
        </div>

        {/* Google Login */}
        <div className="bg-white p-6 rounded-xl shadow-lg mt-4 text-black">
          <div className="text-lg font-medium mb-2">Login to Continue</div>
          <button className="flex items-center gap-2 border px-4 py-2 rounded hover:bg-gray-100">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4a/Logo_2013_Google.png"
              alt="Google icon"
              className="h-5 w-5"
            />
            <span>Sign in with Google</span>
          </button>
        </div>
      </main>
    </div>
  );
}
