import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Form, Input, Select } from "antd";
import { Layers, Pencil, Plus, Trash2 } from "lucide-react";
import {
  useCreateSubCategoryMutation,
  useDeleteSubCategoryMutation,
  useGetSubCategoriesQuery,
  useUpdateSubCategoryMutation,
} from "../../api/catalogApi";
import DataTable from "../../components/ui/DataTable";
import FormModal from "../../components/ui/FormModal";
import IconAction from "../../components/ui/IconAction";
import ImageUpload from "../../components/ui/ImageUpload";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { useCategoryOptions } from "../../hooks/useCategoryOptions";
import { useListParams } from "../../hooks/useListParams";
import { buildFormData } from "../../lib/formData";
import { formatDate, rowNumber } from "../../lib/format";
import { requiredImage, requiredText } from "../../lib/validation";

const SubcategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Server-side category filter (the old page filtered only the current page client-side).
  const list = useListParams({ filters: { category: searchParams.get("category") || undefined } });
  const { data, isLoading, isFetching, error, refetch } = useGetSubCategoriesQuery(list.queryArgs);
  const { options: categoryOptions, isLoading: categoriesLoading } = useCategoryOptions();
  const [createSub, createState] = useCreateSubCategoryMutation();
  const [updateSub, updateState] = useUpdateSubCategoryMutation();
  const [deleteSub, deleteState] = useDeleteSubCategoryMutation();
  const [editing, setEditing] = useState(null);
  const run = useAction();
  const isEdit = Boolean(editing?._id);

  const setCategoryFilter = (value) => {
    list.setFilter("category", value);
    setSearchParams(value ? { category: value } : {}, { replace: true });
  };

  const onSubmit = async ({ name, category, image }) => {
    const formData = buildFormData(
      { name: name.trim(), category },
      { sub_category_image: image instanceof File ? image : null }
    );
    const res = await run(isEdit ? updateSub({ id: editing._id, formData }) : createSub(formData), {
      success: isEdit ? "Subcategory updated" : "Subcategory created",
    });
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
      title: "Subcategory",
      render: (_, r) => (
        <div className="flex items-center gap-3">
          <img src={r.image} alt="" loading="lazy" className="h-11 w-11 rounded-lg bg-canvas object-cover" />
          <span className="font-medium text-ink">{r.name}</span>
        </div>
      ),
    },
    { title: "Category", render: (_, r) => r.category?.name || <span className="text-muted">—</span> },
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
            onClick={() => run(deleteSub(r._id), { success: "Subcategory deleted" })}
            confirm={{ title: `Delete “${r.name}”?`, description: "It will be hidden from the app.", okText: "Delete" }}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Subcategories"
        subtitle="Finer-grained topics inside each category."
        actions={
          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => setEditing({ category: list.filters.category })}
          >
            New subcategory
          </Button>
        }
      />
      <Surface
        padded={false}
        title={
          <Select
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="All categories"
            loading={categoriesLoading}
            className="w-full min-w-[200px] sm:w-60"
            value={list.filters.category}
            onChange={setCategoryFilter}
            options={categoryOptions}
          />
        }
        extra={<SearchInput value={list.search} onChange={list.setSearch} placeholder="Search subcategories" />}
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
          empty={{ icon: Layers, title: "No subcategories found" }}
        />
      </Surface>

      <FormModal
        open={Boolean(editing)}
        title={isEdit ? "Edit subcategory" : "New subcategory"}
        onCancel={() => setEditing(null)}
        onSubmit={onSubmit}
        submitting={createState.isLoading || updateState.isLoading}
        submitText={isEdit ? "Save changes" : "Create subcategory"}
        initialValues={
          editing
            ? { name: editing.name, category: editing.category?._id ?? editing.category, image: editing.image }
            : undefined
        }
      >
        <Form.Item name="category" label="Parent category" rules={[{ required: true, message: "Choose a category" }]}>
          <Select showSearch optionFilterProp="label" placeholder="Choose a category" options={categoryOptions} />
        </Form.Item>
        <Form.Item name="name" label="Name" rules={requiredText("Name", { max: 60 })}>
          <Input placeholder="e.g. Sunday Service" />
        </Form.Item>
        <Form.Item name="image" label="Image" rules={[requiredImage("An image")]}>
          <ImageUpload aspect="aspect-[16/9]" />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default SubcategoriesPage;
