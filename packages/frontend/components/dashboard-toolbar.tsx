import type { Dictionary, Locale } from "../lib/dictionary";
import type { SessionState } from "../lib/session";
import { LanguageSwitcher } from "./language-switcher";

export function DashboardToolbar(props: {
  dict: Dictionary;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onLogout: () => void;
  session: SessionState;
}) {
  return (
    <div className="topbar">
      <div>
        <div className="brand">{props.dict.dashboard}</div>
        <div className="fine">
          {props.session.user.displayName} · {props.session.user.role} ·{" "}
          {props.session.tenantSlug}
        </div>
      </div>
      <div className="toolbar">
        <LanguageSwitcher
          locale={props.locale}
          onChange={props.onLocaleChange}
        />
        <button className="ghost" onClick={props.onLogout} type="button">
          {props.dict.logout}
        </button>
      </div>
    </div>
  );
}
