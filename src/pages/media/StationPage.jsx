import { Button, Form, Input, Skeleton } from "antd";
import { Eye, Radio } from "lucide-react";
import { useGetStationQuery, useUpdateStationMutation } from "../../api/mediaApi";
import LocationField from "../../components/LocationField";
import { fromGeoPoint, locationRule, toGeoPoint } from "../../lib/geo";
import ImageUpload from "../../components/ui/ImageUpload";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorState } from "../../components/ui/States";
import StatusBadge from "../../components/ui/StatusBadge";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { buildFormData } from "../../lib/formData";
import { formatNumber } from "../../lib/format";
import { requiredText, urlRule } from "../../lib/validation";

const StationPage = () => {
  const { data: station, isLoading, error, refetch } = useGetStationQuery();
  const [updateStation, { isLoading: saving }] = useUpdateStationMutation();
  const run = useAction();

  const onFinish = async ({ name, description, donationUrl, location, cover, profile }) => {
    const formData = buildFormData(
      {
        name: name.trim(),
        description: description?.trim() ?? "",
        donationUrl: donationUrl?.trim() ?? "",
        address: location.address.trim(),
        location: toGeoPoint(location),
      },
      {
        cover_image: cover instanceof File ? cover : null,
        profile_image: profile instanceof File ? profile : null,
      }
    );
    await run(updateStation(formData), { success: "Station updated" });
  };

  if (error) {
    return (
      <>
        <PageHeader title="Station" />
        <Surface>
          <ErrorState error={error} onRetry={refetch} />
        </Surface>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Station"
        subtitle="The Preach Radio station profile that listeners see in the app."
        actions={
          station && (
            <div className="flex items-center gap-3">
              {station.isLive ? <StatusBadge tone="danger">On air</StatusBadge> : <StatusBadge tone="neutral">Off air</StatusBadge>}
              <span className="inline-flex items-center gap-1 text-sm tabular-nums text-muted">
                <Eye size={15} /> {formatNumber(station.totalViews)} plays
              </span>
            </div>
          )
        }
      />
      {isLoading || !station ? (
        <Surface>
          <Skeleton active paragraph={{ rows: 10 }} />
        </Surface>
      ) : (
        <Form
          key={station.updatedAt}
          layout="vertical"
          requiredMark="optional"
          onFinish={onFinish}
          disabled={saving}
          initialValues={{
            name: station.name,
            description: station.description,
            donationUrl: station.donationUrl,
            location: fromGeoPoint(station.address, station.location),
            cover: station.cover_image,
            profile: station.profile_image,
          }}
        >
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <Surface title="Branding">
                <Form.Item name="cover" label="Cover image" extra="Shown at the top of the station page. 1600 × 600 recommended.">
                  <ImageUpload aspect="aspect-[8/3]" />
                </Form.Item>
                {/* ImageUpload must be Form.Item's direct child, or it never receives value/onChange */}
                <div className="w-36">
                  <Form.Item name="profile" label="Logo" className="!mb-0">
                    <ImageUpload aspect="aspect-square" hint="Square" />
                  </Form.Item>
                </div>
              </Surface>
              <Surface title="Details">
                <Form.Item name="name" label="Station name" rules={requiredText("Station name", { max: 80 })}>
                  <Input />
                </Form.Item>
                <Form.Item name="description" label="About" rules={[{ max: 1500, message: "Keep it under 1500 characters" }]}>
                  <Input.TextArea rows={5} showCount maxLength={1500} />
                </Form.Item>
                <Form.Item name="donationUrl" label="Donation link" rules={[urlRule]} className="!mb-0">
                  <Input placeholder="https://" inputMode="url" />
                </Form.Item>
              </Surface>
            </div>
            <div className="space-y-6">
              <Surface title="Location">
                <Form.Item name="location" rules={[locationRule]} className="!mb-0">
                  <LocationField />
                </Form.Item>
              </Surface>
              <Surface>
                <div className="mb-4 flex items-start gap-3 text-sm text-muted">
                  <Radio size={18} className="mt-0.5 shrink-0 text-brand" />
                  Changes appear in the app as soon as you save.
                </div>
                <Button type="primary" htmlType="submit" block loading={saving} disabled={false}>
                  Save station
                </Button>
              </Surface>
            </div>
          </div>
        </Form>
      )}
    </>
  );
};

export default StationPage;
