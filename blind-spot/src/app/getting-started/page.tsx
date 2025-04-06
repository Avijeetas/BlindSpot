import Image from "next/image";
import Head from "next/head";
import React from "react";

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-[#e6d3b3] font-serif text-black">
      <Head>
        <title>Getting Started | Blindspot</title>
        <meta name="description" content="Tell us about yourself to personalize your experience." />
      </Head>

      {/* Header */}
      <header className="bg-green-400 text-black p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Image src="/newspaper-icon.svg" alt="logo" width={28} height={28} />
        </div>
        <span className="text-xl font-semibold">Ready to get started ?</span>
        <span>⚙️</span>
      </header>

      {/* Form Body */}
      <main className="flex flex-col items-center p-8">
        <h2 className="text-2xl font-semibold mb-6">Let’s get to know you first :</h2>

        <div className="flex flex-col md:flex-row items-start gap-12">
          {/* Timeline Dots */}
          <div className="flex flex-col items-center gap-16 mt-6">
            <div className="w-5 h-5 bg-black rounded-full shadow-lg" />
            <div className="w-1 h-24 bg-black" />
            <div className="w-5 h-5 bg-black rounded-full shadow-lg" />
            <div className="w-1 h-24 bg-black" />
            <div className="w-5 h-5 bg-black rounded-full shadow-lg" />
          </div>

          {/* Inputs Section */}
          <div className="flex flex-col gap-12">
            {/* Who are you */}
            <div>
              <h3 className="text-2xl font-bold mb-4">Who are you?</h3>
              <div className="flex flex-wrap gap-6 items-center">
                <input
                  type="text"
                  placeholder="How old are you ?"
                  className="bg-gray-200 px-4 py-2"
                />
                <div className="flex items-center gap-2">
                  <span>Gender?</span>
                  <button className="bg-gray-200 px-3 py-1">M</button>
                  <button className="bg-gray-200 px-3 py-1">F</button>
                  <button className="bg-gray-200 px-3 py-1">N/A</button>
                </div>
                <input
                  type="text"
                  placeholder="Where are you?"
                  className="bg-gray-200 px-4 py-2"
                />
              </div>
            </div>

            {/* Interests */}
            <div>
              <h3 className="text-2xl font-bold mb-4">What are you interested in?</h3>
              <button className="bg-gray-200 px-6 py-3">Recent National Headlines</button>
            </div>

            {/* Get Reading */}
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Get reading!</h3>
              <button className="bg-gray-200 px-6 py-3">Go!</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
