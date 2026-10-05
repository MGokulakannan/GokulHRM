import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { DownloadCloud, Plus, Search } from "lucide-react";
import AdminPageHeader from "./AdminPageHeader";
import StatusBadge from "../ui/StatusBadge";
import Modal from "../ui/Modal";
import EmptyState from "../ui/EmptyState";
import { SkeletonRows } from "../ui/Skeleton";
import Pagination from "../pagination/Pagination";
import Field from "../forms/Field";
import { useToast } from "../ui/useToast";
import { useConfirm } from "../ui/useConfirm";
import { getApiError } from "../../utils/apiError";
import type { CatalogApi, CatalogRow } from "../../services/catalogService";
import "./AdminPage.css";

export interface CatalogField {
  name: string;
  label: string;
  type?: "text" | "textarea" | "time" | "number" | "select";
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  min?: number;
  max?: number;
  defaultValue?: string;
  options?: Array<{ value: string; label: string }>;
  full?: boolean; // span both columns in the two-column form
}

export interface CatalogColumn<T> {
  header: string;
  render: (row: T) => ReactNode;
  wrap?: boolean; // allow long text to wrap instead of staying on one line
}

interface CatalogPageProps<T extends CatalogRow> {
  section: string;
  title: string;
  description: string;
  singular: string; // e.g. "skill"
  plural: string; // e.g. "skills"
  icon: ReactNode;
  api: CatalogApi<T>; // must be a stable (module-level) reference
  fields: CatalogField[];
  columns: Array<CatalogColumn<T>>;
  searchKeys: string[];
  starterDataLabel?: string; // when set, shows a "load starter data" action
  hideStatus?: boolean;
}

const PAGE_SIZE = 10;

const toFormValues = (fields: CatalogField[], row?: CatalogRow) => {
  const values: Record<string, string> = {};

  for (const field of fields) {
    const current = row ? (row as unknown as Record<string, unknown>)[field.name] : undefined;
    values[field.name] =
      current !== undefined && current !== null ? String(current) : field.defaultValue ?? "";
  }

  return values;
};

