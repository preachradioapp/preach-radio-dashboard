import PropTypes from "prop-types";
import { Avatar, Descriptions, Drawer } from "antd";
import { formatDate, initials } from "../../lib/format";
import StatusBadge from "../../components/ui/StatusBadge";

/** Read-only profile details for a user or creator. */
const ProfileDrawer = ({ person, onClose, extraItems = [] }) => (
  <Drawer open={Boolean(person)} onClose={onClose} width={420} title="Profile" destroyOnClose>
    {person && (
      <>
        <div className="mb-6 flex flex-col items-center text-center">
          <Avatar src={person.profile_image || undefined} size={88} className="!bg-brand-50 !text-2xl !font-semibold !text-brand">
            {initials(person.name)}
          </Avatar>
          <h3 className="mt-3 text-lg font-semibold text-ink">{person.name || "Unnamed"}</h3>
          <p className="text-sm text-muted">{person.email}</p>
          <div className="mt-3">
            {person.user?.isBlocked ? (
              <StatusBadge tone="danger">Blocked</StatusBadge>
            ) : (
              <StatusBadge tone="success">Active</StatusBadge>
            )}
          </div>
        </div>
        <Descriptions
          column={1}
          size="small"
          colon={false}
          labelStyle={{ width: 130, color: "#6B6B76" }}
          items={[
            { key: "phone", label: "Phone", children: person.phone || "—" },
            { key: "gender", label: "Gender", children: person.gender || "—" },
            { key: "dob", label: "Date of birth", children: formatDate(person.dateOfBirth) },
            { key: "address", label: "Address", children: person.address || "—" },
            ...extraItems,
            { key: "joined", label: "Joined", children: formatDate(person.createdAt) },
          ]}
        />
      </>
    )}
  </Drawer>
);

ProfileDrawer.propTypes = {
  person: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  extraItems: PropTypes.array,
};

export default ProfileDrawer;
