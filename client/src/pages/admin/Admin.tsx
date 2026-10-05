import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BadgeCheck,
  BadgeDollarSign,
  Boxes,
  Briefcase,
  Building2,
  Clock,
  Coins,
  Flag,
  GraduationCap,
  Languages,
  Layers,
  Mail,
  MapPin,
  Network,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCog,
  Users,
  Wallet,
  Wrench,
  Globe2,
  Award,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHeader from "../../components/layout/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import "./Admin.css";

interface HubItem {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface HubSection {
  title: string;
  icon: LucideIcon;
  items: HubItem[];
}

const sections: HubSection[] = [
  {
    title: "User Management",
    icon: UserCog,
    items: [
      { to: "/admin/users", label: "Users", description: "System accounts, roles and access status", icon: Users },
      { to: "/admin/user-roles", label: "User Roles", description: "Define what each role is allowed to do", icon: ShieldCheck },
    ],
  },
  {
    title: "Job",
    icon: Briefcase,
    items: [
      { to: "/admin/job-titles", label: "Job Titles", description: "Positions employees can hold", icon: Briefcase },
      { to: "/admin/pay-grades", label: "Pay Grades", description: "Salary bands and currencies", icon: BadgeDollarSign },
      { to: "/admin/employment-status", label: "Employment Status", description: "Full-time, contract, intern and more", icon: UserCheck },
      { to: "/admin/job-categories", label: "Job Categories", description: "Broad groupings for reporting", icon: Layers },
      { to: "/admin/work-shifts", label: "Work Shifts", description: "Working hours and breaks", icon: Clock },
    ],
  },
  {
    title: "Organization",
    icon: Building2,
    items: [
      { to: "/admin/general-information", label: "General Information", description: "Company profile and contact details", icon: Building2 },
      { to: "/admin/locations", label: "Locations", description: "Offices, branches and sites", icon: MapPin },
      { to: "/admin/structure", label: "Structure", description: "Company hierarchy from divisions to teams", icon: Network },
      { to: "/admin/cost-centers", label: "Cost Centers", description: "Budget codes for tracking spend", icon: Wallet },
    ],
  },
  {
    title: "Qualifications",
    icon: GraduationCap,
    items: [
      { to: "/admin/skills", label: "Skills", description: "Competencies employees can hold", icon: Wrench },
      { to: "/admin/education", label: "Education", description: "Education levels and degrees", icon: GraduationCap },
      { to: "/admin/licenses", label: "Licenses", description: "Licenses and certifications", icon: BadgeCheck },
      { to: "/admin/languages", label: "Languages", description: "Languages employees speak", icon: Languages },
      { to: "/admin/memberships", label: "Memberships", description: "Professional bodies and associations", icon: Award },
    ],
  },
  {
    title: "Nationalities",
    icon: Globe2,
    items: [
      { to: "/admin/nationalities", label: "Nationalities", description: "Nationalities available on employee records", icon: Flag },
    ],
  },
  {
    title: "Configuration",
    icon: SlidersHorizontal,
    items: [
      { to: "/admin/email-notifications", label: "Email Notifications", description: "Which events send email, and from whom", icon: Mail },
      { to: "/admin/localization", label: "Localization", description: "Language, formats, time zone and currency", icon: Coins },
      { to: "/admin/modules", label: "Modules", description: "Turn optional modules on or off", icon: Boxes },
    ],
  },
];

const Admin = () => {
  const [query, setQuery] = useState("");

  const visibleSections = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return sections;

    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          `${item.label} ${item.description} ${section.title}`.toLowerCase().includes(term)
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  const totalItems = sections.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="gh-page">
      <PageHeader
        title="Organization"
        description="Set up users, jobs, company structure, qualifications and system configuration"
        meta={<span className="text-muted">{totalItems} areas across {sections.length} groups</span>}
      />

      <div className="gh-card hub-search">
        <Search size={15} />
        <input
          type="text"
          aria-label="Find a setting"
          placeholder="Find a setting, e.g. shifts, skills, roles..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {visibleSections.length === 0 ? (
        <div className="gh-card">
          <EmptyState
            icon={<Search size={20} />}
            title="Nothing matches that search"
            description="Try a shorter word, or clear the search to see everything."
          />
        </div>
      ) : (
        <div className="hub-grid">
          {visibleSections.map((section) => {
            const SectionIcon = section.icon;

            return (
              <section className="gh-card hub-section" key={section.title}>
                <header className="hub-section-header">
                  <span className="hub-section-icon">
                    <SectionIcon size={16} />
                  </span>
                  <h2>{section.title}</h2>
                  <span className="hub-count">{section.items.length}</span>
                </header>

                <div className="hub-links">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <Link className="hub-link" to={item.to} key={item.to}>
                        <span className="hub-link-icon">
                          <ItemIcon size={16} />
                        </span>
                        <span className="hub-link-text">
                          <strong>{item.label}</strong>
                          <span>{item.description}</span>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Admin;
