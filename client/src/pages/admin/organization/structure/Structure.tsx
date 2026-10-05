import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { ChevronDown, ChevronRight, Network, Plus, Search } from "lucide-react";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import Field from "../../../../components/forms/Field";
import EmptyState from "../../../../components/ui/EmptyState";
import Modal from "../../../../components/ui/Modal";
import StatusBadge from "../../../../components/ui/StatusBadge";
import { SkeletonRows } from "../../../../components/ui/Skeleton";
import { useConfirm } from "../../../../components/ui/useConfirm";
import { useToast } from "../../../../components/ui/useToast";
import { getApiError } from "../../../../utils/apiError";
import { orgUnitApi } from "../../../../services/catalogService";
import type { OrgUnit, OrgUnitType } from "../../../../services/catalogService";
import "../../../../components/admin/AdminPage.css";
import "./Structure.css";

const UNIT_TYPES: OrgUnitType[] = ["Company", "Division", "Department", "Team", "Branch"];

interface UnitForm {
  name: string;
  unitType: OrgUnitType;
  parent: string;
  description: string;
  status: "Active" | "Inactive";
}

const blankForm = (parent = ""): UnitForm => ({
  name: "",
  unitType: parent ? "Department" : "Company",
  parent,
  description: "",
  status: "Active",
});

interface FlatNode {
  unit: OrgUnit;
  depth: number;
  childCount: number;
}

