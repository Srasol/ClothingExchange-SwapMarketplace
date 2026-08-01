import { useCallback, useEffect, useState } from "react";
import {
  FaCheckCircle,
  FaCog,
  FaGlobe,
  FaRedoAlt,
  FaSave,
  FaShieldAlt,
  FaToggleOff,
  FaToggleOn,
  FaUsers,
} from "react-icons/fa";

import API from "../services/api";

function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "SwapStyle",
    maintenanceMode: false,
    allowRegistration: true,
  });

  const [originalSettings, setOriginalSettings] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await API.get(
        "/admin/settings"
      );

      const receivedSettings =
        response.data?.settings ||
        response.data ||
        {};

      const updatedSettings = {
        siteName:
          receivedSettings.siteName ||
          "SwapStyle",

        maintenanceMode: Boolean(
          receivedSettings.maintenanceMode
        ),

        allowRegistration:
          receivedSettings.allowRegistration !==
          undefined
            ? Boolean(
                receivedSettings.allowRegistration
              )
            : true,
      };

      setSettings(updatedSettings);
      setOriginalSettings(updatedSettings);
    } catch (requestError) {
      console.error(
        "Load admin settings error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to load settings."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleTextChange = (event) => {
    const { name, value } = event.target;

    setSettings((current) => ({
      ...current,
      [name]: value,
    }));

    if (message) {
      setMessage("");
    }

    if (error) {
      setError("");
    }
  };

  const toggleSetting = (name) => {
    setSettings((current) => ({
      ...current,
      [name]: !current[name],
    }));

    if (message) {
      setMessage("");
    }

    if (error) {
      setError("");
    }
  };

  const resetSettings = () => {
    if (!originalSettings) {
      return;
    }

    setSettings(originalSettings);
    setMessage("");
    setError("");
  };

  const saveSettings = async (event) => {
    event.preventDefault();

    const siteName = settings.siteName.trim();

    if (!siteName) {
      setError("Site name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        siteName,
        maintenanceMode:
          settings.maintenanceMode,
        allowRegistration:
          settings.allowRegistration,
      };

      const response = await API.put(
        "/admin/settings",
        payload
      );

      const savedSettings = {
        ...payload,
        ...(response.data?.settings ||
          response.data ||
          {}),
      };

      setSettings(savedSettings);
      setOriginalSettings(savedSettings);

      setMessage(
        "Settings saved successfully."
      );
    } catch (requestError) {
      console.error(
        "Save admin settings error:",
        requestError.response?.data ||
          requestError.message
      );

      setError(
        requestError.response?.data?.message ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    originalSettings &&
    JSON.stringify(settings) !==
      JSON.stringify(originalSettings);

  if (loading) {
    return (
      <main className="admin-settings-theme-page">
        <div className="admin-settings-theme-loading">
          <div className="admin-settings-theme-spinner" />

          <h2>Loading Settings</h2>

          <p>
            Preparing platform configuration.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-settings-theme-page">
      <section className="admin-settings-theme-hero">
        <div>
          <span>
            Admin Configuration
          </span>

          <h1>Platform Settings</h1>

          <p>
            Manage marketplace identity,
            registration access and maintenance
            controls.
          </p>
        </div>

        <div className="admin-settings-theme-hero-icon">
          <FaCog />
        </div>
      </section>

      {message && (
        <div className="admin-settings-theme-alert success">
          <FaCheckCircle />

          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="admin-settings-theme-alert error">
          <FaShieldAlt />

          <span>{error}</span>
        </div>
      )}

      <form
        onSubmit={saveSettings}
        className="admin-settings-theme-form"
      >
        <section className="admin-settings-theme-card">
          <div className="admin-settings-theme-card-heading">
            <div className="admin-settings-theme-card-icon">
              <FaGlobe />
            </div>

            <div>
              <span>Marketplace Identity</span>

              <h2>General Information</h2>

              <p>
                Set the public name shown across
                your clothing exchange platform.
              </p>
            </div>
          </div>

          <div className="admin-settings-theme-field">
            <label htmlFor="siteName">
              Site Name
            </label>

            <input
              id="siteName"
              type="text"
              name="siteName"
              value={settings.siteName}
              onChange={handleTextChange}
              placeholder="Enter marketplace name"
              disabled={saving}
            />

            <small>
              This name may appear in headers,
              emails and administrative pages.
            </small>
          </div>
        </section>

        <section className="admin-settings-theme-card">
          <div className="admin-settings-theme-card-heading">
            <div className="admin-settings-theme-card-icon">
              <FaShieldAlt />
            </div>

            <div>
              <span>Platform Access</span>

              <h2>System Controls</h2>

              <p>
                Control marketplace availability
                and new account registration.
              </p>
            </div>
          </div>

          <SettingToggle
            title="Maintenance Mode"
            description="Temporarily restrict access while system updates or maintenance are in progress."
            enabled={
              settings.maintenanceMode
            }
            onToggle={() =>
              toggleSetting(
                "maintenanceMode"
              )
            }
            icon={<FaShieldAlt />}
            disabled={saving}
            warning
          />

          <SettingToggle
            title="Allow New Registrations"
            description="Permit new users to create accounts and join the clothing exchange marketplace."
            enabled={
              settings.allowRegistration
            }
            onToggle={() =>
              toggleSetting(
                "allowRegistration"
              )
            }
            icon={<FaUsers />}
            disabled={saving}
          />
        </section>

        <section className="admin-settings-theme-summary">
          <div>
            <span>Current Configuration</span>

            <h2>Settings Summary</h2>
          </div>

          <div className="admin-settings-theme-summary-grid">
            <SummaryItem
              label="Site Name"
              value={
                settings.siteName ||
                "Not configured"
              }
            />

            <SummaryItem
              label="Maintenance"
              value={
                settings.maintenanceMode
                  ? "Enabled"
                  : "Disabled"
              }
            />

            <SummaryItem
              label="Registration"
              value={
                settings.allowRegistration
                  ? "Allowed"
                  : "Blocked"
              }
            />
          </div>
        </section>

        <div className="admin-settings-theme-actions">
          <button
            type="button"
            className="admin-settings-theme-reset"
            onClick={resetSettings}
            disabled={
              saving || !hasChanges
            }
          >
            <FaRedoAlt />
            Reset Changes
          </button>

          <button
            type="submit"
            className="admin-settings-theme-save"
            disabled={
              saving || !hasChanges
            }
          >
            {saving ? (
              <>
                <span className="admin-settings-theme-button-spinner" />
                Saving...
              </>
            ) : (
              <>
                <FaSave />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onToggle,
  icon,
  disabled,
  warning = false,
}) {
  return (
    <article
      className={`admin-settings-theme-toggle-row ${
        warning ? "warning" : ""
      }`}
    >
      <div className="admin-settings-theme-toggle-content">
        <div className="admin-settings-theme-toggle-icon">
          {icon}
        </div>

        <div>
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>

      <button
        type="button"
        className={`admin-settings-theme-toggle-button ${
          enabled ? "enabled" : ""
        }`}
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={enabled}
      >
        {enabled ? (
          <FaToggleOn />
        ) : (
          <FaToggleOff />
        )}

        <span>
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </button>
    </article>
  );
}

function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="admin-settings-theme-summary-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default AdminSettings;