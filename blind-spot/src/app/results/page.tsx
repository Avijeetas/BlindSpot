import Image from "next/image";
import Head from "next/head";
import React from "react";

export default function ResultPage() {
  return (
    <div className="min-h-screen bg-[#e6d3b3] font-serif text-black px-6 py-10">
      <Head>
        <title>Prompt API Results | Blindspot</title>
        <meta name="description" content="Compare perspectives on tariffs and trade." />
      </Head>

      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold inline-block bg-green-300 px-4 py-2 rounded">Prompt API</h1>
      </div>

      {/* Views Section */}
      <div className="flex flex-col lg:flex-row justify-center items-start gap-8">
        {/* View 1 */}
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-xs">
          <h2 className="text-xl font-bold text-red-600 mb-2">Tariff</h2>
          <p className="text-sm mb-4">
            Tariffs are taxes imposed on imported goods, intended to protect domestic industries by making foreign products more expensive.
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <button>👍</button>
            <button>👎</button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">📜 Tariff News</h3>
            <ul className="text-sm text-blue-600 list-disc pl-5">
              <li><a href="#">Reuters – Trade</a></li>
              <li><a href="#">Bloomberg – Economics</a></li>
              <li><a href="#">The Guardian – Global Economy</a></li>
            </ul>
          </div>
        </div>

        {/* View 2 */}
        <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-xs">
          <h2 className="text-xl font-bold text-teal-600 mb-2">Anti-Tariff</h2>
          <p className="text-sm mb-4">
            Anti-tariff measures aim to reduce or eliminate tariffs, promoting free trade and competition by lowering costs on imported goods.
          </p>
          <div className="flex justify-center gap-4 mb-4">
            <button>👍</button>
            <button>👎</button>
          </div>
          <div>
            <h3 className="font-semibold mb-2">🌐 Anti-Tariff / Free Trade News</h3>
            <ul className="text-sm text-blue-600 list-disc pl-5">
              <li><a href="#">WTO – News</a></li>
              <li><a href="#">Brookings – Global Trade</a></li>
              <li><a href="#">Mercatus – Trade Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white p-4 rounded-lg shadow-md max-w-md w-full flex justify-center items-center">
          <Image
            src="/bar-chart.png"
            alt="Tariff & Trade Focus Chart"
            width={300}
            height={200}
          />
        </div>
      </div>
    </div>
  );
}