const CatalogPage = <T extends CatalogRow>({
  section,
  title,
  description,
  singular,
  plural,
  icon,
  api,
  fields,
  columns,
  searchKeys,
  starterDataLabel,
  hideStatus,
}: CatalogPageProps<T>) => {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const allFields: CatalogField[] = useMemo(
    () =>
      hideStatus
        ? fields
        : [
            ...fields,
            {
              name: "status",
              label: "Status",
              type: "select",
              defaultValue: "Active",
              options: [
                { value: "Active", label: "Active" },
                { value: "Inactive", label: "Inactive" },
              ],
            },
          ],
    [fields, hideStatus]
  );

  useEffect(() => {
    let cancelled = false;

    api
      .list()
      .then((data) => {
        if (cancelled) return;
        setRows(data);
        setLoadFailed(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setLoadFailed(true);
        showToast(getApiError(error, `Failed to load ${plural}`), "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [api, plural, showToast]);

  const reload = async () => {
    try {
      setRows(await api.list());
      setLoadFailed(false);
    } catch (error) {
      showToast(getApiError(error, `Failed to refresh ${plural}`), "error");
    }
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rows.filter((row) => {
      if (statusFilter !== "All" && row.status !== statusFilter) return false;
      if (!query) return true;

      return searchKeys.some((key) =>
        String((row as unknown as Record<string, unknown>)[key] ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [rows, search, statusFilter, searchKeys]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, lastPage);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const activeCount = rows.filter((row) => row.status === "Active").length;

  const openAdd = () => {
    setEditing(null);
    setForm(toFormValues(allFields));
    setShowModal(true);
  };

  const openEdit = (row: T) => {
    setEditing(row);
    setForm(toFormValues(allFields, row));
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) setShowModal(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const payload: Record<string, unknown> = {};
    for (const field of allFields) {
      const value = (form[field.name] ?? "").trim();
      payload[field.name] = field.type === "number" ? (value === "" ? undefined : Number(value)) : value;
    }

    setSaving(true);
    try {
      if (editing) {
        await api.update(editing._id, payload);
      } else {
        await api.create(payload);
      }

      showToast(`${singular} ${editing ? "updated" : "added"} successfully`, "success");
      setShowModal(false);
      await reload();
    } catch (error) {
      showToast(getApiError(error, `Failed to save ${singular}`), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: T) => {
    const label = String(
      (row as unknown as Record<string, unknown>)[fields[0].name] ?? singular
    );

    const confirmed = await confirm({
      title: `Delete ${singular}`,
      message: `Delete "${label}"? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await api.remove(row._id);
      showToast(`${singular} deleted`, "success");
      await reload();
    } catch (error) {
      showToast(getApiError(error, `Failed to delete ${singular}`), "error");
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const result = await api.seedDefaults();
      showToast(result.message, result.added > 0 ? "success" : "info");
      await reload();
    } catch (error) {
      showToast(getApiError(error, "Failed to load starter data"), "error");
    } finally {
      setSeeding(false);
    }
  };

  const starterButton = starterDataLabel && (
    <button
      className="btn btn-outline-primary d-flex align-items-center gap-1"
      onClick={handleSeed}
      disabled={seeding}
    >
      <DownloadCloud size={16} /> {seeding ? "Loading..." : starterDataLabel}
    </button>
  );

  const renderControl = (field: CatalogField) => {
    const value = form[field.name] ?? "";
    const onChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => setForm((current) => ({ ...current, [field.name]: event.target.value }));

    if (field.type === "textarea") {
      return (
        <textarea
          className="form-control"
          rows={3}
          value={value}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={onChange}
        />
      );
    }

    if (field.type === "select") {
      return (
        <select className="form-select" value={value} onChange={onChange}>
          {(field.options || []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        className="form-control"
        type={field.type === "time" || field.type === "number" ? field.type : "text"}
        required={field.required}
        value={value}
        maxLength={field.maxLength}
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        onChange={onChange}
      />
    );
  };

  return (
    <div className="gh-page">
      <AdminPageHeader
        section={section}
        title={title}
        description={description}
        actions={
          <>
            {starterButton}
            <button className="btn btn-primary d-flex align-items-center gap-1" onClick={openAdd}>
              <Plus size={16} /> Add {singular}
            </button>
          </>
        }
      />

      <div className="gh-card adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            type="text"
            aria-label={`Search ${plural}`}
            placeholder={`Search ${plural}...`}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        {!hideStatus && (
          <select
            className="form-select adm-filter"
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        )}

        <span className="adm-toolbar-count">
          {rows.length} total{!hideStatus && ` · ${activeCount} active`}
        </span>
      </div>

      <div className="gh-card adm-table-card">
        {loading ? (
          <div style={{ padding: 20 }}>
            <SkeletonRows rows={6} />
          </div>
        ) : loadFailed && rows.length === 0 ? (
          <EmptyState
            icon={icon}
            title={`Couldn't load ${plural}`}
            description="Check your connection and try again."
            action={
              <button className="btn btn-outline-primary" onClick={reload}>
                Retry
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={icon}
            title={rows.length === 0 ? `No ${plural} yet` : `No ${plural} found`}
            description={
              rows.length === 0
                ? `Add your first ${singular}${starterDataLabel ? " or load the suggested starter list" : ""}.`
                : "Try a different search term or filter."
            }
            action={
              rows.length === 0 ? (
                <div className="d-flex gap-2 justify-content-center">
                  {starterButton}
                  <button className="btn btn-primary" onClick={openAdd}>
                    Add {singular}
                  </button>
                </div>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="table-responsive">
              <table className="table gh-table align-middle mb-0">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <th key={column.header}>{column.header}</th>
                    ))}
                    {!hideStatus && <th>Status</th>}
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <tr key={row._id}>
                      {columns.map((column, index) => (
                        <td key={column.header} className={column.wrap ? "gh-wrap" : undefined}>
                          {index === 0 ? (
                            <div className="adm-cell-title">
                              <span className="adm-cell-icon">{icon}</span>
                              <strong>{column.render(row)}</strong>
                            </div>
                          ) : (
                            column.render(row)
                          )}
                        </td>
                      ))}
                      {!hideStatus && (
                        <td>
                          <StatusBadge status={row.status || "Active"} />
                        </td>
                      )}
                      <td>
                        <div className="adm-actions">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEdit(row)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(row)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filtered.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editing ? `Edit ${singular}` : `Add ${singular}`}
        footer={
          <>
            <button className="btn btn-outline-primary" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="catalog-form" type="submit" disabled={saving}>
              {saving ? "Saving..." : `Save ${singular}`}
            </button>
          </>
        }
      >
        <form id="catalog-form" onSubmit={handleSubmit} className="gh-form-grid">
          {allFields.map((field) => (
            <Field
              key={field.name}
              label={field.required ? `${field.label} *` : field.label}
              className={field.full || field.type === "textarea" ? "gh-form-grid-full" : ""}
            >
              {renderControl(field)}
            </Field>
          ))}
        </form>
      </Modal>
    </div>
  );
};

export default CatalogPage;