const Structure = () => {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [units, setUnits] = useState<OrgUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<OrgUnit | null>(null);
  const [form, setForm] = useState<UnitForm>(blankForm());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    orgUnitApi
      .list()
      .then((data) => {
        if (!cancelled) setUnits(data);
      })
      .catch((error) => {
        if (!cancelled) showToast(getApiError(error, "Failed to load organization structure"), "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const reload = async () => {
    try {
      setUnits(await orgUnitApi.list());
    } catch (error) {
      showToast(getApiError(error, "Failed to refresh organization structure"), "error");
    }
  };

  // children grouped by parent id ("" = top level). A unit whose parent no longer exists is treated as top level.
  const childrenByParent = useMemo(() => {
    const ids = new Set(units.map((unit) => unit._id));
    const map = new Map<string, OrgUnit[]>();

    for (const unit of units) {
      const key = unit.parent && ids.has(unit.parent) ? unit.parent : "";
      map.set(key, [...(map.get(key) || []), unit]);
    }

    for (const list of map.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return map;
  }, [units]);

  const query = search.trim().toLowerCase();

  const rows = useMemo(() => {
    const matches = (unit: OrgUnit) =>
      `${unit.name} ${unit.unitType} ${unit.description || ""}`.toLowerCase().includes(query);

    // A unit is kept if it matches or any descendant does, so matches keep their ancestors.
    const keeps = (unit: OrgUnit): boolean =>
      !query || matches(unit) || (childrenByParent.get(unit._id) || []).some(keeps);

    const result: FlatNode[] = [];

    const walk = (parentId: string, depth: number) => {
      for (const unit of childrenByParent.get(parentId) || []) {
        if (!keeps(unit)) continue;

        const children = childrenByParent.get(unit._id) || [];
        result.push({ unit, depth, childCount: children.length });

        if (query || !collapsed.has(unit._id)) walk(unit._id, depth + 1);
      }
    };

    walk("", 0);
    return result;
  }, [childrenByParent, collapsed, query]);

  const nameById = useMemo(() => new Map(units.map((unit) => [unit._id, unit.name])), [units]);

  // Everything below `id`, used to stop a unit from being moved under itself.
  const descendantsOf = (id: string) => {
    const found = new Set<string>();
    const stack = [id];

    while (stack.length) {
      for (const child of childrenByParent.get(stack.pop()!) || []) {
        if (!found.has(child._id)) {
          found.add(child._id);
          stack.push(child._id);
        }
      }
    }

    return found;
  };

  const parentOptions = useMemo(() => {
    const blocked = editing ? descendantsOf(editing._id) : new Set<string>();
    if (editing) blocked.add(editing._id);

    const options: Array<{ id: string; label: string }> = [];
    const walk = (parentId: string, depth: number) => {
      for (const unit of childrenByParent.get(parentId) || []) {
        if (blocked.has(unit._id)) continue;
        options.push({ id: unit._id, label: `${"  ".repeat(depth)}${unit.name}` });
        walk(unit._id, depth + 1);
      }
    };
    walk("", 0);

    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childrenByParent, editing]);

  const toggle = (id: string) =>
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const openAdd = (parent = "") => {
    setEditing(null);
    setForm(blankForm(parent));
    setShowModal(true);
  };

  const openEdit = (unit: OrgUnit) => {
    setEditing(unit);
    setForm({
      name: unit.name,
      unitType: unit.unitType,
      parent: unit.parent || "",
      description: unit.description || "",
      status: unit.status || "Active",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    if (!saving) setShowModal(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      unitType: form.unitType,
      parent: form.parent || null,
      description: form.description.trim(),
      status: form.status,
    };

    try {
      if (editing) await orgUnitApi.update(editing._id, payload);
      else await orgUnitApi.create(payload);

      showToast(`Unit ${editing ? "updated" : "added"} successfully`, "success");
      if (payload.parent) {
        setCollapsed((current) => {
          const next = new Set(current);
          next.delete(payload.parent as string);
          return next;
        });
      }
      setShowModal(false);
      await reload();
    } catch (error) {
      showToast(getApiError(error, "Failed to save unit"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (unit: OrgUnit) => {
    const confirmed = await confirm({
      title: "Delete unit",
      message: `Delete "${unit.name}"? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await orgUnitApi.remove(unit._id);
      showToast("Unit deleted", "success");
      await reload();
    } catch (error) {
      showToast(getApiError(error, "Failed to delete unit"), "error");
    }
  };

  return (
    <div className="gh-page">
      <AdminPageHeader
        section="Organization"
        title="Structure"
        description="Build your company hierarchy from divisions down to teams"
        actions={
          <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => openAdd()}>
            <Plus size={16} /> Add Unit
          </button>
        }
      />

      <div className="gh-card adm-toolbar">
        <div className="adm-search">
          <Search size={15} />
          <input
            type="text"
            aria-label="Search units"
            placeholder="Search units..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => setCollapsed(new Set())}
          disabled={collapsed.size === 0}
        >
          Expand all
        </button>
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() =>
            setCollapsed(new Set(units.filter((unit) => childrenByParent.has(unit._id)).map((unit) => unit._id)))
          }
        >
          Collapse all
        </button>
        <span className="adm-toolbar-count">
          {units.length} {units.length === 1 ? "unit" : "units"}
        </span>
      </div>

      <div className="gh-card adm-table-card">
        {loading ? (
          <div style={{ padding: 20 }}>
            <SkeletonRows rows={6} />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Network size={20} />}
            title={units.length === 0 ? "No structure defined yet" : "No units found"}
            description={
              units.length === 0
                ? "Start with your company at the top, then add divisions, departments and teams beneath it."
                : "Try a different search term."
            }
            action={
              units.length === 0 ? (
                <button className="btn btn-primary" onClick={() => openAdd()}>
                  Add the first unit
                </button>
              ) : undefined
            }
          />
        ) : (
          <div className="table-responsive">
            <table className="table gh-table align-middle mb-0">
              <thead>
                <tr>
                  <th>Unit</th>
                  <th>Type</th>
                  <th>Sub-units</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ unit, depth, childCount }) => (
                  <tr key={unit._id}>
                    <td>
                      <div className="struct-node" style={{ paddingLeft: depth * 24 }}>
                        {childCount > 0 ? (
                          <button
                            type="button"
                            className="struct-toggle"
                            onClick={() => toggle(unit._id)}
                            aria-label={`${collapsed.has(unit._id) ? "Expand" : "Collapse"} ${unit.name}`}
                            aria-expanded={!collapsed.has(unit._id)}
                          >
                            {collapsed.has(unit._id) && !query ? (
                              <ChevronRight size={15} />
                            ) : (
                              <ChevronDown size={15} />
                            )}
                          </button>
                        ) : (
                          <span className="struct-toggle-spacer" />
                        )}
                        <span className="adm-cell-icon">
                          <Network size={15} />
                        </span>
                        <div>
                          <strong>{unit.name}</strong>
                          {unit.description && <div className="struct-desc">{unit.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td>{unit.unitType}</td>
                    <td>{childCount}</td>
                    <td>
                      <StatusBadge status={unit.status || "Active"} />
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openAdd(unit._id)}>
                          Add sub-unit
                        </button>
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(unit)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(unit)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editing ? "Edit Unit" : "Add Unit"}
        subtitle={
          !editing && form.parent ? `Under ${nameById.get(form.parent) ?? "selected unit"}` : undefined
        }
        footer={
          <>
            <button className="btn btn-outline-primary" onClick={closeModal} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" form="structure-form" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Unit"}
            </button>
          </>
        }
      >
        <form id="structure-form" onSubmit={handleSubmit} className="gh-form-grid">
          <Field label="Unit name *" className="gh-form-grid-full">
            <input
              className="form-control"
              required
              maxLength={120}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </Field>
          <Field label="Type">
            <select
              className="form-select"
              value={form.unitType}
              onChange={(event) => setForm({ ...form, unitType: event.target.value as OrgUnitType })}
            >
              {UNIT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Reports to">
            <select
              className="form-select"
              value={form.parent}
              onChange={(event) => setForm({ ...form, parent: event.target.value })}
            >
              <option value="">None (top level)</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status">
            <select
              className="form-select"
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value as "Active" | "Inactive" })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </Field>
          <Field label="Description" className="gh-form-grid-full">
            <textarea
              className="form-control"
              rows={3}
              maxLength={500}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </Field>
        </form>
      </Modal>
    </div>
  );
};

export default Structure;
