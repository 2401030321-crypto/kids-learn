import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Heart, MessageCircle, Share2, ChevronUp, ChevronDown } from "lucide-react";

interface Short {
  id: number;
  title: string;
  description: string | null;
  thumbnailUrl: string;
  videoUrl: string | null;
  likes: number | null;
}

export default function Shorts() {
  const { getAuthHeader } = useAuth();
  const [shorts, setShorts] = useState<Short[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchShorts();
  }, []);

  const fetchShorts = async () => {
    try {
      const response = await fetch("/api/content/shorts", {
        headers: getAuthHeader(),
      });
      const data = await response.json();
      setShorts(data);
    } catch (err) {
      console.error("Failed to fetch shorts:", err);
    }
    setLoading(false);
  };

  const handleScroll = (direction: "up" | "down") => {
    if (direction === "up" && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === "down" && currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      handleScroll("up");
    } else if (e.key === "ArrowDown") {
      handleScroll("down");
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 0) {
      handleScroll("down");
    } else {
      handleScroll("up");
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-b from-purple-500 to-pink-500">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold">No Shorts Yet!</h2>
          <p className="mt-2">Check back later for fun short videos!</p>
        </div>
      </div>
    );
  }

  const currentShort = shorts[currentIndex];

  return (
    <div
      ref={containerRef}
      className="h-screen bg-black overflow-hidden relative"
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      tabIndex={0}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="relative w-full max-w-md h-full"
          style={{
            backgroundImage: `url(${currentShort.thumbnailUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          
          <div className="absolute bottom-20 left-4 right-16 text-white">
            <h3 className="text-xl font-bold drop-shadow-lg">{currentShort.title}</h3>
            {currentShort.description && (
              <p className="text-sm mt-2 opacity-90 line-clamp-2">{currentShort.description}</p>
            )}
          </div>

          <div className="absolute right-4 bottom-24 flex flex-col gap-6">
            <button className="flex flex-col items-center text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition">
                <Heart className="w-7 h-7" />
              </div>
              <span className="text-sm mt-1">{currentShort.likes || 0}</span>
            </button>
            <button className="flex flex-col items-center text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition">
                <MessageCircle className="w-7 h-7" />
              </div>
              <span className="text-sm mt-1">0</span>
            </button>
            <button className="flex flex-col items-center text-white">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition">
                <Share2 className="w-7 h-7" />
              </div>
              <span className="text-sm mt-1">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-10">
        <button
          onClick={() => handleScroll("up")}
          disabled={currentIndex === 0}
          className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition disabled:opacity-30"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
        <button
          onClick={() => handleScroll("down")}
          disabled={currentIndex === shorts.length - 1}
          className="bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition disabled:opacity-30"
        >
          <ChevronDown className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm">
        {currentIndex + 1} / {shorts.length}
      </div>
    </div>
  );
}
