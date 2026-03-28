"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, StickyNote, Timer, Brain, ArrowRight } from "lucide-react";

const TypewriterText = ({ text, delay = 100 }) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <span>
      {currentText}
      <motion.span
        animate={{ opacity: [1, 0, 1] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        className="inline-block w-1 h-12 bg-[#1d4ed8] ml-1 align-middle"
      />
    </span>
  );
};

export default function LandingPage() {
  const features = [
    { text: "Daily Tasks & Checklists", icon: <CheckCircle2 size={24} /> },
    { text: "Smart Note Taking", icon: <StickyNote size={24} /> },
    { text: "Pomodoro Timer", icon: <Brain size={24} /> },
    { text: "Time Management", icon: <Timer size={24} /> },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 overflow-hidden">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#1d4ed8]/60 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#1e40af]/60 rounded-full blur-[150px] pointer-events-none"
      />

      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        <div className="space-y-6">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight h-24 md:h-32 flex items-center justify-center flex-col sm:flex-row leading-14">
            Welcome to{" "}
            <span className="text-[#1d4ed8] ml-4">
              <TypewriterText text="Orbit" />
            </span>
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto"
          >
            The ultimate productivity system designed to help you stay focused,
            organized, and achieve your goals every single day.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 2, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12 mb-16 text-left"
        >
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              className="group flex items-center gap-4 p-5 rounded-2xl glass border border-zinc-800/50 hover:border-[#1d4ed8]/50 transition-colors shadow-lg shadow-black/50"
            >
              <div className="p-3 bg-zinc-900 group-hover:bg-[#1d4ed8]/20 group-hover:text-[#1d4ed8] text-zinc-400 transition-colors rounded-xl">
                {feature.icon}
              </div>
              <span className="text-zinc-200 font-medium text-lg">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="flex flex-col items-center gap-6"
        >
          <Link href="/login" className="group">
            <motion.button
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative overflow-hidden flex items-center gap-3 px-12 py-5 bg-gradient-to-r from-[#1d4ed8] to-[#1e40af] rounded-full text-white font-semibold text-xl shadow-[0_0_30px_rgba(29,78,216,0.4)] transition-all duration-300 btn-premium"
            >
              <span className="relative z-10">Let's Go</span>
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative z-10"
              >
                <ArrowRight
                  size={24}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </motion.div>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
