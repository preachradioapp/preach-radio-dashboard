import { useState } from "react";
import { Button, Form, Input } from "antd";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "../../api/catalogApi";
import DataTable from "../../components/ui/DataTable";
import FormModal from "../../components/ui/FormModal";
import IconAction from "../../components/ui/IconAction";
import ImageUpload from "../../components/ui/ImageUpload";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { useListParams } from "../../hooks/useListParams";
import { buildFormData } from "../../lib/formData";
import { formatDate, rowNumber } from "../../lib/format";
import { requiredImage, requiredText } from "../../lib/validation";

const CategoriesPage = () => {
  const list = useListParams();
  const { data, isLoading, isFetching, error, refetch } = useGetCategoriesQuery(list.queryArgs);
  const [createCategory, createState] = useCreateCategoryMutation();
  const [updateCategory, updateState] = useUpdateCategoryMutation();
  const [deleteCategory, deleteState] = useDeleteCategoryMutation();
  const [editing, setEditing] = useState(null); // null = closed, {} = create, record = edit
  const run = useAction();

  const isEdit = Boolean(editing?._id);

  const onSubmit = async ({ name, image }) => {
    const formData = buildFormData(
      { name: name.trim() },
      { category_image: image instanceof File ? image : null } // only send a new file
    );
    const res = await run(
      isEdit ? updateCategory({ id: editing._id, formData }) : createCategory(formData),
      { success: isEdit ? "Category updated" : "Category created" }
    );
    if (res) setEditing(null);
  };

  const columns = [
    {
      title: "#",
      width: 56,
      responsive: ["sm"],
      render: (_, __, i) => <span className="tabular-nums text-muted">{rowNumber(i, list.page, list.limit)}</span>,
    },
    {
      title: "Category",
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <img src={r.category_image} alt="" loading="lazy" className="h-11 w-11 rounded-lg bg-canvas object-cover" />
          <span className="font-medium text-ink">{r.name}</span>
        </div>
      ),
    },
    {
      title: "Subcategories",
      dataIndex: "totalSubcategory",
      render: (v, r) => (
        <Link to={`/subcategories?category=${r._id}`} className="tabular-nums text-brand hover:underline">
          {v ?? r.subcategories?.length ?? 0}
        </Link>
      ),
    },
    { title: "Created", dataIndex: "createdAt", responsive: ["md"], render: (v) => formatDate(v) },
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
            onClick={() => run(deleteCategory(r._id), { success: "Category deleted" })}
            confirm={{
              title: `Delete “${r.name}”?`,
              description: "It will be hidden from the app. Its podcasts are not deleted.",
              okText: "Delete",
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Top-level groups listeners browse by."
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setEditing({})}>
            New category
          </Button>
        }
      />
      <Surface
        padded={false}
        title={data?.meta ? `${data.meta.total} categories` : "Categories"}
        extra={<SearchInput value={list.search} onChange={list.setSearch} placeholder="Search categories" />}
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
            icon: FolderTree,
            title: list.search ? "No matching categories" : "No categories yet",
            action: !list.search && (
              <Button type="primary" icon={<Plus size={16} />} onClick={() => setEditing({})}>
                Create the first one
              </Button>
            ),
          }}
        />
      </Surface>

      <FormModal
        open={Boolean(editing)}
        title={isEdit ? "Edit category" : "New category"}
        onCancel={() => setEditing(null)}
        onSubmit={onSubmit}
        submitting={createState.isLoading || updateState.isLoading}
        submitText={isEdit ? "Save changes" : "Create category"}
        initialValues={isEdit ? { name: editing.name, image: editing.category_image } : undefined}
      >
        <Form.Item name="name" label="Name" rules={requiredText("Name", { max: 60 })}>
          <Input placeholder="e.g. Sermons" autoFocus />
        </Form.Item>
        <Form.Item name="image" label="Cover image" rules={[requiredImage("A cover image")]}>
          <ImageUpload aspect="aspect-[16/9]" />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default CategoriesPage;
