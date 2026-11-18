import { useState } from "react";
import { Button, DatePicker, Form, Image, Input } from "antd";
import dayjs from "dayjs";
import { ExternalLink, Image as ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetBannersQuery,
  useUpdateBannerMutation,
} from "../../api/catalogApi";
import DataTable from "../../components/ui/DataTable";
import FormModal from "../../components/ui/FormModal";
import IconAction from "../../components/ui/IconAction";
import ImageUpload from "../../components/ui/ImageUpload";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { useListParams } from "../../hooks/useListParams";
import { buildFormData } from "../../lib/formData";
import { formatDate } from "../../lib/format";
import { requiredImage, urlRule } from "../../lib/validation";

const bannerStatus = ({ startDate, endDate }) => {
  const today = dayjs().startOf("day");
  if (endDate && dayjs(endDate).isBefore(today)) return <StatusBadge tone="neutral">Expired</StatusBadge>;
  if (startDate && dayjs(startDate).isAfter(today)) return <StatusBadge tone="warning">Scheduled</StatusBadge>;
  return <StatusBadge tone="success">Live</StatusBadge>;
};

const BannersPage = () => {
  const list = useListParams();
  const { data, isLoading, isFetching, error, refetch } = useGetBannersQuery(list.queryArgs);
  const [createBanner, createState] = useCreateBannerMutation();
  const [updateBanner, updateState] = useUpdateBannerMutation();
  const [deleteBanner, deleteState] = useDeleteBannerMutation();
  const [editing, setEditing] = useState(null);
  const run = useAction();
  const isEdit = Boolean(editing?._id);

  const onSubmit = async ({ redirect_url, range, banner }) => {
    const [start, end] = range;
    const formData = buildFormData(
      {
        redirect_url: redirect_url?.trim() || undefined,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
      },
      { banner: banner instanceof File ? banner : null }
    );
    const res = await run(isEdit ? updateBanner({ id: editing._id, formData }) : createBanner(formData), {
      success: isEdit ? "Banner updated" : "Banner created",
    });
    if (res) setEditing(null);
  };

  const columns = [
    {
      title: "Banner",
      render: (_, r) => (
        <Image src={r.banner_url} alt="" width={128} height={64} className="rounded-lg object-cover" preview={{ mask: "Preview" }} />
      ),
    },
    { title: "Status", render: (_, r) => bannerStatus(r) },
    {
      title: "Runs",
      render: (_, r) => (
        <span className="whitespace-nowrap tabular-nums text-ink-soft">
          {formatDate(r.startDate)} → {formatDate(r.endDate)}
        </span>
      ),
    },
    {
      title: "Links to",
      responsive: ["lg"],
      dataIndex: "redirect_url",
      render: (url) =>
        url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-[260px] items-center gap-1 text-brand">
            <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
            <ExternalLink size={13} className="shrink-0" />
          </a>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
    {
      title: "",
      key: "actions",
      align: "right",
      render: (_, r) => (
        <div className="flex justify-end gap-1">
          <IconAction icon={Pencil} label="Edit" tone="brand" onClick={() => setEditing(r)} />
          <IconAction
            icon={Trash2}
            label="Delete"
            tone="danger"
            loading={deleteState.isLoading && deleteState.originalArgs === r._id}
            onClick={() => run(deleteBanner(r._id), { success: "Banner deleted" })}
            confirm={{ title: "Delete this banner?", description: "It will stop showing in the app immediately.", okText: "Delete" }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Banners"
        subtitle="Promotional banners on the app home screen. Expired banners are removed automatically at midnight."
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setEditing({})}>
            New banner
          </Button>
        }
      />
      <Surface padded={false}>
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
          empty={{ icon: ImageIcon, title: "No banners", description: "Create a banner to promote content in the app." }}
        />
      </Surface>

      <FormModal
        open={Boolean(editing)}
        title={isEdit ? "Edit banner" : "New banner"}
        onCancel={() => setEditing(null)}
        onSubmit={onSubmit}
        submitting={createState.isLoading || updateState.isLoading}
        submitText={isEdit ? "Save changes" : "Create banner"}
        initialValues={
          isEdit
            ? {
                redirect_url: editing.redirect_url,
                range: [dayjs(editing.startDate), dayjs(editing.endDate)],
                banner: editing.banner_url,
              }
            : { range: [dayjs(), dayjs().add(7, "day")] }
        }
      >
        <Form.Item name="banner" label="Image" rules={[requiredImage("A banner image")]} extra="Recommended 1200 × 600 px">
          <ImageUpload aspect="aspect-[2/1]" />
        </Form.Item>
        <Form.Item
          name="range"
          label="Show between"
          rules={[
            { required: true, message: "Choose a start and end date" },
            {
              validator: (_, v) =>
                !v || !v[0] || !v[1] || !v[1].isBefore(v[0], "day")
                  ? Promise.resolve()
                  : Promise.reject(new Error("End date must be on or after the start date")),
            },
          ]}
        >
          <DatePicker.RangePicker className="w-full" format="DD MMM YYYY" allowClear={false} />
        </Form.Item>
        <Form.Item name="redirect_url" label="Link (optional)" rules={[urlRule]}>
          <Input placeholder="https://" inputMode="url" />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default BannersPage;
