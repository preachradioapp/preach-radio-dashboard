import { useState } from "react";
import { Eye, Users } from "lucide-react";
import { useGetUsersQuery } from "../../api/peopleApi";
import DataTable from "../../components/ui/DataTable";
import IconAction from "../../components/ui/IconAction";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import Surface from "../../components/ui/Surface";
import UserCell from "../../components/ui/UserCell";
import { useListParams } from "../../hooks/useListParams";
import { formatDate, rowNumber } from "../../lib/format";
import ProfileDrawer from "./ProfileDrawer";
import { useAccountActions } from "./useAccountActions";

const UsersPage = () => {
  const list = useListParams();
  const { data, isLoading, isFetching, error, refetch } = useGetUsersQuery(list.queryArgs);
  const [viewing, setViewing] = useState(null);
  const renderActions = useAccountActions("user");

  const columns = [
    {
      title: "#",
      width: 56,
      responsive: ["sm"],
      render: (_, __, i) => <span className="tabular-nums text-muted">{rowNumber(i, list.page, list.limit)}</span>,
    },
    {
      title: "User",
      render: (_, r) => <UserCell name={r.name} subtitle={r.email} image={r.profile_image} />,
    },
    { title: "Phone", dataIndex: "phone", responsive: ["lg"], render: (v) => v || <span className="text-muted">—</span> },
    {
      title: "Status",
      responsive: ["sm"],
      render: (_, r) =>
        r.user?.isBlocked ? <StatusBadge tone="danger">Blocked</StatusBadge> : <StatusBadge tone="success">Active</StatusBadge>,
    },
    { title: "Joined", dataIndex: "createdAt", responsive: ["md"], render: (v) => formatDate(v) },
    {
      title: "",
      key: "actions",
      align: "right",
      fixed: "right",
      render: (_, r) =>
        renderActions(r, <IconAction icon={Eye} label="View profile" onClick={() => setViewing(r)} />),
    },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle="Everyone who has signed up to listen on Preach Radio." />
      <Surface
        padded={false}
        title={data?.meta ? `${data.meta.total} users` : "Users"}
        extra={<SearchInput value={list.search} onChange={list.setSearch} placeholder="Search by name" />}
      >
        <DataTable
          columns={columns}
          data={data?.result}
          meta={data?.meta}
          loading={isLoading}
          fetching={isFetching && !isLoading}
          error={error}
          onRetry={refetch}
          page={list.page}
          limit={list.limit}
          onPageChange={list.onPageChange}
          empty={{
            icon: Users,
            title: list.search ? "No matching users" : "No users yet",
            description: list.search ? "Try a different name." : undefined,
          }}
        />
      </Surface>
      <ProfileDrawer person={viewing} onClose={() => setViewing(null)} />
    </>
  );
};

export default UsersPage;
