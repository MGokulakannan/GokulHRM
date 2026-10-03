import { useEffect, useMemo, useState } from "react";
import { getApiError } from "../../utils/apiError";
import { Briefcase, PauseCircle, Plus, Search, UserSearch, Users } from "lucide-react";
import {
  createCandidate,
  createVacancy,
  deleteCandidate,
  deleteVacancy,
  getCandidates,
  getVacancies,
  updateCandidate,
  updateVacancy,
} from "../../services/recruitmentService";
import type { Candidate, Vacancy } from "../../services/recruitmentService";
import { getDepartments } from "../../services/departmentService";
import { getDesignations } from "../../services/designationService";
import PageHeader from "../../components/layout/PageHeader";
import StatCard from "../../components/dashboard/StatCard";
import Modal from "../../components/ui/Modal";
import StatusBadge from "../../components/ui/StatusBadge";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonRows } from "../../components/ui/Skeleton";
import Pagination from "../../components/pagination/Pagination";
import { useToast } from "../../components/ui/useToast";
import { useConfirm } from "../../components/ui/useConfirm";
import Field from "../../components/forms/Field";
import "./Recuritment.css";

const PAGE_SIZE = 10;

const candidateStatuses = [
  "Applied",
  "Shortlisted",
  "Interview Scheduled",
  "Interviewed",
  "Hired",
  "Rejected",
];

interface LookupItem {
  _id: string;
  name: string;
  department?: string | { _id: string };
}

