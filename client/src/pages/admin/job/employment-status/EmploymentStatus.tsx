import { useEffect, useState } from "react";
import { useToast } from "../../../../components/ui/useToast";
import { useConfirm } from "../../../../components/ui/useConfirm";
import "./EmploymentStatus.css";

import {
  getEmploymentStatuses,
  createEmploymentStatus,
  updateEmploymentStatus,
  deleteEmploymentStatus,
} from "../../../../services/employmentStatusService";
import type { EmploymentStatus as EmploymentStatusType } from "../../../../services/employmentStatusService";

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;

    return (
      apiError.response?.data?.message ||
      "Something went wrong"
    );
  }

  return "Something went wrong";
};

const EmploymentStatus = () => {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [employmentStatuses, setEmploymentStatuses] =
    useState<EmploymentStatusType[]>([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(
    null
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] = useState<
    "Active" | "Inactive"
  >("Active");

  const [loading, setLoading] = useState(true);

  /*
   * Load employment statuses
   */
  useEffect(() => {
    let cancelled = false;

    const loadStatuses = async () => {
      try {
        setLoading(true);

        const data = await getEmploymentStatuses();

        if (!cancelled) {
          setEmploymentStatuses(data);
        }
      } catch (error: unknown) {
        console.error(
          "Failed to load employment statuses:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadStatuses();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Reload employment statuses
   */
  const loadEmploymentStatuses = async () => {
    try {
      setLoading(true);

      const data = await getEmploymentStatuses();

      setEmploymentStatuses(data);
    } catch (error: unknown) {
      console.error(
        "Failed to load employment statuses:",
        error
      );

      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  /*
   * Reset form
   */
  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("Active");
    setEditingId(null);
    setShowForm(false);
  };

  /*
   * Add employment status
   */
  const handleAdd = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setStatus("Active");
    setShowForm(true);
  };

  /*
   * Edit employment status
   */
  const handleEdit = (
    employmentStatus: EmploymentStatusType
  ) => {
    setEditingId(employmentStatus._id);

    setName(employmentStatus.name);

    setDescription(
      employmentStatus.description || ""
    );

    setStatus(employmentStatus.status);

    setShowForm(true);
  };

  /*
   * Save / Update employment status
   */
  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName) {
      showToast("Employment status name is required", "error");
      return;
    }

    try {
      if (editingId) {
        await updateEmploymentStatus(editingId, {
          name: trimmedName,
          description: trimmedDescription,
          status,
        });
      } else {
        await createEmploymentStatus({
          name: trimmedName,
          description: trimmedDescription,
          status,
        });
      }

      await loadEmploymentStatuses();

      resetForm();
    } catch (error: unknown) {
      console.error(
        "Failed to save employment status:",
        error
      );

      showToast(getErrorMessage(error), "error");
    }
  };

  /*
   * Delete employment status
   */
  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      "Are you sure you want to delete this employment status?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteEmploymentStatus(id);

      await loadEmploymentStatuses();
    } catch (error: unknown) {
      console.error(
        "Failed to delete employment status:",
        error
      );

      showToast(getErrorMessage(error), "error");
    }
  };

  /*
   * Search employment statuses
   */
  const searchText = search.trim().toLowerCase();

  const filteredStatuses =
    employmentStatuses.filter(
      (employmentStatus) => {
        const nameMatch =
          employmentStatus.name
            .toLowerCase()
            .includes(searchText);

        const descriptionMatch =
          employmentStatus.description
            ?.toLowerCase()
            .includes(searchText);

        return (
          nameMatch ||
          Boolean(descriptionMatch)
        );
      }
    );

  return (
    <div className="employment-status-page">
      {/* PAGE HEADER */}
      <div className="employment-status-header">
        <div>
          <h1>Employment Status</h1>

          <p>
            Manage employee employment statuses
          </p>
        </div>

        <button
          type="button"
          className="add-employment-status-btn"
          onClick={handleAdd}
        >
          + Add Employment Status
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="employment-status-card">
        {/* SEARCH */}
        <div className="employment-status-toolbar">
          <input
            type="text"
            placeholder="Search employment statuses..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </div>

        {/* FORM */}
        {showForm && (
          <div className="employment-status-form">
            <div className="form-header">
              <h2>
                {editingId
                  ? "Edit Employment Status"
                  : "Add Employment Status"}
              </h2>
            </div>

            <div className="form-grid">
              {/* NAME */}
              <div className="form-group">
                <label htmlFor="employment-status-name">
                  Name <span>*</span>
                </label>

                <input
                  id="employment-status-name"
                  type="text"
                  placeholder="Enter employment status"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                />
              </div>

              {/* DESCRIPTION */}
              <div className="form-group">
                <label htmlFor="employment-status-description">
                  Description
                </label>

                <input
                  id="employment-status-description"
                  type="text"
                  placeholder="Enter description"
                  value={description}
                  onChange={(event) =>
                    setDescription(
                      event.target.value
                    )
                  }
                />
              </div>

              {/* STATUS */}
              <div className="form-group">
                <label htmlFor="employment-status-status">
                  Status
                </label>

                <select
                  id="employment-status-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as
                        | "Active"
                        | "Inactive"
                    )
                  }
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            {/* FORM ACTIONS */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="button"
                className="save-btn"
                onClick={handleSave}
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="employment-status-table-wrapper">
          <table className="employment-status-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {/* LOADING */}
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="empty-state"
                  >
                    Loading employment statuses...
                  </td>
                </tr>
              ) : filteredStatuses.length === 0 ? (
                /* EMPTY */
                <tr>
                  <td
                    colSpan={4}
                    className="empty-state"
                  >
                    No employment statuses found
                  </td>
                </tr>
              ) : (
                /* DATA */
                filteredStatuses.map(
                  (employmentStatus) => (
                    <tr
                      key={
                        employmentStatus._id
                      }
                    >
                      <td className="name-cell">
                        {employmentStatus.name}
                      </td>

                      <td>
                        {employmentStatus.description ||
                          "-"}
                      </td>

                      <td>
                        <span
                          className={`status-badge ${
                            employmentStatus.status ===
                            "Active"
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {
                            employmentStatus.status
                          }
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              handleEdit(
                                employmentStatus
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                employmentStatus._id
                              )
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmploymentStatus;