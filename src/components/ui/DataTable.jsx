import PropTypes from "prop-types";
import { Table } from "antd";
import { EmptyState, ErrorState } from "./States";

/**
 * Server-paginated table with built-in loading / error / empty handling.
 * `meta` is the backend pagination object: { page, limit, total, totalPage }.
 */
const DataTable = ({
  columns,
  data,
  meta,
  loading,
  fetching,
  error,
  onRetry,
  page,
  limit,
  onPageChange,
  empty,
  rowKey = "_id",
}) => {
  if (error && !data?.length) return <ErrorState error={error} onRetry={onRetry} />;

  return (
    <Table
      rowKey={rowKey}
      columns={columns}
      dataSource={data || []}
      loading={loading || fetching}
      scroll={{ x: "max-content" }}
      locale={{ emptyText: loading ? " " : <EmptyState {...empty} /> }}
      pagination={
        meta?.total > 0 && {
          current: page,
          pageSize: limit,
          total: meta.total,
          onChange: onPageChange,
          showSizeChanger: true,
          responsive: true,
          showLessItems: true,
          pageSizeOptions: [10, 20, 50],
          showTotal: (total, [from, to]) => `${from}–${to} of ${total}`,
          className: "!px-5",
        }
      }
    />
  );
};

DataTable.propTypes = {
  columns: PropTypes.array.isRequired,
  data: PropTypes.array,
  meta: PropTypes.object,
  loading: PropTypes.bool,
  fetching: PropTypes.bool,
  error: PropTypes.any,
  onRetry: PropTypes.func,
  page: PropTypes.number,
  limit: PropTypes.number,
  onPageChange: PropTypes.func,
  empty: PropTypes.object,
  rowKey: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
};

export default DataTable;
