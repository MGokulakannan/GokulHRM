import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { PowerOff } from "lucide-react";
import EmptyState from "../ui/EmptyState";
import { useAuth } from "../../context/useAuth";
import { isModuleEnabled, useModules } from "../../context/modulesStore";
import type { ModuleSettings } from "../../services/configurationService";

interface ModuleGateProps {
  module: keyof ModuleSettings;
  label: string;
  children: ReactNode;
}

// Renders its page only while the module is switched on in Configuration → Modules.
const ModuleGate = ({ module, label, children }: ModuleGateProps) => {
  const { isAdmin } = useAuth();
  const modules = useModules();

  if (isModuleEnabled(modules, module)) return <>{children}</>;

  return (
    <div className="gh-page">
      <div className="gh-card">
        <EmptyState
          icon={<PowerOff size={20} />}
          title={`${label} is turned off`}
          description={
            isAdmin
              ? "You can turn it back on under Organization → Configuration → Modules."
              : "Your administrator has turned this module off."
          }
          action={
            <Link className="btn btn-primary" to={isAdmin ? "/admin/modules" : "/dashboard"}>
              {isAdmin ? "Manage modules" : "Back to dashboard"}
            </Link>
          }
        />
      </div>
    </div>
  );
};

export default ModuleGate;
