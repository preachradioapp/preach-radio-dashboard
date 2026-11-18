import { useState } from "react";
import { Descriptions, Drawer, Select } from "antd";
import { Eye, ShieldCheck } from "lucide-react";
import { useGetReportsQuery } from "../../api/adminApi";
import DataTable from "../../components/ui/DataTable";
import IconAction from "../../components/ui/IconAction";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import Surface from "../../components/ui/Surface";
import UserCell from "../../components/ui/UserCell";
import { useListParams } from "../../hooks/useListParams";
import { formatDateTime, fromNow, rowNumber } from "../../lib/format";

const INCIDENT_TYPES = ["Unprofessional Behavior", "Failure to collaborate", "Spam", "Other"];
const MODEL_LABEL = { NormalUser: "User", Creator: "Creator" };

const ReportsPage = () => {
  const list = useListParams({ filters: { incidentType: undefined } });
  const { data, isLoading, isFetching, error, refetch } = useGetReportsQuery(list.queryArgs);
  const [viewing, setViewing] = useState(null);

  const columns = [
    {
      title: "#",
      width: 56,
      responsive: ["sm"],
      render: (_, __, i) => <span className="tabular-nums text-muted">{rowNumber(i, list.page, list.limit)}</span>,
    },
    {
      title: "Reported",
      render: (_, r) => (
        <UserCell name={r.reportTo?.name} image={r.reportTo?.profile_image} subtitle={MODEL_LABEL[r.reportToModel]} />
      ),
    },
    {
      title: "Reported by",
      responsive: ["md"],
      render: (_, r) => (
        <UserCell name={r.reportFrom?.name} image={r.reportFrom?.profile_image} subtitle={MODEL_LABEL[r.reportFromModel]} size={32} />
      ),
    },
    {
      title: "Reason",
      dataIndex: "incidentType",
      render: (v) => <StatusBadge tone={v === "Spam" ? "warning" : "neutral"}>{v}</StatusBadge>,
    },
    { title: "Received", dataIndex: "createdAt", responsive: ["sm"], render: (v) => <span title={formatDateTime(v)}>{fromNow(v)}</span> },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, r) => <IconAction icon={Eye} label="View details" onClick={() => setViewing(r)} />,
    },
  ];

  return (
    <>
      <PageHeader title="Reports" subtitle="Reports submitted by listeners and creators about other accounts." />
      <Surface
        padded={false}
        title={data?.meta ? `${data.meta.total} reports` : "Reports"}
        extra={
          <Select
            allowClear
            placeholder="All reasons"
            className="w-full sm:w-56"
            value={list.filters.incidentType}
            onChange={(v) => list.setFilter("incidentType", v)}
            options={INCIDENT_TYPES.map((t) => ({ value: t, label: t }))}
          />
        }
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
          empty={{ icon: ShieldCheck, title: "No reports", description: "Nothing has been reported. Nice." }}
        />
      </Surface>

      <Drawer open={Boolean(viewing)} onClose={() => setViewing(null)} width={440} title="Report details" destroyOnClose>
        {viewing && (
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl bg-canvas p-4">
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Reported</div>
                <UserCell name={viewing.reportTo?.name} image={viewing.reportTo?.profile_image} subtitle={MODEL_LABEL[viewing.reportToModel]} />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Reported by</div>
                <UserCell name={viewing.reportFrom?.name} image={viewing.reportFrom?.profile_image} subtitle={MODEL_LABEL[viewing.reportFromModel]} />
              </div>
            </div>
            <Descriptions
              column={1}
              size="small"
              colon={false}
              labelStyle={{ width: 110, color: "#6B6B76" }}
              items={[
                { key: "type", label: "Reason", children: viewing.incidentType },
                { key: "date", label: "Received", children: formatDateTime(viewing.createdAt) },
              ]}
            />
            <div>
              <div className="mb-2 text-sm font-medium text-ink">Note from reporter</div>
              <p className="whitespace-pre-wrap rounded-xl border border-line p-4 text-sm leading-relaxed text-ink-soft">
                {viewing.additionalNote || "No additional note was provided."}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default ReportsPage;
