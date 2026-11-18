import { Ban, LockOpen, Trash2 } from "lucide-react";
import { useDeleteAccountMutation, useToggleBlockMutation } from "../../api/peopleApi";
import IconAction from "../../components/ui/IconAction";
import { useAction } from "../../hooks/useAction";

/**
 * Block/unblock + delete actions shared by Users and Creators.
 * Both endpoints take the linked auth `User` id (`row.user._id`), not the profile id.
 */
export const useAccountActions = (noun = "user") => {
  const [toggleBlock, blockState] = useToggleBlockMutation();
  const [deleteAccount, deleteState] = useDeleteAccountMutation();
  const run = useAction();

  const renderActions = (row, extra = null) => {
    const userId = row.user?._id;
    const blocked = Boolean(row.user?.isBlocked);
    const busyBlock = blockState.isLoading && blockState.originalArgs === userId;
    const busyDelete = deleteState.isLoading && deleteState.originalArgs === userId;

    return (
      <div className="flex items-center justify-end gap-1">
        {extra}
        <IconAction
          icon={blocked ? LockOpen : Ban}
          label={blocked ? "Unblock" : "Block"}
          tone={blocked ? "success" : "danger"}
          loading={busyBlock}
          disabled={!userId}
          onClick={() => run(toggleBlock(userId))}
          confirm={{
            title: blocked ? `Unblock ${row.name}?` : `Block ${row.name}?`,
            description: blocked
              ? `They will be able to sign in again.`
              : `They will be signed out and unable to use the app.`,
            okText: blocked ? "Unblock" : "Block",
          }}
        />
        <IconAction
          icon={Trash2}
          label="Delete"
          tone="danger"
          loading={busyDelete}
          disabled={!userId}
          onClick={() => run(deleteAccount(userId), { success: `${row.name} was deleted` })}
          confirm={{
            title: `Delete this ${noun}?`,
            description: "This permanently removes the account and can't be undone.",
            okText: "Delete",
          }}
        />
      </div>
    );
  };

  return renderActions;
};
