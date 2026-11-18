import { lazy, Suspense, useState } from "react";
import { Button, Skeleton } from "antd";
import { Radio, RadioTower } from "lucide-react";
import { useCreateLiveRoomMutation, useGetLiveRoomQuery } from "../../api/mediaApi";
import { useGetProfileQuery } from "../../api/authApi";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorState, PageLoader } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";

// The 100ms SDK is very large; only load it when the admin actually enters the studio.
const HMSPrebuilt = lazy(() => import("@100mslive/roomkit-react").then((m) => ({ default: m.HMSPrebuilt })));

const LivePage = () => {
  const { data: room, isLoading, error, refetch } = useGetLiveRoomQuery(undefined, { refetchOnMountOrArgChange: true });
  const { data: profile } = useGetProfileQuery();
  const [createRoom, { isLoading: creating }] = useCreateLiveRoomMutation();
  const [inStudio, setInStudio] = useState(false);
  const run = useAction();

  const hostCode = room?.roomCodes?.find((r) => r.role === "host")?.code;
  const isLive = room?.isActive === true;

  const header = (
    <PageHeader
      title="Go Live"
      subtitle="Broadcast live to everyone listening on the station."
      actions={isLive ? <StatusBadge tone="danger">Live now</StatusBadge> : room ? <StatusBadge>Offline</StatusBadge> : null}
    />
  );

  if (error) {
    return (
      <>
        {header}
        <Surface>
          <ErrorState error={error} onRetry={refetch} />
        </Surface>
      </>
    );
  }

  if (inStudio && hostCode) {
    return (
      <>
        {header}
        <div className="h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-2xl border border-line bg-black shadow-card">
          <Suspense fallback={<PageLoader />}>
            <HMSPrebuilt
              roomCode={hostCode}
              options={{ userName: profile?.name || "Preach Radio" }}
              onLeave={() => {
                setInStudio(false);
                refetch();
              }}
            />
          </Suspense>
        </div>
      </>
    );
  }

  return (
    <>
      {header}
      <Surface>
        {isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center">
            <div className={`mb-6 grid h-20 w-20 place-items-center rounded-full ${isLive ? "bg-red-50 text-danger" : "bg-canvas text-muted"}`}>
              {room ? <Radio size={34} strokeWidth={1.6} /> : <RadioTower size={34} strokeWidth={1.6} />}
            </div>
            {!room ? (
              <>
                <h2 className="text-xl font-semibold text-ink">Set up your studio</h2>
                <p className="mt-2 text-sm text-muted">Create the station&apos;s live room once. You can broadcast from it any time after that.</p>
                <Button type="primary" size="large" className="mt-6" loading={creating} onClick={() => run(createRoom(), { success: "Studio is ready" })}>
                  Create live room
                </Button>
              </>
            ) : !hostCode ? (
              <>
                <h2 className="text-xl font-semibold text-ink">Studio unavailable</h2>
                <p className="mt-2 text-sm text-muted">The live room has no host access code. Try again in a moment.</p>
                <Button className="mt-6" onClick={refetch}>
                  Retry
                </Button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-ink">{isLive ? "You're on air" : "Your studio is ready"}</h2>
                <p className="mt-2 text-sm text-muted">
                  {isLive
                    ? "A broadcast is running. Rejoin to continue hosting it."
                    : "Check your microphone and camera in the next step before going live."}
                </p>
                <Button type="primary" size="large" className="mt-6" onClick={() => setInStudio(true)}>
                  {isLive ? "Rejoin broadcast" : "Enter studio"}
                </Button>
              </>
            )}
          </div>
        )}
      </Surface>
    </>
  );
};

export default LivePage;
