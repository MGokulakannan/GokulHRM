import { useEffect, useMemo, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { ClipboardCheck, Plus, Star, Target, Trophy } from "lucide-react";
import { useAuth } from "../../context/useAuth";
import {
  createGoal,
  createReview,
  deleteGoal,
  getGoals,
  getReviews,
  updateGoal,
  updateReview,
} from "../../services/performanceService";
import type { GoalRecord, PerformanceReviewRecord } from "../../services/performanceService";
import { getEmployees } from "../../services/employeeService";
import PageHeader from "../../components/layout/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/useToast";
import { useConfirm } from "../../components/ui/useConfirm";
import Field from "../../components/forms/Field";
import "./Performance.css";

interface EmployeeOption {
  _id: string;
  firstName: string;
  lastName: string;
}

const getEmployeeLabel = (value: PerformanceReviewRecord["employee"]) =>
  typeof value === "object" && value ? `${value.firstName} ${value.lastName}` : "-";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const Performance = () => {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [reviews, setReviews] = useState<PerformanceReviewRecord[]>([]);
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ employee: "", reviewPeriod: "", dueDate: "" });

  const [showGoalForm, setShowGoalForm] = useState(false);
  const [goalForm, setGoalForm] = useState({ employee: "", title: "", description: "", dueDate: "" });

  const [completingReview, setCompletingReview] = useState<PerformanceReviewRecord | null>(null);
  const [completeForm, setCompleteForm] = useState({ rating: 3, comments: "" });

  const loadAll = async () => {
    try {
      const [reviewRes, goalRes, employeeRes] = await Promise.all([
        getReviews(),
        getGoals(),
        isAdmin ? getEmployees() : Promise.resolve(null),
      ]);
      if (reviewRes.success) setReviews(reviewRes.data || []);
      if (goalRes.success) setGoals(goalRes.data || []);
      if (employeeRes?.success) setEmployees(employeeRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load performance data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const summary = useMemo(() => {
    const rated = reviews.filter((review) => review.rating);
    const average = rated.length
      ? (rated.reduce((sum, review) => sum + (review.rating || 0), 0) / rated.length).toFixed(1)
      : "-";

    return {
      totalReviews: reviews.length,
      pendingReviews: reviews.filter((review) => review.status === "Pending").length,
      average,
      activeGoals: goals.filter((goal) => goal.status !== "Completed").length,
    };
  }, [reviews, goals]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await createReview(reviewForm);
      if (response.success) {
        showToast("Performance review created", "success");
        setShowReviewForm(false);
        setReviewForm({ employee: "", reviewPeriod: "", dueDate: "" });
        await loadAll();
      } else {
        showToast(response.message || "Failed to create review", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to create review"), "error");
    } finally {
      setSaving(false);
    }
  };

  const openCompleteReview = (review: PerformanceReviewRecord) => {
    setCompletingReview(review);
    setCompleteForm({ rating: review.rating || 3, comments: review.comments || "" });
  };

  const handleCompleteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingReview) return;

    setSaving(true);
    try {
      await updateReview(completingReview._id, {
        rating: completeForm.rating,
        comments: completeForm.comments,
        status: "Completed",
      });
      showToast("Review completed", "success");
      setCompletingReview(null);
      await loadAll();
    } catch (error) {
      showToast(getApiError(error, "Failed to update review"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await createGoal(goalForm);
      if (response.success) {
        showToast("Goal assigned", "success");
        setShowGoalForm(false);
        setGoalForm({ employee: "", title: "", description: "", dueDate: "" });
        await loadAll();
      } else {
        showToast(response.message || "Failed to assign goal", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to assign goal"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGoalProgress = async (goal: GoalRecord, progress: number) => {
    try {
      await updateGoal(goal._id, {
        progress,
        status: progress >= 100 ? "Completed" : progress > 0 ? "In Progress" : "Not Started",
      });
      await loadAll();
    } catch {
      showToast("Failed to update goal progress", "error");
    }
  };

  const handleDeleteGoal = async (goal: GoalRecord) => {
    const confirmed = await confirm({
      title: "Delete goal",
      message: `Delete "${goal.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteGoal(goal._id);
      showToast("Goal deleted", "success");
      await loadAll();
    } catch {
      showToast("Failed to delete goal", "error");
    }
  };

  const employeeSelect = (value: string, onChange: (value: string) => void) => (
    <select required className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select Employee</option>
      {employees.map((employee) => (
        <option key={employee._id} value={employee._id}>
          {employee.firstName} {employee.lastName}
        </option>
      ))}
    </select>
  );

  return (
    <div className="gh-page">
      <PageHeader
        title="Performance"
        description={
          isAdmin
            ? "Manage performance reviews and employee goals"
            : "Track your performance reviews and goals"
        }
        actions={
          isAdmin && (
            <>
              <button className="btn btn-outline-primary d-flex align-items-center gap-1" onClick={() => setShowGoalForm(true)}>
                <Plus size={15} /> Assign Goal
              </button>
              <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowReviewForm(true)}>
                <Plus size={15} /> New Review
              </button>
            </>
          )
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon={<ClipboardCheck />} label="Total Reviews" value={summary.totalReviews} tone="primary" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<ClipboardCheck />} label="Pending Reviews" value={summary.pendingReviews} tone="warning" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<Star />} label="Average Rating" value={summary.average} tone="accent" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<Target />} label="Active Goals" value={summary.activeGoals} tone="info" />
        </div>
      </div>

      <div className="row g-3">
        {/* GOALS */}
        <div className="col-lg-5">
          <div className="gh-card perf-panel">
            <h2>Goals</h2>
            {loading ? (
              <SkeletonRows rows={3} />
            ) : goals.length === 0 ? (
              <EmptyState icon={<Target size={20} />} title="No goals assigned yet" />
            ) : (
              <div className="perf-goal-list">
                {goals.map((goal) => (
                  <div className="perf-goal" key={goal._id}>
                    <div className="perf-goal-top">
                      <div>
                        <strong>{goal.title}</strong>
                        {isAdmin && <span className="perf-goal-owner">{getEmployeeLabel(goal.employee)}</span>}
                      </div>
                      <StatusBadge status={goal.status} />
                    </div>
                    {goal.description && <p className="perf-goal-desc">{goal.description}</p>}
                    <div className="perf-goal-progress">
                      <div className="perf-track">
                        <div className="perf-fill" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="perf-goal-footer">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={10}
                        value={goal.progress}
                        onChange={(e) => handleGoalProgress(goal, Number(e.target.value))}
                        aria-label={`Progress for ${goal.title}`}
                      />
                      <span className="perf-goal-due">Due {formatDate(goal.dueDate)}</span>
                      {isAdmin && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteGoal(goal)}>
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* REVIEW HISTORY */}
        <div className="col-lg-7">
          <div className="gh-card perf-panel perf-reviews">
            <h2>Review History</h2>
            {loading ? (
              <SkeletonRows rows={4} />
            ) : reviews.length === 0 ? (
              <EmptyState icon={<Trophy size={20} />} title="No performance reviews yet" />
            ) : (
              <div className="table-responsive">
                <table className="table gh-table align-middle mb-0">
                  <thead>
                    <tr>
                      {isAdmin && <th>Employee</th>}
                      <th>Period</th>
                      <th>Due</th>
                      <th>Status</th>
                      <th>Rating</th>
                      <th>Comments</th>
                      {isAdmin && <th className="text-end">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review._id}>
                        {isAdmin && <td>{getEmployeeLabel(review.employee)}</td>}
                        <td>{review.reviewPeriod}</td>
                        <td className="text-muted">{formatDate(review.dueDate)}</td>
                        <td>
                          <StatusBadge status={review.status} />
                        </td>
                        <td>{review.rating ? `${review.rating} / 5` : "-"}</td>
                        <td className="perf-comments">{review.comments || "-"}</td>
                        {isAdmin && (
                          <td className="text-end">
                            {review.status === "Pending" && (
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openCompleteReview(review)}>
                                Complete
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* NEW REVIEW */}
      <Modal
        open={showReviewForm}
        onClose={() => setShowReviewForm(false)}
        title="New Performance Review"
        width={480}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={() => setShowReviewForm(false)}>
              Cancel
            </button>
            <button type="submit" form="review-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Creating..." : "Create Review"}
            </button>
          </>
        }
      >
        <form id="review-form" onSubmit={handleReviewSubmit} className="gh-form">
          <Field label="Employee *">
{employeeSelect(reviewForm.employee, (employee) => setReviewForm({ ...reviewForm, employee }))}
</Field>
          <Field label="Review Period *">
<input
              required
              className="form-control"
              placeholder="e.g. Q1 2026"
              value={reviewForm.reviewPeriod}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewPeriod: e.target.value })}
            />
</Field>
          <Field label="Due Date">
<input
              type="date"
              className="form-control"
              value={reviewForm.dueDate}
              onChange={(e) => setReviewForm({ ...reviewForm, dueDate: e.target.value })}
            />
</Field>
        </form>
      </Modal>

      {/* ASSIGN GOAL */}
      <Modal
        open={showGoalForm}
        onClose={() => setShowGoalForm(false)}
        title="Assign Goal"
        width={480}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={() => setShowGoalForm(false)}>
              Cancel
            </button>
            <button type="submit" form="goal-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Assigning..." : "Assign Goal"}
            </button>
          </>
        }
      >
        <form id="goal-form" onSubmit={handleGoalSubmit} className="gh-form">
          <Field label="Employee *">
{employeeSelect(goalForm.employee, (employee) => setGoalForm({ ...goalForm, employee }))}
</Field>
          <Field label="Title *">
<input
              required
              className="form-control"
              value={goalForm.title}
              onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
            />
</Field>
          <Field label="Due Date">
<input
              type="date"
              className="form-control"
              value={goalForm.dueDate}
              onChange={(e) => setGoalForm({ ...goalForm, dueDate: e.target.value })}
            />
</Field>
          <Field label="Description">
<textarea
              className="form-control"
              rows={3}
              value={goalForm.description}
              onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
            />
</Field>
        </form>
      </Modal>

      {/* COMPLETE REVIEW */}
      <Modal
        open={Boolean(completingReview)}
        onClose={() => setCompletingReview(null)}
        title="Complete Review"
        subtitle={
          completingReview
            ? `${getEmployeeLabel(completingReview.employee)} · ${completingReview.reviewPeriod}`
            : ""
        }
        width={440}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={() => setCompletingReview(null)}>
              Cancel
            </button>
            <button type="submit" form="complete-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save Review"}
            </button>
          </>
        }
      >
        <form id="complete-form" onSubmit={handleCompleteReview} className="gh-form">
          <Field label="Rating (1-5)">
<select
              className="form-select"
              value={completeForm.rating}
              onChange={(e) => setCompleteForm({ ...completeForm, rating: Number(e.target.value) })}
            >
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
</Field>
          <Field label="Comments">
<textarea
              className="form-control"
              rows={4}
              placeholder="Summarize the employee's performance..."
              value={completeForm.comments}
              onChange={(e) => setCompleteForm({ ...completeForm, comments: e.target.value })}
            />
</Field>
        </form>
      </Modal>
    </div>
  );
};

export default Performance;
