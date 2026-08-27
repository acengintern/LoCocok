"use client";

import GridShape from "@/components/common/GridShape";
import { useSettings } from "@/hooks/useSettings";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";

const AGENCY_QUOTES = [
  "Saya sempatkan waktu bikin sistem ini biar kalian beneran kerja ya! Yuk login, selesaikan task, dan jangan numpuk revisi.",
  "Client minta deadline maju besok pagi. Kopi sudah siap, sekarang giliran kalian login dan gas!",
  "Brief tolong dibaca pelan-pelan ya, jangan sampai nanya hal yang sudah tertulis jelas di dokumen.",
  "Gajian lancar berawal dari task yang nggak tertunda. Yuk selesaikan antrean approval hari ini!",
  "File 'final_fix_banget_v12_fix_final.mp4' itu nyata. Login sekarang biar statusnya beneran Approved.",
  "Work-life balance itu indah, tapi bakal jauh lebih indah kalau task hari ini kelar tepat waktu.",
  "Jangan tunggu ditagih di grup WhatsApp baru buka dashboard. Jadilah proaktif, kawan!",
  "Aset jangan disimpan di desktop lokal terus ya. Upload ke sistem biar nggak panik pas dicari client.",
  "Kreativitas tanpa eksekusi cuma jadi wacana. Buka task kalian dan mulai render sekarang!",
  "Matahari terbit dari timur, revisi datang dari client, dan solusinya cuma satu: selesaikan di sini!",
  "Kalau ada cara yang terorganisir kenapa harus ribet? Login, cek timeline, langsung bereskan.",
  "Sistem ini dibuat dengan dedikasi dan sedikit tekanan deadline. Tolong jangan dianggurin ya!"
];

export default function AuthHeroBanner() {
  const { settings } = useSettings();
  const agencyName = settings?.agency_name || "LOCO TRACK";
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"in" | "out">("in");
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      // Start fade out
      setFadeState("out");
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % AGENCY_QUOTES.length);
        setFadeState("in");
      }, 350);
    }, 4500);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden relative overflow-hidden select-none">
      <div className="relative items-center justify-center flex z-1 w-full h-full p-8">
        {/* <!-- ===== Common Grid Shape Start ===== --> */}
        <GridShape />
        <div className="flex flex-col items-center max-w-lg text-center">
          <Link href="/" className="flex flex-col items-center group">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 dark:bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-3 mb-5 transition-transform duration-300 group-hover:scale-105">
              <Image
                width={64}
                height={64}
                className="w-full h-full object-contain"
                src="/images/logo/loco.png"
                alt={agencyName}
                priority
              />
            </div>
            <span className="font-bold text-2xl sm:text-3xl tracking-tight text-white leading-tight mb-4">
              {agencyName}
            </span>
          </Link>

          {/* Animated Quotes Card */}
          <div
            className="w-full max-w-md min-h-[90px] flex items-center justify-center cursor-pointer group"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            title="Hover untuk menjeda kutipan"
          >
            <p
              className={`text-center text-sm sm:text-base font-medium text-gray-200 dark:text-white/90 leading-relaxed transition-all duration-350 transform ${
                fadeState === "in"
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 -translate-y-2 scale-95"
              }`}
            >
              &ldquo;{AGENCY_QUOTES[currentQuoteIndex]}&rdquo;
            </p>
          </div>

          {/* Progress / Navigation Dots */}
          <div className="flex items-center gap-1.5 mt-5">
            {AGENCY_QUOTES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFadeState("out");
                  setTimeout(() => {
                    setCurrentQuoteIndex(idx);
                    setFadeState("in");
                  }, 200);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentQuoteIndex
                    ? "w-6 bg-brand-400 dark:bg-brand-400"
                    : "w-1.5 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Lihat kutipan ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
