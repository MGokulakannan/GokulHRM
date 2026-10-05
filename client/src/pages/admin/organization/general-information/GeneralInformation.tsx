import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Building2, Users } from "lucide-react";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import StatCard from "../../../../components/dashboard/StatCard";
import Field from "../../../../components/forms/Field";
import { SkeletonRows } from "../../../../components/ui/Skeleton";
import { useToast } from "../../../../components/ui/useToast";
import { getApiError } from "../../../../utils/apiError";
import {
  getOrganization,
  saveOrganization,
} from "../../../../services/configurationService";
import type { OrganizationProfile } from "../../../../services/configurationService";
import "../../../../components/admin/AdminPage.css";

type FormState = Omit<OrganizationProfile, "employeeCount">;

const emptyForm: FormState = {
  name: "",
  registrationNumber: "",
  taxId: "",
  industry: "",
  phone: "",
  fax: "",
  email: "",
  website: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  country: "",
  notes: "",
};

const toForm = (profile: Partial<OrganizationProfile>): FormState => {
  const next = { ...emptyForm };
  for (const key of Object.keys(emptyForm) as Array<keyof FormState>) {
    next[key] = profile[key] ?? "";
  }
  return next;
};

const GeneralInformation = () => {
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saved, setSaved] = useState<FormState>(emptyForm);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getOrganization()
      .then((profile) => {
        if (cancelled) return;
        const values = toForm(profile);
        setForm(values);
        setSaved(values);
        setEmployeeCount(profile.employeeCount ?? 0);
      })
      .catch((error) => {
        if (!cancelled) showToast(getApiError(error, "Failed to load organization details"), "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const dirty = (Object.keys(emptyForm) as Array<keyof FormState>).some(
    (key) => form[key] !== saved[key]
  );

  const bind = (key: keyof FormState) => ({
    value: form[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((current) => ({ ...current, [key]: event.target.value })),
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const profile = await saveOrganization(form);
      const values = toForm(profile);
      setForm(values);
      setSaved(values);
      setEmployeeCount(profile.employeeCount ?? employeeCount);
      showToast("Organization details saved", "success");
    } catch (error) {
      showToast(getApiError(error, "Failed to save organization details"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="gh-page">
      <AdminPageHeader
        section="Organization"
        title="General Information"
        description="Your company's profile, contact details and registered address"
      />

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-4">
          <StatCard
            icon={<Building2 size={20} />}
            label="Organization"
            value={saved.name || "Not set"}
            tone="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-4">
          <StatCard
            icon={<Users size={20} />}
            label="Active employees"
            value={employeeCount}
            tone="accent"
          />
        </div>
      </div>

      <form className="gh-card" onSubmit={handleSubmit}>
        {loading ? (
          <div className="adm-card-body">
            <SkeletonRows rows={8} />
          </div>
        ) : (
          <>
            <div className="adm-card-body">
              <h2 className="adm-section-title">Company details</h2>
              <p className="adm-section-help">Shown on reports and employee documents.</p>
              <div className="gh-form-grid">
                <Field label="Organization name *" className="gh-form-grid-full">
                  <input className="form-control" required maxLength={150} {...bind("name")} />
                </Field>
                <Field label="Industry">
                  <input className="form-control" maxLength={80} {...bind("industry")} />
                </Field>
                <Field label="Registration number">
                  <input className="form-control" maxLength={60} {...bind("registrationNumber")} />
                </Field>
                <Field label="Tax ID">
                  <input className="form-control" maxLength={60} {...bind("taxId")} />
                </Field>
              </div>
            </div>

            <div className="adm-card-body" style={{ borderTop: "1px solid var(--color-border)" }}>
              <h2 className="adm-section-title">Contact</h2>
              <p className="adm-section-help">How people can reach your organization.</p>
              <div className="gh-form-grid">
                <Field label="Phone">
                  <input className="form-control" type="tel" maxLength={30} {...bind("phone")} />
                </Field>
                <Field label="Fax">
                  <input className="form-control" maxLength={30} {...bind("fax")} />
                </Field>
                <Field label="Email">
                  <input className="form-control" type="email" maxLength={120} {...bind("email")} />
                </Field>
                <Field label="Website">
                  <input className="form-control" maxLength={150} placeholder="https://" {...bind("website")} />
                </Field>
              </div>
            </div>

            <div className="adm-card-body" style={{ borderTop: "1px solid var(--color-border)" }}>
              <h2 className="adm-section-title">Address</h2>
              <p className="adm-section-help">Registered head-office address.</p>
              <div className="gh-form-grid">
                <Field label="Street address" className="gh-form-grid-full">
                  <input className="form-control" maxLength={250} {...bind("address")} />
                </Field>
                <Field label="City">
                  <input className="form-control" maxLength={80} {...bind("city")} />
                </Field>
                <Field label="State / Province">
                  <input className="form-control" maxLength={80} {...bind("state")} />
                </Field>
                <Field label="Zip / Postal code">
                  <input className="form-control" maxLength={20} {...bind("zipCode")} />
                </Field>
                <Field label="Country">
                  <input className="form-control" maxLength={80} {...bind("country")} />
                </Field>
                <Field label="Notes" className="gh-form-grid-full">
                  <textarea className="form-control" rows={3} maxLength={1000} {...bind("notes")} />
                </Field>
              </div>
            </div>

            <div className="adm-form-footer">
              {dirty && <span className="adm-form-note">You have unsaved changes</span>}
              <button
                type="button"
                className="btn btn-outline-primary"
                disabled={!dirty || saving}
                onClick={() => setForm(saved)}
              >
                Discard changes
              </button>
              <button type="submit" className="btn btn-primary" disabled={!dirty || saving}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
};

export default GeneralInformation;
