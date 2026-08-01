import { useState } from "react";
import { Radio } from "lucide-react";
import {
  useCreateLiveStreamMutation,
  useGetLiveStreamQuery,
} from "../redux/api/liveApi";
import { HMSPrebuilt } from "@100mslive/roomkit-react";

export default function Live() {
  const { data: getLiveRoom, isLoading, refetch } = useGetLiveStreamQuery();
  const [createLiveRoom, { isLoading: isCreating }] =
    useCreateLiveStreamMutation();
  const [isLiveStarted, setIsLiveStarted] = useState(false);

  const liveRoom = getLiveRoom?.data;
  const hostCode = liveRoom?.roomCodes?.find((r) => r.role === "host")?.code;
  const isLive = liveRoom?.isActive === true;

  const handleCreateRoom = async () => {
    try {
      await createLiveRoom().unwrap();
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className=" px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Broadcast live to your audience
            </p>
          </div>
          {isLiveStarted && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse inline-block" />
              <span className="font-bold text-red-600">LIVE</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* ── Case 1: Room নেই ── */}
        {!liveRoom && (
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 bg-gray-100">
              <Radio className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              No Active Room
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
              Create a live room to start broadcasting.
            </p>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="px-6 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {isCreating ? "Creating..." : "+ Create Live Room"}
            </button>
          </div>
        )}

        {/* ── Case 2: Room আছে কিন্তু Live শুরু হয়নি ── */}
        {liveRoom && !isLiveStarted && (
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8 bg-gray-100">
              <Radio className="w-12 h-12 text-gray-400" />
            </div>

            <div className="mb-4 px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-500">
              ⚫ OFFLINE
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Your Studio
            </h2>
            <p className="text-gray-500 max-w-md mb-8">
              Ready to go live. Click the button below to start broadcasting.
            </p>

            {hostCode ? (
              <button
                onClick={() => setIsLiveStarted(true)}
                className="px-8 py-3 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition"
              >
                {isLive
                  ? "🔴 Your live is running — Rejoin Now"
                  : "▶ Start Live"}
              </button>
            ) : (
              <p className="text-red-500">Host code not found.</p>
            )}
          </div>
        )}

       
        {liveRoom && isLiveStarted && hostCode && (
          <div
            className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-md"
            style={{ height: "600px" }}
          >
            <HMSPrebuilt roomCode={hostCode} options={{ userName: "Host" }} />
          </div>
        )}
      </div>
    </main>
  );
}
