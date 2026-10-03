import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createPayGrade,
  deletePayGrade,
  getPayGrades,
  updatePayGrade,
  type PayGrade,
} from "../../../../services/payGradeService";

import { useConfirm } from "../../../../components/ui/useConfirm";
import "./PayGrades.css";

const PayGrades = () => {
  const confirm = useConfirm();

  const [payGrades, setPayGrades] = useState<PayGrade[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingPayGrade, setEditingPayGrade] =
    useState<PayGrade | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] =
    useState<"Active" | "Inactive">("Active");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  /* =========================================
     LOAD PAY GRADES
  ========================================= */

  useEffect(() => {
    let cancelled = false;

    const loadPayGrades = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPayGrades();

        if (!cancelled) {
          setPayGrades(response.data || []);
        }
      } catch (error) {
        console.error(
          "Error fetching pay grades:",
          error
        );

        if (!cancelled) {
          setError("Failed to load pay grades");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPayGrades();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =========================================
     REFRESH
  ========================================= */

  const refreshPayGrades = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getPayGrades();

      setPayGrades(response.data || []);
    } catch (error) {
      console.error(
        "Error refreshing pay grades:",
        error
      );

      setError("Failed to load pay grades");
    } finally {
      setLoading(false);
    }
  };

  /* =========================================
     RESET FORM
  ========================================= */

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("Active");

    setEditingPayGrade(null);
    setShowForm(false);
    setError("");
  };

  /* =========================================
     ADD PAY GRADE
  ========================================= */

  const handleAdd = () => {
    setEditingPayGrade(null);

    setName("");
    setDescription("");
    setStatus("Active");

    setError("");
    setShowForm(true);
  };

  /* =========================================
     EDIT PAY GRADE
  ========================================= */

  const handleEdit = (payGrade: PayGrade) => {
    setEditingPayGrade(payGrade);

    setName(payGrade.name);
    setDescription(payGrade.description || "");
    setStatus(payGrade.status || "Active");

    setError("");
    setShowForm(true);
  };

  /* =========================================
     SAVE PAY GRADE
  ========================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Pay grade name is required");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingPayGrade) {
        await updatePayGrade(
          editingPayGrade._id,
          {
            name: name.trim(),
            description: description.trim(),
            status,
          }
        );
      } else {
        await createPayGrade({
          name: name.trim(),
          description: description.trim(),
          status,
        });
      }

      await refreshPayGrades();

      resetForm();
    } catch (error) {
      console.error(
        "Error saving pay grade:",
        error
      );

      if (
        error &&
        typeof error === "object" &&
        "response" in error
      ) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        };

        setError(
          axiosError.response?.data?.message ||
            "Failed to save pay grade"
        );
      } else {
        setError("Failed to save pay grade");
      }
    } finally {
      setSaving(false);
    }
  };

  /* =========================================
     DELETE PAY GRADE
  ========================================= */

  const handleDelete = async (id: string) => {
    const confirmed = await confirm(
      "Are you sure you want to delete this pay grade?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deletePayGrade(id);

      await refreshPayGrades();
    } catch (error) {
      console.error(
        "Error deleting pay grade:",
        error
      );

      setError("Failed to delete pay grade");
    }
  };

  /* =========================================
     SEARCH
  ========================================= */

  const filteredPayGrades = payGrades.filter(
    (payGrade) => {
      const searchText = search
        .toLowerCase()
        .trim();

      return (
        payGrade.name
          .toLowerCase()
          .includes(searchText) ||
        (payGrade.description || "")
          .toLowerCase()
          .includes(searchText) ||
        payGrade.status
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="pay-grades-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="pay-grades-header">

        <div>
          <h1>Pay Grades</h1>

          <p>
            Manage employee pay grades
          </p>
        </div>

        <button
          type="button"
          className="add-pay-grade-button"
          onClick={handleAdd}
        >
          + Add Pay Grade
        </button>

      </div>


      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="pay-grade-error">
          {error}
        </div>
      )}


      {/* =====================================
          ADD / EDIT FORM
      ===================================== */}

      {showForm && (
        <div className="pay-grade-form-card">

          <div className="pay-grade-form-header">

            <h2>
              {editingPayGrade
                ? "Edit Pay Grade"
                : "Add Pay Grade"}
            </h2>

            <button
              type="button"
              className="close-pay-grade-form"
              onClick={resetForm}
            >
              ×
            </button>

          </div>


          <form
            className="pay-grade-form"
            onSubmit={handleSubmit}
          >

            {/* PAY GRADE */}

            <div className="pay-grade-form-group">

              <label>
                Pay Grade
                <span>*</span>
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter pay grade"
              />

            </div>


            {/* DESCRIPTION */}

            <div className="pay-grade-form-group">

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Enter description"
                rows={4}
              />

            </div>


            {/* STATUS */}

            <div className="pay-grade-form-group">

              <label>
                Status
              </label>

              <select
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


            {/* ACTIONS */}

            <div className="pay-grade-form-actions">

              <button
                type="button"
                className="pay-grade-cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="pay-grade-save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingPayGrade
                  ? "Update"
                  : "Save"}
              </button>

            </div>

          </form>

        </div>
      )}


      {/* =====================================
          TABLE
      ===================================== */}

      <div className="pay-grades-card">

        {/* TOOLBAR */}

        <div className="pay-grades-toolbar">

          <div className="pay-grade-count">

            <strong>
              Pay Grades
            </strong>

            <span>
              {filteredPayGrades.length} Records
            </span>

          </div>


          <div className="pay-grade-search">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search pay grades..."
            />

          </div>

        </div>


        {/* TABLE CONTENT */}

        <div className="pay-grades-table-wrapper">

          {/* LOADING */}

          {loading && (
            <div className="pay-grade-loading">
              Loading pay grades...
            </div>
          )}


          {/* EMPTY */}

          {!loading &&
            filteredPayGrades.length === 0 && (
              <div className="pay-grade-empty">
                No pay grades found
              </div>
            )}


          {/* DATA */}

          {!loading &&
            filteredPayGrades.length > 0 && (

              <table className="pay-grades-table">

                <thead>
                  <tr>

                    <th>
                      Pay Grade
                    </th>

                    <th>
                      Description
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>
                </thead>


                <tbody>

                  {filteredPayGrades.map(
                    (payGrade) => (

                      <tr
                        key={payGrade._id}
                      >

                        <td>
                          <strong>
                            {payGrade.name}
                          </strong>
                        </td>


                        <td>
                          {payGrade.description ||
                            "—"}
                        </td>


                        <td>

                          <span
                            className={`pay-grade-status ${
                              payGrade.status ===
                              "Active"
                                ? "active"
                                : "inactive"
                            }`}
                          >
                            {payGrade.status}
                          </span>

                        </td>


                        <td>

                          <div className="pay-grade-actions">

                            <button
                              type="button"
                              className="pay-grade-edit-button"
                              onClick={() =>
                                handleEdit(
                                  payGrade
                                )
                              }
                            >
                              Edit
                            </button>


                            <button
                              type="button"
                              className="pay-grade-delete-button"
                              onClick={() =>
                                handleDelete(
                                  payGrade._id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            )}

        </div>

      </div>

    </div>
  );
};

export default PayGrades;