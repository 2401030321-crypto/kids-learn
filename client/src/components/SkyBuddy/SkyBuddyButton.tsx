import { useAuth } from "@/hooks/use-auth";
import { lazy, Suspense, useState } from "react";
import "./skybuddy.css";

const SkyBuddyModal = lazy(() => import("./SkyBuddyModal"));

export default function SkyBuddyButton() {
  const [isSkyOpen, setIsSkyOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <button
        type="button"
        onClick={() => setIsSkyOpen(true)}
        className="skybuddy-float fixed bottom-5 right-5 z-[90] flex h-[60px] w-[60px] items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-sky-300 text-3xl shadow-[0_12px_30px_rgba(56,189,248,0.48)] transition-transform hover:scale-105 sm:h-[70px] sm:w-[70px]"
        aria-label="Open SkyBuddy"
      >
        ☁️
      </button>

      {isSkyOpen && (
        <Suspense fallback={null}>
          <SkyBuddyModal onClose={() => setIsSkyOpen(false)} username={user?.username} />
        </Suspense>
      )}
    </>
  );
}