const getLabel = (value: string | { name?: string; title?: string } | undefined) => {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.name || value.title || "-";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const emptyVacancyForm = {
  title: "",
  department: "",
  designation: "",
  location: "",
  status: "Open",
  description: "",
};

const emptyCandidateForm = { name: "", email: "", phone: "", vacancy: "", notes: "" };

const Recruitment = () => {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [tab, setTab] = useState<"vacancies" | "candidates">("vacancies");
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [departments, setDepartments] = useState<LookupItem[]>([]);
  const [designations, setDesignations] = useState<LookupItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateStatusFilter, setCandidateStatusFilter] = useState("");
  const [candidatePage, setCandidatePage] = useState(1);

  const [showVacancyForm, setShowVacancyForm] = useState(false);
  const [vacancyForm, setVacancyForm] = useState(emptyVacancyForm);
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [candidateForm, setCandidateForm] = useState(emptyCandidateForm);
  const [saving, setSaving] = useState(false);

  const [detailCandidate, setDetailCandidate] = useState<Candidate | null>(null);
  const [detailForm, setDetailForm] = useState({ interviewDate: "", notes: "" });

  const loadAll = async () => {
    try {
      const [vacancyRes, candidateRes, departmentRes, designationRes] = await Promise.all([
        getVacancies(),
        getCandidates(),
        getDepartments(),
        getDesignations(),
      ]);
      if (vacancyRes.success) setVacancies(vacancyRes.data || []);
      if (candidateRes.success) setCandidates(candidateRes.data || []);
      if (departmentRes.success) setDepartments(departmentRes.data || []);
      if (designationRes.success) setDesignations(designationRes.data || []);
    } catch (error) {
      console.error(error);
      showToast("Failed to load recruitment data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const availableDesignations = designations.filter((designation) => {
    const departmentId =
      typeof designation.department === "string" ? designation.department : designation.department?._id;
    return departmentId === vacancyForm.department;
  });

  const stats = useMemo(
    () => ({
      open: vacancies.filter((v) => v.status === "Open").length,
      onHold: vacancies.filter((v) => v.status === "On Hold").length,
      candidates: candidates.length,
      interviews: candidates.filter((c) => c.status === "Interview Scheduled").length,
    }),
    [vacancies, candidates]
  );

  const filteredCandidates = useMemo(() => {
    const text = candidateSearch.toLowerCase().trim();
    return candidates.filter((candidate) => {
      const matchesStatus = !candidateStatusFilter || candidate.status === candidateStatusFilter;
      const haystack = `${candidate.name} ${candidate.email} ${getLabel(candidate.vacancy)}`.toLowerCase();
      return matchesStatus && (!text || haystack.includes(text));
    });
  }, [candidates, candidateSearch, candidateStatusFilter]);

  const paginatedCandidates = filteredCandidates.slice(
    (candidatePage - 1) * PAGE_SIZE,
    candidatePage * PAGE_SIZE
  );

  const handleVacancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await createVacancy(vacancyForm as Partial<Vacancy>);
      if (response.success) {
        showToast("Vacancy created", "success");
        setShowVacancyForm(false);
        setVacancyForm(emptyVacancyForm);
        await loadAll();
      } else {
        showToast(response.message || "Failed to create vacancy", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to create vacancy"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleVacancyStatusChange = async (id: string, status: string) => {
    try {
      await updateVacancy(id, { status: status as Vacancy["status"] });
      showToast("Vacancy status updated", "success");
      await loadAll();
    } catch {
      showToast("Failed to update vacancy", "error");
    }
  };

  const handleDeleteVacancy = async (vacancy: Vacancy) => {
    const confirmed = await confirm({
      title: "Delete vacancy",
      message: `Delete "${vacancy.title}" and all of its candidates? This cannot be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteVacancy(vacancy._id);
      showToast("Vacancy deleted", "success");
      await loadAll();
    } catch {
      showToast("Failed to delete vacancy", "error");
    }
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await createCandidate(candidateForm as Partial<Candidate>);
      if (response.success) {
        showToast("Candidate added", "success");
        setShowCandidateForm(false);
        setCandidateForm(emptyCandidateForm);
        await loadAll();
      } else {
        showToast(response.message || "Failed to add candidate", "error");
      }
    } catch (error) {
      showToast(getApiError(error, "Failed to add candidate"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCandidateStatusChange = async (id: string, status: string) => {
    try {
      await updateCandidate(id, { status: status as Candidate["status"] });
      showToast("Candidate status updated", "success");
      await loadAll();
    } catch {
      showToast("Failed to update candidate", "error");
    }
  };

  const openCandidateDetails = (candidate: Candidate) => {
    setDetailCandidate(candidate);
    setDetailForm({
      interviewDate: candidate.interviewDate ? candidate.interviewDate.substring(0, 10) : "",
      notes: candidate.notes || "",
    });
  };

  const saveCandidateDetails = async () => {
    if (!detailCandidate) return;
    setSaving(true);
    try {
      await updateCandidate(detailCandidate._id, {
        interviewDate: detailForm.interviewDate || undefined,
        notes: detailForm.notes,
      });
      showToast("Candidate details saved", "success");
      setDetailCandidate(null);
      await loadAll();
    } catch {
      showToast("Failed to save candidate details", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCandidate = async (candidate: Candidate) => {
    const confirmed = await confirm({
      title: "Delete candidate",
      message: `Remove ${candidate.name} from the pipeline?`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;

    try {
      await deleteCandidate(candidate._id);
      showToast("Candidate deleted", "success");
      setDetailCandidate(null);
      await loadAll();
    } catch {
      showToast("Failed to delete candidate", "error");
    }
  };

  return (
    <div className="gh-page">
      <PageHeader
        title="Recruitment"
        description="Manage job vacancies and track candidates through the pipeline"
        actions={
          tab === "vacancies" ? (
            <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowVacancyForm(true)}>
              <Plus size={16} /> New Vacancy
            </button>
          ) : (
            <button className="btn btn-primary d-flex align-items-center gap-1" onClick={() => setShowCandidateForm(true)}>
              <Plus size={16} /> Add Candidate
            </button>
          )
        }
      />

      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <StatCard icon={<Briefcase />} label="Open Vacancies" value={stats.open} tone="success" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<PauseCircle />} label="On Hold" value={stats.onHold} tone="warning" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<Users />} label="Total Candidates" value={stats.candidates} tone="primary" />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard icon={<UserSearch />} label="Interviews Scheduled" value={stats.interviews} tone="info" />
        </div>
      </div>

      <div className="rec-tabs">
        <button className={`rec-tab ${tab === "vacancies" ? "rec-tab-active" : ""}`} onClick={() => setTab("vacancies")}>
          Vacancies <span>{vacancies.length}</span>
        </button>
        <button className={`rec-tab ${tab === "candidates" ? "rec-tab-active" : ""}`} onClick={() => setTab("candidates")}>
          Candidates <span>{candidates.length}</span>
        </button>
      </div>

      {tab === "vacancies" && (
        <div className="gh-card rec-card">
          {loading ? (
            <div style={{ padding: 20 }}>
              <SkeletonRows rows={4} />
            </div>
          ) : vacancies.length === 0 ? (
            <EmptyState icon={<Briefcase size={20} />} title="No vacancies posted yet" description="Create a vacancy to start receiving candidates." />
          ) : (
            <div className="table-responsive">
              <table className="table gh-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Department</th>
                    <th>Designation</th>
                    <th>Location</th>
                    <th>Posted</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vacancies.map((vacancy) => (
                    <tr key={vacancy._id}>
                      <td>
                        <strong>{vacancy.title}</strong>
                      </td>
                      <td>{getLabel(vacancy.department)}</td>
                      <td>{getLabel(vacancy.designation)}</td>
                      <td>{vacancy.location || "-"}</td>
                      <td className="text-muted">{formatDate(vacancy.postedDate)}</td>
                      <td>
                        <select
                          className="form-select form-select-sm rec-status-select"
                          value={vacancy.status}
                          onChange={(e) => handleVacancyStatusChange(vacancy._id, e.target.value)}
                          aria-label={`Status for ${vacancy.title}`}
                        >
                          <option value="Open">Open</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteVacancy(vacancy)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "candidates" && (
        <>
          <div className="gh-card rec-toolbar">
            <div className="rec-search">
              <Search size={15} />
              <input
                type="text"
                placeholder="Search candidates..."
                value={candidateSearch}
                onChange={(e) => {
                  setCandidateSearch(e.target.value);
                  setCandidatePage(1);
                }}
              />
            </div>
            <select
              className="form-select rec-filter"
              value={candidateStatusFilter}
              onChange={(e) => {
                setCandidateStatusFilter(e.target.value);
                setCandidatePage(1);
              }}
            >
              <option value="">All Statuses</option>
              {candidateStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="gh-card rec-card">
            {loading ? (
              <div style={{ padding: 20 }}>
                <SkeletonRows rows={4} />
              </div>
            ) : filteredCandidates.length === 0 ? (
              <EmptyState icon={<Users size={20} />} title="No candidates found" description={candidateSearch || candidateStatusFilter ? "Try adjusting your filters." : "Add a candidate to a vacancy to get started."} />
            ) : (
              <div className="table-responsive">
                <table className="table gh-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Vacancy</th>
                      <th>Applied</th>
                      <th>Interview</th>
                      <th>Status</th>
                      <th className="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCandidates.map((candidate) => (
                      <tr key={candidate._id} className="rec-row" onClick={() => openCandidateDetails(candidate)}>
                        <td>
                          <strong>{candidate.name}</strong>
                          <div className="rec-sub">{candidate.email}</div>
                        </td>
                        <td>{getLabel(candidate.vacancy)}</td>
                        <td className="text-muted">{formatDate(candidate.appliedDate)}</td>
                        <td className="text-muted">{formatDate(candidate.interviewDate)}</td>
                        <td onClick={(e) => e.stopPropagation()}>
                          <select
                            className="form-select form-select-sm rec-status-select"
                            value={candidate.status}
                            onChange={(e) => handleCandidateStatusChange(candidate._id, e.target.value)}
                            aria-label={`Status for ${candidate.name}`}
                          >
                            {candidateStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCandidate(candidate)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <Pagination
              currentPage={candidatePage}
              totalItems={filteredCandidates.length}
              pageSize={PAGE_SIZE}
              onPageChange={setCandidatePage}
            />
          </div>
        </>
      )}

      {/* NEW VACANCY */}
      <Modal
        open={showVacancyForm}
        onClose={() => setShowVacancyForm(false)}
        title="New Vacancy"
        subtitle="Post an open position"
        width={560}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={() => setShowVacancyForm(false)}>
              Cancel
            </button>
            <button type="submit" form="vacancy-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Creating..." : "Create Vacancy"}
            </button>
          </>
        }
      >
        <form id="vacancy-form" onSubmit={handleVacancySubmit} className="gh-form">
          <div className="gh-form-grid">
            <Field label="Title *" className="gh-form-grid-full">
<input
                required
                className="form-control"
                value={vacancyForm.title}
                onChange={(e) => setVacancyForm({ ...vacancyForm, title: e.target.value })}
              />
</Field>
            <Field label="Department *">
<select
                required
                className="form-select"
                value={vacancyForm.department}
                onChange={(e) => setVacancyForm({ ...vacancyForm, department: e.target.value, designation: "" })}
              >
                <option value="">Select Department</option>
                {departments.map((department) => (
                  <option key={department._id} value={department._id}>
                    {department.name}
                  </option>
                ))}
              </select>
</Field>
            <Field label="Designation *">
<select
                required
                className="form-select"
                disabled={!vacancyForm.department}
                value={vacancyForm.designation}
                onChange={(e) => setVacancyForm({ ...vacancyForm, designation: e.target.value })}
              >
                <option value="">Select Designation</option>
                {availableDesignations.map((designation) => (
                  <option key={designation._id} value={designation._id}>
                    {designation.name}
                  </option>
                ))}
              </select>
</Field>
            <Field label="Location" className="gh-form-grid-full">
<input
                className="form-control"
                value={vacancyForm.location}
                onChange={(e) => setVacancyForm({ ...vacancyForm, location: e.target.value })}
              />
</Field>
            <Field label="Description" className="gh-form-grid-full">
<textarea
                className="form-control"
                rows={3}
                value={vacancyForm.description}
                onChange={(e) => setVacancyForm({ ...vacancyForm, description: e.target.value })}
              />
</Field>
          </div>
        </form>
      </Modal>

      {/* NEW CANDIDATE */}
      <Modal
        open={showCandidateForm}
        onClose={() => setShowCandidateForm(false)}
        title="Add Candidate"
        subtitle="Attach a candidate to an open vacancy"
        width={520}
        footer={
          <>
            <button type="button" className="btn btn-outline-primary" onClick={() => setShowCandidateForm(false)}>
              Cancel
            </button>
            <button type="submit" form="candidate-form" className="btn btn-primary" disabled={saving}>
              {saving ? "Adding..." : "Add Candidate"}
            </button>
          </>
        }
      >
        <form id="candidate-form" onSubmit={handleCandidateSubmit} className="gh-form">
          <div className="gh-form-grid">
            <Field label="Name *">
<input
                required
                className="form-control"
                value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
              />
</Field>
            <Field label="Email *">
<input
                required
                type="email"
                className="form-control"
                value={candidateForm.email}
                onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
              />
</Field>
            <Field label="Phone">
<input
                className="form-control"
                value={candidateForm.phone}
                onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
              />
</Field>
            <Field label="Vacancy *">
<select
                required
                className="form-select"
                value={candidateForm.vacancy}
                onChange={(e) => setCandidateForm({ ...candidateForm, vacancy: e.target.value })}
              >
                <option value="">Select Vacancy</option>
                {vacancies.map((vacancy) => (
                  <option key={vacancy._id} value={vacancy._id}>
                    {vacancy.title}
                  </option>
                ))}
              </select>
</Field>
            <Field label="Notes" className="gh-form-grid-full">
<textarea
                className="form-control"
                rows={3}
                value={candidateForm.notes}
                onChange={(e) => setCandidateForm({ ...candidateForm, notes: e.target.value })}
              />
</Field>
          </div>
        </form>
      </Modal>

      {/* CANDIDATE DETAILS */}
      <Modal
        open={Boolean(detailCandidate)}
        onClose={() => setDetailCandidate(null)}
        title={detailCandidate?.name || "Candidate"}
        subtitle={detailCandidate ? `Applied for ${getLabel(detailCandidate.vacancy)}` : ""}
        footer={
          <>
            <button className="btn btn-outline-primary" onClick={() => setDetailCandidate(null)}>
              Close
            </button>
            <button className="btn btn-primary" onClick={saveCandidateDetails} disabled={saving}>
              {saving ? "Saving..." : "Save Details"}
            </button>
          </>
        }
      >
        {detailCandidate && (
          <div className="gh-form">
            <div className="rec-detail-row">
              <span>Email</span>
              <strong>{detailCandidate.email}</strong>
            </div>
            <div className="rec-detail-row">
              <span>Phone</span>
              <strong>{detailCandidate.phone || "-"}</strong>
            </div>
            <div className="rec-detail-row">
              <span>Status</span>
              <StatusBadge status={detailCandidate.status} />
            </div>
            <div style={{ marginTop: 16 }}>
<Field label="Interview date">
<input
                type="date"
                className="form-control"
                value={detailForm.interviewDate}
                onChange={(e) => setDetailForm({ ...detailForm, interviewDate: e.target.value })}
              />
</Field>
</div>
            <Field label="Notes">
<textarea
                className="form-control"
                rows={3}
                value={detailForm.notes}
                onChange={(e) => setDetailForm({ ...detailForm, notes: e.target.value })}
              />
</Field>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Recruitment;
