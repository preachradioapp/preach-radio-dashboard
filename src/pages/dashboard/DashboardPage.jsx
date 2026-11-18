import { Button, List, Skeleton } from "antd";
import { Disc3, Eye, Mic, ShieldAlert, UserCheck, UserCog, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetDashboardStatsQuery } from "../../api/adminApi";
import { useGetCreatorsQuery, useSetCreatorApprovalMutation } from "../../api/peopleApi";
import { useGetPodcastsQuery } from "../../api/mediaApi";
import { useGetProfileQuery } from "../../api/authApi";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import Surface from "../../components/ui/Surface";
import UserCell from "../../components/ui/UserCell";
import { EmptyState, ErrorState } from "../../components/ui/States";
import { useAction } from "../../hooks/useAction";
import { formatNumber, fromNow } from "../../lib/format";
import GrowthChart from "./GrowthChart";
import CoverImage from "../../components/ui/CoverImage";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
};

const PendingCreators = () => {
  const { data, isLoading, error, refetch } = useGetCreatorsQuery({ isApproved: false, limit: 5, page: 1 });
  const [setApproval, { isLoading: approving, originalArgs }] = useSetCreatorApprovalMutation();
  const run = useAction();
  const items = data?.result ?? [];

  return (
    <Surface
      title="Creator requests"
      extra={
        <Link to="/creators?status=pending" className="text-sm font-medium text-brand">
          View all
        </Link>
      }
      bodyClassName="!pt-2"
    >
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 3 }} />
      ) : items.length === 0 ? (
        <EmptyState icon={UserCheck} title="You're all caught up" description="No creators are waiting for approval." />
      ) : (
        <List
          dataSource={items}
          renderItem={(c) => (
            <List.Item
              className="!px-0"
              actions={[
                <Button
                  key="approve"
                  size="small"
                  type="primary"
                  loading={approving && originalArgs?.id === c._id}
                  onClick={() => run(setApproval({ id: c._id, isApproved: true }), { success: `${c.name} approved` })}
                >
                  Approve
                </Button>,
              ]}
            >
              <UserCell name={c.name} image={c.profile_image} subtitle={`${c.email} · ${fromNow(c.createdAt)}`} />
            </List.Item>
          )}
        />
      )}
    </Surface>
  );
};

const LatestPodcasts = () => {
  const { data, isLoading, error, refetch } = useGetPodcastsQuery({ page: 1, limit: 5 });
  const items = data?.result ?? [];

  return (
    <Surface
      title="Latest podcasts"
      extra={
        <Link to="/podcasts" className="text-sm font-medium text-brand">
          View all
        </Link>
      }
      bodyClassName="!pt-2"
    >
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isLoading ? (
        <Skeleton active avatar paragraph={{ rows: 3 }} />
      ) : items.length === 0 ? (
        <EmptyState icon={Mic} title="No podcasts yet" />
      ) : (
        <List
          dataSource={items}
          renderItem={(p) => (
            <List.Item className="!px-0">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <CoverImage src={p.coverImage} iconSize={16} className="h-11 w-11 shrink-0 rounded-lg bg-canvas object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink">{p.title}</div>
                  <div className="truncate text-xs text-muted">
                    {p.category?.name} · {p.creator?.name || p.station?.name || "Station"}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs tabular-nums text-muted">
                  <Eye size={14} /> {formatNumber(p.totalView)}
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Surface>
  );
};

const DashboardPage = () => {
  const { data: stats, isLoading, error, refetch } = useGetDashboardStatsQuery(undefined, {
    refetchOnMountOrArgChange: 60,
  });
  const { data: profile } = useGetProfileQuery();
  const firstName = profile?.name?.split(" ")[0];

  const tiles = [
    { label: "Users", value: stats?.totalUser, icon: Users, to: "/users", hint: "Registered listeners" },
    {
      label: "Creators",
      value: stats?.totalCreator,
      icon: UserCog,
      to: stats?.pendingCreator ? "/creators?status=pending" : "/creators",
      hint: stats?.pendingCreator ? `${formatNumber(stats.pendingCreator)} awaiting approval` : "All approved",
    },
    {
      label: "Podcasts",
      value: stats?.totalPodcast,
      icon: Mic,
      to: "/podcasts",
      hint: stats ? `${formatNumber(stats.totalViews)} total plays` : null,
    },
    {
      label: "Albums",
      value: stats?.totalAlbum,
      icon: Disc3,
      to: "/albums",
      hint: stats ? `Across ${formatNumber(stats.totalCategory)} categories` : null,
    },
    { label: "Reports", value: stats?.totalReport, icon: ShieldAlert, to: "/reports", hint: "Submitted by the community" },
  ];

  return (
    <>
      <PageHeader
        title={`${greeting()}${firstName ? `, ${firstName}` : ""}`}
        subtitle="Here's what's happening across Preach Radio."
      />

      {error ? (
        <Surface className="mb-6">
          <ErrorState error={error} onRetry={refetch} title="Couldn't load dashboard stats" />
        </Surface>
      ) : (
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {tiles.map((t) => (
            <StatCard key={t.label} {...t} loading={isLoading} />
          ))}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <GrowthChart />
        <PendingCreators />
      </div>
      <div className="mt-6">
        <LatestPodcasts />
      </div>
    </>
  );
};

export default DashboardPage;
