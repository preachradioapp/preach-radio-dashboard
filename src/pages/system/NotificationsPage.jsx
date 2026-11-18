import { useEffect, useMemo } from "react";
import { Button, List, Pagination, Skeleton } from "antd";
import { Bell, BellOff, CheckCheck, Trash2 } from "lucide-react";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkNotificationsSeenMutation,
} from "../../api/adminApi";
import { useGetProfileQuery } from "../../api/authApi";
import IconAction from "../../components/ui/IconAction";
import PageHeader from "../../components/ui/PageHeader";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { useListParams } from "../../hooks/useListParams";
import { formatDateTime, fromNow } from "../../lib/format";

const NotificationsPage = () => {
  const list = useListParams({ limit: 15 });
  const { data, isLoading, isFetching, error, refetch } = useGetNotificationsQuery(list.queryArgs);
  const { data: profile } = useGetProfileQuery();
  const [markSeen, { isLoading: marking }] = useMarkNotificationsSeenMutation();
  const [deleteNotification, deleteState] = useDeleteNotificationMutation();
  const run = useAction();
  const items = useMemo(() => data?.result ?? [], [data]);

  const isUnread = (n) => profile?._id && !n.seenBy?.includes(profile._id);
  const unreadCount = items.filter(isUnread).length;

  // Opening the page marks everything as read (after a short delay so unread items are visible first).
  useEffect(() => {
    if (!unreadCount) return undefined;
    const id = setTimeout(() => markSeen(), 2500);
    return () => clearTimeout(id);
  }, [unreadCount, markSeen]);

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Activity that needs an administrator's attention."
        actions={
          unreadCount > 0 && (
            <Button icon={<CheckCheck size={16} />} loading={marking} onClick={() => run(markSeen(), { success: "All caught up" })}>
              Mark all as read
            </Button>
          )
        }
      />
      <Surface padded={false}>
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <div className="p-5">
            <Skeleton active avatar paragraph={{ rows: 4 }} />
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={BellOff} title="No notifications" description="You'll see new creator sign-ups and other alerts here." />
        ) : (
          <List
            className={isFetching ? "opacity-70" : ""}
            dataSource={items}
            renderItem={(n) => {
              const unread = isUnread(n);
              return (
                <List.Item
                  className={`!px-5 !py-4 ${unread ? "bg-brand-50/40" : ""}`}
                  actions={[
                    <IconAction
                      key="del"
                      icon={Trash2}
                      label="Delete"
                      tone="danger"
                      loading={deleteState.isLoading && deleteState.originalArgs === n._id}
                      onClick={() => run(deleteNotification(n._id), { silent: true })}
                    />,
                  ]}
                >
                  <div className="flex min-w-0 gap-3">
                    <span
                      className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full ${unread ? "bg-brand text-white" : "bg-canvas text-muted"}`}
                    >
                      <Bell size={16} />
                    </span>
                    <div className="min-w-0">
                      <div className={`text-sm ${unread ? "font-semibold text-ink" : "font-medium text-ink-soft"}`}>{n.title}</div>
                      <p className="mt-0.5 text-sm text-muted">{n.message}</p>
                      <div className="mt-1 text-xs text-muted" title={formatDateTime(n.createdAt)}>
                        {fromNow(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </List.Item>
              );
            }}
          />
        )}
      </Surface>
      {data?.meta?.total > list.limit && (
        <div className="mt-6 flex justify-center">
          <Pagination current={list.page} pageSize={list.limit} total={data.meta.total} onChange={list.onPageChange} showSizeChanger={false} />
        </div>
      )}
    </>
  );
};

export default NotificationsPage;
