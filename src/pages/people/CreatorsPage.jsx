import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Popconfirm, Segmented } from "antd";
import { Check, Eye, UserCog, X } from "lucide-react";
import { useGetCreatorsQuery, useSetCreatorApprovalMutation } from "../../api/peopleApi";
import DataTable from "../../components/ui/DataTable";
import IconAction from "../../components/ui/IconAction";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusBadge from "../../components/ui/StatusBadge";
import Surface from "../../components/ui/Surface";
import UserCell from "../../components/ui/UserCell";
import { useAction } from "../../hooks/useAction";
import { useListParams } from "../../hooks/useListParams";
import { formatDate, rowNumber } from "../../lib/format";
import ProfileDrawer from "./ProfileDrawer";
import { useAccountActions } from "./useAccountActions";

const STATUS_FILTER = { all: undefined, approved: true, pending: false };

const CreatorsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = STATUS_FILTER[searchParams.get("status")] !== undefined ? searchParams.get("status") : "all";
  const list = useListParams({ filters: { isApproved: STATUS_FILTER[initialStatus] } });
  const [status, setStatus] = useState(initialStatus);
  const { data, isLoading, isFetching, error, refetch } = useGetCreatorsQuery(list.queryArgs);
  const [setApproval, approvalState] = useSetCreatorApprovalMutation();
  const [viewing, setViewing] = useState(null);
  const renderAccountActions = useAccountActions("creator");
  const run = useAction();

  const changeStatus = (value) => {
    setStatus(value);
    list.setFilter("isApproved", STATUS_FILTER[value]);
    setSearchParams(value === "all" ? {} : { status: value }, { replace: true });
  };

  const decide = (row, isApproved) =>
    run(setApproval({ id: row._id, isApproved }), {
      success: isApproved ? `${row.name} is now an approved creator` : `${row.name}'s request was rejected`,
    });

  const busy = (row) => approvalState.isLoading && approvalState.originalArgs?.id === row._id;

  const columns = [
    {
      title: "#",
      width: 56,
      responsive: ["sm"],
      render: (_, __, i) => <span className="tabular-nums text-muted">{rowNumber(i, list.page, list.limit)}</span>,
    },
    { title: "Creator", render: (_, r) => <UserCell name={r.name} subtitle={r.email} image={r.profile_image} /> },
    { title: "Phone", dataIndex: "phone", responsive: ["xl"], render: (v) => v || <span className="text-muted">—</span> },
    {
      title: "Status",
      responsive: ["sm"],
      render: (_, r) => (
        <div className="flex flex-wrap gap-1.5">
          {r.isApproved ? <StatusBadge tone="success">Approved</StatusBadge> : <StatusBadge tone="warning">Pending</StatusBadge>}
          {r.user?.isBlocked && <StatusBadge tone="danger">Blocked</StatusBadge>}
        </div>
      ),
    },
    { title: "Requested", dataIndex: "createdAt", responsive: ["lg"], render: (v) => formatDate(v) },
    {
      title: "",
      key: "actions",
      align: "right",
      fixed: "right",
      render: (_, r) => (
        <div className="flex items-center justify-end gap-2">
          {!r.isApproved && (
            <>
              <Popconfirm
                title={`Reject ${r.name}?`}
                description="Rejecting permanently deletes this creator account."
                okText="Reject"
                okButtonProps={{ danger: true }}
                onConfirm={() => decide(r, false)}
              >
                <Button size="small" icon={<X size={14} />} disabled={busy(r)}>
                  Reject
                </Button>
              </Popconfirm>
              <Button size="small" type="primary" icon={<Check size={14} />} loading={busy(r)} onClick={() => decide(r, true)}>
                Approve
              </Button>
            </>
          )}
          {renderAccountActions(r, <IconAction icon={Eye} label="View profile" onClick={() => setViewing(r)} />)}
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Creators" subtitle="Review creator applications and manage creator accounts." />
      <Surface
        padded={false}
        title={
          <Segmented
            value={status}
            onChange={changeStatus}
            options={[
              { value: "all", label: "All" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
            ]}
          />
        }
        extra={<SearchInput value={list.search} onChange={list.setSearch} placeholder="Search name or email" />}
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
            icon: UserCog,
            title: status === "pending" ? "No pending requests" : "No creators found",
            description: list.search ? "Try a different search." : undefined,
          }}
        />
      </Surface>
      <ProfileDrawer
        person={viewing}
        onClose={() => setViewing(null)}
        extraItems={
          viewing
            ? [
                {
                  key: "donation",
                  label: "Donation link",
                  children: viewing.donationLink ? (
                    <a href={viewing.donationLink} target="_blank" rel="noopener noreferrer" className="text-brand">
                      Open link
                    </a>
                  ) : (
                    "—"
                  ),
                },
              ]
            : []
        }
      />
    </>
  );
};

export default CreatorsPage;
