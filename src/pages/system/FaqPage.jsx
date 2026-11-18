import { useState } from "react";
import { Button, Collapse, Form, Input, Skeleton } from "antd";
import { HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { useCreateFaqMutation, useDeleteFaqMutation, useGetFaqsQuery, useUpdateFaqMutation } from "../../api/adminApi";
import FormModal from "../../components/ui/FormModal";
import IconAction from "../../components/ui/IconAction";
import PageHeader from "../../components/ui/PageHeader";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { requiredText } from "../../lib/validation";

const FaqPage = () => {
  const { data: faqs = [], isLoading, error, refetch } = useGetFaqsQuery();
  const [createFaq, createState] = useCreateFaqMutation();
  const [updateFaq, updateState] = useUpdateFaqMutation();
  const [deleteFaq, deleteState] = useDeleteFaqMutation();
  const [editing, setEditing] = useState(null);
  const run = useAction();
  const isEdit = Boolean(editing?._id);

  const onSubmit = async ({ question, answer }) => {
    const body = { question: question.trim(), answer: answer.trim() };
    const res = await run(isEdit ? updateFaq({ id: editing._id, ...body }) : createFaq(body), {
      success: isEdit ? "FAQ updated" : "FAQ added",
    });
    if (res) setEditing(null);
  };

  return (
    <>
      <PageHeader
        title="FAQ"
        subtitle="Answers to common questions, shown in the app's help section."
        actions={
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setEditing({})}>
            Add question
          </Button>
        }
      />
      <Surface padded={!faqs.length || isLoading || Boolean(error)}>
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : faqs.length === 0 ? (
          <EmptyState
            icon={HelpCircle}
            title="No questions yet"
            action={
              <Button type="primary" icon={<Plus size={16} />} onClick={() => setEditing({})}>
                Add the first question
              </Button>
            }
          />
        ) : (
          <Collapse
            ghost
            expandIconPosition="end"
            items={faqs.map((faq) => ({
              key: faq._id,
              label: <span className="font-medium text-ink">{faq.question}</span>,
              children: <p className="whitespace-pre-line pr-24 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>,
              extra: (
                // stop clicks on actions from toggling the panel
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()} role="presentation">
                  <IconAction icon={Pencil} label="Edit" tone="brand" onClick={() => setEditing(faq)} />
                  <IconAction
                    icon={Trash2}
                    label="Delete"
                    tone="danger"
                    loading={deleteState.isLoading && deleteState.originalArgs === faq._id}
                    onClick={() => run(deleteFaq(faq._id), { success: "FAQ deleted" })}
                    confirm={{ title: "Delete this question?", okText: "Delete" }}
                  />
                </div>
              ),
            }))}
            className="[&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-line-soft [&_.ant-collapse-item:last-child]:border-0"
          />
        )}
      </Surface>

      <FormModal
        open={Boolean(editing)}
        title={isEdit ? "Edit question" : "New question"}
        onCancel={() => setEditing(null)}
        onSubmit={onSubmit}
        submitting={createState.isLoading || updateState.isLoading}
        submitText={isEdit ? "Save changes" : "Add question"}
        initialValues={isEdit ? { question: editing.question, answer: editing.answer } : undefined}
      >
        <Form.Item name="question" label="Question" rules={requiredText("Question", { max: 200 })}>
          <Input placeholder="e.g. How do I become a creator?" />
        </Form.Item>
        <Form.Item name="answer" label="Answer" rules={requiredText("Answer", { max: 2000 })}>
          <Input.TextArea rows={6} showCount maxLength={2000} />
        </Form.Item>
      </FormModal>
    </>
  );
};

export default FaqPage;
