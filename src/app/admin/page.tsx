"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ContactItem {
  label: string;
  value: string;
  href: string;
}

interface AboutData {
  name: string;
  course: string;
  studentId: string;
  biography: string;
  objective: string;
  contactInfo: ContactItem[];
  skillSet: string[];
}

interface LogEntry {
  id: string;
  week: string;
  dates: string;
  hours: string;
  status: string;
  tasks: string[];
}

interface RequirementItem {
  key: string;
  name: string;
  href: string;
  submissionDate?: string;
}

interface HTEData {
  name: string;
  designation: string;
  details: string;
  logoUrl: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  
  // Auth state
  const [passcode, setPasscode] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // CMS state
  const [activeTab, setActiveTab] = useState<"profile" | "hte" | "logs" | "uploads">("profile");
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [hteData, setHteData] = useState<HTEData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Edit states for Weekly Logs
  const [editingLog, setEditingLog] = useState<Partial<LogEntry> | null>(null);
  const [newTaskInput, setNewTaskInput] = useState("");

  // CRUD states for Requirements list definitions
  const [newReqName, setNewReqName] = useState("");
  const [newReqKey, setNewReqKey] = useState("");
  const [showAddReqForm, setShowAddReqForm] = useState(false);
  const [editingReqKey, setEditingReqKey] = useState<string | null>(null);
  const [editingReqName, setEditingReqName] = useState("");

  // In-site File Preview modal state
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  // Fetch CMS Data
  async function fetchCMSData() {
    setIsLoadingData(true);
    try {
      const res = await fetch("/api/cms");
      if (res.ok) {
        const data = await res.json();
        setAboutData(data.about);
        setLogs(data.logs);
        setRequirements(data.requirements);
        setHteData(data.hte);
      } else {
        showStatus("Failed to load CMS databases", "error");
      }
    } catch {
      showStatus("Data fetching encountered an error", "error");
    } finally {
      setIsLoadingData(false);
    }
  }

  // Check auth on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth");
        const data = await res.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchCMSData();
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flash status message
  function showStatus(text: string, type: "success" | "error" = "success") {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  }

  // Handle Passcode Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    setIsSubmittingAuth(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        fetchCMSData();
      } else {
        setAuthError(data.error || "Authentication failed");
      }
    } catch {
      setAuthError("Server communication error");
    } finally {
      setIsSubmittingAuth(false);
    }
  }

  // Handle Logout
  async function handleLogout() {
    try {
      await fetch("/api/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setAboutData(null);
      setHteData(null);
      setLogs([]);
      setRequirements([]);
      router.push("/");
    } catch {
      showStatus("Logout failed", "error");
    }
  }

  // Save Profile Changes
  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!aboutData) return;

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-about",
          payload: aboutData,
        }),
      });

      if (res.ok) {
        showStatus("Profile details updated successfully!");
      } else {
        showStatus("Failed to update profile", "error");
      }
    } catch {
      showStatus("Server error during save", "error");
    }
  }

  // Save HTE/Company Details
  async function handleSaveHte(e: React.FormEvent) {
    e.preventDefault();
    if (!hteData) return;

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-hte",
          payload: hteData,
        }),
      });

      if (res.ok) {
        showStatus("HTE Profile updated successfully!");
      } else {
        showStatus("Failed to update HTE Profile", "error");
      }
    } catch {
      showStatus("Server error during HTE save", "error");
    }
  }

  // Handle HTE Logo Upload
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", "hte_logo");

    showStatus("Uploading HTE Seal/Logo...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (hteData) {
          const updatedHte = { ...hteData, logoUrl: data.url };
          setHteData(updatedHte);
          
          // Auto-save the logo url to database
          await fetch("/api/cms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update-hte",
              payload: updatedHte,
            }),
          });
        }
        showStatus("HTE Seal uploaded and saved successfully!");
      } else {
        const err = await res.json();
        showStatus(err.error || "Seal upload failed", "error");
      }
    } catch {
      showStatus("Server connection error during upload", "error");
    }
  }

  // Handle weekly log bullet changes
  function updateLogTask(index: number, val: string) {
    if (!editingLog?.tasks) return;
    const newTasks = [...editingLog.tasks];
    newTasks[index] = val;
    setEditingLog({ ...editingLog, tasks: newTasks });
  }

  function addLogTask() {
    if (!newTaskInput.trim() || !editingLog) return;
    const newTasks = [...(editingLog.tasks || []), newTaskInput.trim()];
    setEditingLog({ ...editingLog, tasks: newTasks });
    setNewTaskInput("");
  }

  function removeLogTask(index: number) {
    if (!editingLog?.tasks) return;
    const newTasks = editingLog.tasks.filter((_, i) => i !== index);
    setEditingLog({ ...editingLog, tasks: newTasks });
  }

  // Save Log (Edit or Add)
  async function handleSaveLog(e: React.FormEvent) {
    e.preventDefault();
    if (!editingLog) return;

    const isNew = !editingLog.id;
    const action = isNew ? "add-log" : "edit-log";

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          payload: editingLog,
        }),
      });

      if (res.ok) {
        showStatus(isNew ? "Added new OJT log entry!" : "Log entry updated!");
        setEditingLog(null);
        fetchCMSData();
      } else {
        showStatus("Failed to save log entry", "error");
      }
    } catch {
      showStatus("Server error while saving log", "error");
    }
  }

  // Delete Log
  async function handleDeleteLog(id: string) {
    if (!confirm("Are you sure you want to delete this log entry?")) return;

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-log",
          payload: { id },
        }),
      });

      if (res.ok) {
        showStatus("Log entry deleted successfully!");
        fetchCMSData();
      } else {
        showStatus("Failed to delete log entry", "error");
      }
    } catch {
      showStatus("Server error during deletion", "error");
    }
  }

  // Upload File for Requirement
  async function handleFileUpload(key: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);

    showStatus("Uploading document...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        showStatus("Document uploaded successfully!");
        fetchCMSData();
      } else {
        const err = await res.json();
        showStatus(err.error || "File upload failed", "error");
      }
    } catch {
      showStatus("Server connection error during upload", "error");
    }
  }

  // Delete File Upload
  async function handleDeleteFile(key: string) {
    if (!confirm("Are you sure you want to remove this document attachment?")) return;

    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        showStatus("Document removed successfully!");
        fetchCMSData();
      } else {
        showStatus("Failed to delete document", "error");
      }
    } catch {
      showStatus("Server error during deletion", "error");
    }
  }

  // Add Custom Requirement definition
  async function handleAddRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!newReqName.trim() || !newReqKey.trim()) return;

    const key = newReqKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
    if (requirements.some((r) => r.key === key)) {
      showStatus("Requirement key already exists", "error");
      return;
    }

    const updated = [
      ...requirements,
      { key, name: newReqName.trim(), href: "#" },
    ];

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-requirements-list",
          payload: updated,
        }),
      });

      if (res.ok) {
        showStatus("New requirement definition added!");
        setNewReqName("");
        setNewReqKey("");
        setShowAddReqForm(false);
        fetchCMSData();
      } else {
        showStatus("Failed to add requirement", "error");
      }
    } catch {
      showStatus("Server error while adding requirement", "error");
    }
  }

  // Delete Requirement definition (along with file)
  async function handleDeleteRequirementDefinition(key: string) {
    if (!confirm("Are you sure you want to delete this requirement definition? This will also delete any uploaded document attachment associated with it.")) return;

    // Delete uploaded file if present
    const item = requirements.find((r) => r.key === key);
    if (item && item.href && item.href !== "#") {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });
      } catch (err) {
        console.warn("Could not delete file attachment during definition removal: ", err);
      }
    }

    const updated = requirements.filter((r) => r.key !== key);

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-requirements-list",
          payload: updated,
        }),
      });

      if (res.ok) {
        showStatus("Requirement definition deleted!");
        fetchCMSData();
      } else {
        showStatus("Failed to delete definition", "error");
      }
    } catch {
      showStatus("Server error while deleting definition", "error");
    }
  }

  // Rename Requirement
  async function handleRenameRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!editingReqName.trim() || !editingReqKey) return;

    const updated = requirements.map((r) =>
      r.key === editingReqKey ? { ...r, name: editingReqName.trim() } : r
    );

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-requirements-list",
          payload: updated,
        }),
      });

      if (res.ok) {
        showStatus("Requirement renamed successfully!");
        setEditingReqKey(null);
        setEditingReqName("");
        fetchCMSData();
      } else {
        showStatus("Failed to rename requirement", "error");
      }
    } catch {
      showStatus("Server error while renaming requirement", "error");
    }
  }

  // Render Loader
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] font-orbitron gap-4">
        <div className="w-10 h-10 border-2 border-white/20 border-t-white animate-spin rounded-full" />
        <span className="text-xs text-neutral-500 tracking-widest uppercase">INITIALIZING_AUTH_CHECK...</span>
      </div>
    );
  }

  // Render Login Page
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm border border-white/10 bg-neutral-900/10 p-8 flex flex-col gap-6 font-orbitron">
          <div className="text-center border-b border-white/10 pb-4">
            <h2 className="text-[16px] font-bold text-white tracking-[0.2em] uppercase">ADMIN_PASSKEY</h2>
            <p className="text-[9px] text-neutral-500 font-mono tracking-widest mt-1">RESTRICTED_ACCESS</p>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-neutral-500 tracking-wider">ENTER PASSCODE:</label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#1b1b1b] border border-white/10 text-white font-mono px-4 py-2.5 text-sm rounded-none focus:outline-none focus:border-white/30 text-center tracking-[0.25em]"
              required
            />
          </div>

          {authError && (
            <div className="text-[11px] text-rose-500 bg-rose-500/10 border border-rose-500/20 p-2 text-center tracking-wide uppercase font-mono">
              [!] {authError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmittingAuth}
            className="w-full h-[36px] bg-[#d9d9d9] hover:bg-white text-[#252525] font-bold text-xs tracking-widest uppercase cursor-pointer transition-all active:scale-[0.98]"
          >
            {isSubmittingAuth ? "VALIDATING..." : "SUBMIT_PASSKEY"}
          </button>
        </form>
      </div>
    );
  }

  // Render Main Admin Panel
  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in duration-300">
      
      {/* Admin Header */}
      <div className="border-b border-white/10 pb-4 flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className="text-[18px] md:text-[22px] font-bold font-orbitron tracking-[0.25em] text-white uppercase">
            ADMIN_CONSOLE
          </h2>
          <span className="text-[9px] font-mono text-neutral-500 tracking-wider">
            SESSION: ACTIVE (HOST: CLOUD/HYBRID)
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 font-bold font-orbitron tracking-widest text-[10px] uppercase cursor-pointer transition-colors"
        >
          LOGOUT
        </button>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div className={`text-[12px] font-mono p-3 tracking-wide uppercase border text-center font-bold ${
          statusMessage.type === "success" 
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
            : "border-rose-500/20 bg-rose-500/10 text-rose-400"
        }`}>
          {statusMessage.type === "success" ? "[SUCCESS] " : "[ERR] "} {statusMessage.text}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-white/15 gap-2 select-none overflow-x-auto pb-1">
        {([
          { id: "profile", label: "ABOUT PROFILE" },
          { id: "hte", label: "HTE PROFILE" },
          { id: "logs", label: "OJT WEEKLY LOGS" },
          { id: "uploads", label: "DOCUMENT UPLOADS" }
        ] as const).map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setEditingLog(null); }}
            className={`px-4 py-2 text-[11px] md:text-[12px] font-bold font-orbitron tracking-wider uppercase cursor-pointer border-t border-x transition-all ${
              activeTab === tab.id
                ? "border-white/15 bg-neutral-900/10 text-white font-bold"
                : "border-transparent text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Box */}
      <div className="min-h-[400px]">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] font-orbitron gap-2">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin rounded-full" />
            <span className="text-[10px] text-neutral-500 tracking-wider">SYNCING_DATA...</span>
          </div>
        ) : (
          <>
            {/* 1. ABOUT PROFILE EDITOR TAB */}
            {activeTab === "profile" && aboutData && (
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 font-orbitron">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-neutral-500 tracking-wider">STUDENT FULL NAME</label>
                    <input
                      type="text"
                      value={aboutData.name}
                      onChange={(e) => setAboutData({ ...aboutData, name: e.target.value })}
                      className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-neutral-500 tracking-wider">COURSE & SECTION</label>
                    <input
                      type="text"
                      value={aboutData.course}
                      onChange={(e) => setAboutData({ ...aboutData, course: e.target.value })}
                      className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-neutral-500 tracking-wider">STUDENT ID NUMBER</label>
                    <input
                      type="text"
                      value={aboutData.studentId}
                      onChange={(e) => setAboutData({ ...aboutData, studentId: e.target.value })}
                      className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider">BIOGRAPHY</label>
                  <textarea
                    rows={4}
                    value={aboutData.biography}
                    onChange={(e) => setAboutData({ ...aboutData, biography: e.target.value })}
                    className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20 font-sans"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider">INTERNSHIP OBJECTIVES</label>
                  <textarea
                    rows={4}
                    value={aboutData.objective}
                    onChange={(e) => setAboutData({ ...aboutData, objective: e.target.value })}
                    className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20 font-sans"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider">SKILLS / COMPETENCIES (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={aboutData.skillSet.join(", ")}
                    onChange={(e) => setAboutData({ ...aboutData, skillSet: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                    className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20"
                    placeholder="Next.js, Python, QA Testing"
                  />
                </div>

                {/* Edit Contacts list */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-neutral-500 tracking-wider">SECURE COMMUNICATIONS (CONTACT PATHS)</label>
                  <div className="flex flex-col gap-3 border border-white/5 bg-neutral-900/10 p-4">
                    {aboutData.contactInfo.map((contact, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={contact.label}
                          disabled
                          className="bg-neutral-800/40 border border-white/5 text-neutral-400 px-3 py-1.5 text-[10px] focus:outline-none"
                        />
                        <input
                          type="text"
                          value={contact.value}
                          onChange={(e) => {
                            const newContact = [...aboutData.contactInfo];
                            newContact[idx].value = e.target.value;
                            setAboutData({ ...aboutData, contactInfo: newContact });
                          }}
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-1.5 text-xs focus:outline-none focus:border-white/20"
                          placeholder="Link handle/number"
                        />
                        <input
                          type="text"
                          value={contact.href}
                          onChange={(e) => {
                            const newContact = [...aboutData.contactInfo];
                            newContact[idx].href = e.target.value;
                            setAboutData({ ...aboutData, contactInfo: newContact });
                          }}
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-1.5 text-xs focus:outline-none focus:border-white/20"
                          placeholder="mailto:, https://..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="h-[36px] px-8 bg-[#d9d9d9] hover:bg-white text-[#252525] font-bold text-xs tracking-widest uppercase cursor-pointer transition-all active:scale-[0.98]"
                  >
                    SAVE_PROFILE_DETAILS
                  </button>
                </div>
              </form>
            )}

            {/* HTE PROFILE EDITOR TAB */}
            {activeTab === "hte" && hteData && (
              <form onSubmit={handleSaveHte} className="flex flex-col gap-6 max-h-[500px] overflow-y-auto pr-2 font-orbitron">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-neutral-500 tracking-wider">HTE ESTABLISHMENT NAME</label>
                    <input
                      type="text"
                      value={hteData.name}
                      onChange={(e) => setHteData({ ...hteData, name: e.target.value })}
                      className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-neutral-500 tracking-wider">INTERNSHIP DESIGNATION</label>
                    <input
                      type="text"
                      value={hteData.designation}
                      onChange={(e) => setHteData({ ...hteData, designation: e.target.value })}
                      className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-neutral-500 tracking-wider">COMPANY DETAILS / DESCRIPTION</label>
                  <textarea
                    rows={6}
                    value={hteData.details}
                    onChange={(e) => setHteData({ ...hteData, details: e.target.value })}
                    className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-white/20 font-sans"
                    required
                  />
                </div>

                {/* Logo upload block */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-neutral-500 tracking-wider">HTE LOGO / SEAL</label>
                  <div className="border border-white/5 bg-neutral-900/10 p-4 flex flex-col sm:flex-row items-center gap-6">
                    {/* Logo display */}
                    <div className="w-[100px] h-[100px] border border-white/15 bg-neutral-950 flex items-center justify-center relative overflow-hidden select-none">
                      {hteData.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={hteData.logoUrl} alt="Logo preview" className="max-w-[90%] max-h-[90%] object-contain" />
                      ) : (
                        <span className="text-[9px] text-neutral-600 font-mono">[NO_SEAL]</span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <label className="px-4 py-2 border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-xs tracking-wider uppercase cursor-pointer transition-colors text-center">
                        UPLOAD NEW LOGO
                        <input 
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {hteData.logoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Remove logo?")) return;
                            try {
                              await fetch("/api/upload", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ key: "hte_logo", url: hteData.logoUrl })
                              });
                              const updatedHte = { ...hteData, logoUrl: "" };
                              setHteData(updatedHte);
                              
                              // Save database details
                              await fetch("/api/cms", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "update-hte",
                                  payload: updatedHte,
                                }),
                              });
                              showStatus("HTE Logo removed.");
                            } catch {
                              showStatus("Failed to remove logo", "error");
                            }
                          }}
                          className="px-4 py-2 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-xs tracking-wider uppercase cursor-pointer"
                        >
                          REMOVE LOGO
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="h-[36px] px-8 bg-[#d9d9d9] hover:bg-white text-[#252525] font-bold text-xs tracking-widest uppercase cursor-pointer transition-all active:scale-[0.98]"
                  >
                    SAVE_HTE_DETAILS
                  </button>
                </div>
              </form>
            )}

            {/* 2. WEEKLY LOGS TAB */}
            {activeTab === "logs" && (
              <div className="flex flex-col gap-6">
                
                {/* Mode: Editing/Adding Log Form */}
                {editingLog ? (
                  <form onSubmit={handleSaveLog} className="border border-white/10 bg-neutral-900/10 p-6 flex flex-col gap-5 font-orbitron">
                    <div className="border-b border-white/5 pb-2 flex justify-between items-center">
                      <span className="text-[12px] font-bold text-white tracking-widest uppercase">
                        {editingLog.id ? "EDIT_LOG_ENTRY" : "ADD_LOG_ENTRY"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingLog(null)}
                        className="text-[10px] text-neutral-500 hover:text-neutral-300 uppercase cursor-pointer"
                      >
                        [CANCEL]
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-neutral-500 tracking-wider">WEEK LABEL</label>
                        <input
                          type="text"
                          value={editingLog.week || ""}
                          onChange={(e) => setEditingLog({ ...editingLog, week: e.target.value.toUpperCase() })}
                          placeholder="WEEK 01"
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[9px] text-neutral-500 tracking-wider">DATE RANGE</label>
                        <input
                          type="text"
                          value={editingLog.dates || ""}
                          onChange={(e) => setEditingLog({ ...editingLog, dates: e.target.value.toUpperCase() })}
                          placeholder="JUNE 01 - JUNE 05, 2026"
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-neutral-500 tracking-wider">HOURS LOGGED</label>
                        <input
                          type="text"
                          value={editingLog.hours || ""}
                          onChange={(e) => setEditingLog({ ...editingLog, hours: e.target.value.toUpperCase() })}
                          placeholder="40 HOURS"
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-neutral-500 tracking-wider">STATUS STATUS</label>
                        <select
                          value={editingLog.status || "APPROVED"}
                          onChange={(e) => setEditingLog({ ...editingLog, status: e.target.value })}
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="APPROVED">APPROVED</option>
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                      </div>
                    </div>

                    {/* Bullet tasks editor */}
                    <div className="flex flex-col gap-2.5">
                      <label className="text-[9px] text-neutral-500 tracking-wider">WEEKLY COMPLETED TASKS (BULLET POINTS)</label>
                      
                      <div className="flex flex-col gap-2">
                        {editingLog.tasks?.map((task, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-white/40 font-mono text-xs select-none">&gt;</span>
                            <input
                              type="text"
                              value={task}
                              onChange={(e) => updateLogTask(idx, e.target.value)}
                              className="flex-grow bg-[#1b1b1b] border border-white/10 text-white px-3 py-1.5 text-xs focus:outline-none font-sans"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeLogTask(idx)}
                              className="px-2.5 py-1.5 border border-rose-500/20 hover:bg-rose-500/10 text-rose-500 text-[10px] cursor-pointer"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add task block */}
                      <div className="flex gap-2 items-center border-t border-white/5 pt-2">
                        <span className="text-emerald-500/50 font-mono text-xs select-none">+</span>
                        <input
                          type="text"
                          value={newTaskInput}
                          onChange={(e) => setNewTaskInput(e.target.value)}
                          placeholder="Type a new task accomplished..."
                          className="flex-grow bg-[#1b1b1b]/60 border border-white/5 text-neutral-300 px-3 py-1.5 text-xs focus:outline-none font-sans"
                        />
                        <button
                          type="button"
                          onClick={addLogTask}
                          className="px-4 py-1.5 border border-emerald-500/20 hover:bg-emerald-500/15 text-emerald-400 text-[10px] cursor-pointer"
                        >
                          ADD_TASK
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-4">
                      <button
                        type="submit"
                        className="h-[32px] px-6 bg-[#d9d9d9] hover:bg-white text-[#252525] font-bold text-xs tracking-widest uppercase cursor-pointer transition-all active:scale-[0.98]"
                      >
                        SAVE_LOG_ENTRY
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingLog(null)}
                        className="h-[32px] px-6 border border-white/10 text-neutral-400 hover:text-white text-xs tracking-widest uppercase cursor-pointer"
                      >
                        CANCEL
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* Mode: List Logs */}
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-mono text-neutral-500 tracking-wider">
                        {logs.length} LOGGED WEEKS
                      </span>
                      <button
                        onClick={() => setEditingLog({ week: "", dates: "", hours: "40 HOURS", status: "APPROVED", tasks: [] })}
                        className="px-4 py-1.5 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-bold font-orbitron tracking-widest text-[10px] uppercase cursor-pointer transition-colors"
                      >
                        + ADD_WEEK_LOG
                      </button>
                    </div>

                    <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto pr-2">
                      {logs.map((entry) => (
                        <div key={entry.id} className="border border-white/10 bg-neutral-900/10 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 font-orbitron">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-3">
                              <span className="text-[13px] font-bold text-white tracking-widest">{entry.week}</span>
                              <span className="text-[9px] text-neutral-500 font-mono">[{entry.dates}]</span>
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono lowercase">
                              {entry.hours} • status: {entry.status} • {entry.tasks.length} accomplishments
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingLog(entry)}
                              className="px-3 py-1 border border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white text-[10px] cursor-pointer"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteLog(entry.id)}
                              className="px-3 py-1 border border-rose-500/20 hover:bg-rose-500/10 text-rose-400 text-[10px] cursor-pointer"
                            >
                              DELETE
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 3. UPLOADS TAB */}
            {activeTab === "uploads" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[11px] font-mono text-neutral-500 tracking-wider">
                    UPLOAD CENTER: ATTACH OJT DOCUMENTS (PDF / IMAGES)
                  </span>
                  
                  <button
                    onClick={() => setShowAddReqForm(true)}
                    className="px-3 py-1 border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-bold font-orbitron tracking-widest text-[9px] uppercase cursor-pointer"
                  >
                    + ADD REQUIREMENT
                  </button>
                </div>

                {/* Add requirement definition form */}
                {showAddReqForm && (
                  <form onSubmit={handleAddRequirement} className="border border-emerald-500/10 bg-emerald-500/5 p-4 flex flex-col gap-3 font-orbitron animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex justify-between items-center border-b border-emerald-500/10 pb-1">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">ADD NEW OJT REQUIREMENT DEFINITION</span>
                      <button type="button" onClick={() => setShowAddReqForm(false)} className="text-[9px] text-neutral-400 hover:text-white uppercase">[CANCEL]</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-neutral-500">REQUIREMENT NAME (E.G. "OFFICIAL RECEIPT")</label>
                        <input
                          type="text"
                          value={newReqName}
                          onChange={(e) => {
                            setNewReqName(e.target.value);
                            if (!newReqKey) {
                              setNewReqKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_").replace(/_+/g, "_"));
                            }
                          }}
                          placeholder="Document Name"
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-1.5 text-xs focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] text-neutral-500">SYSTEM KEY (E.G. "official_receipt")</label>
                        <input
                          type="text"
                          value={newReqKey}
                          onChange={(e) => setNewReqKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
                          placeholder="sys_key"
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-1.5 text-xs focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <button type="submit" className="h-[28px] self-start px-4 bg-emerald-400 text-[#252525] font-bold text-[10px] tracking-wider uppercase cursor-pointer">
                      SAVE_DEFINITION
                    </button>
                  </form>
                )}

                {/* Edit Name / Rename Form */}
                {editingReqKey && (
                  <form onSubmit={handleRenameRequirement} className="border border-white/15 bg-neutral-900/40 p-4 flex flex-col gap-3 font-orbitron animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex justify-between items-center border-b border-white/10 pb-1">
                      <span className="text-[10px] font-bold text-white uppercase">RENAME REQUIREMENT</span>
                      <button type="button" onClick={() => { setEditingReqKey(null); setEditingReqName(""); }} className="text-[9px] text-neutral-400 hover:text-white uppercase">[CANCEL]</button>
                    </div>
                    <div className="flex gap-3 items-end">
                      <div className="flex-grow flex flex-col gap-1">
                        <label className="text-[9px] text-neutral-500 font-mono">EDITING NAME FOR KEY: "{editingReqKey}"</label>
                        <input
                          type="text"
                          value={editingReqName}
                          onChange={(e) => setEditingReqName(e.target.value)}
                          className="bg-[#1b1b1b] border border-white/10 text-white px-3 py-1.5 text-xs focus:outline-none"
                          required
                        />
                      </div>
                      <button type="submit" className="h-[32px] px-4 bg-[#d9d9d9] hover:bg-white text-[#252525] font-bold text-[10px] tracking-wider uppercase cursor-pointer">
                        RENAME_FILE
                      </button>
                    </div>
                  </form>
                )}

                {/* Requirements list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 select-none font-orbitron">
                  {requirements.map((req) => {
                    const isUploaded = req.href && req.href !== "#";
                    return (
                      <div 
                        key={req.key}
                        className={`p-4 border flex flex-col gap-3 transition-colors ${
                          isUploaded ? "border-emerald-500/15 bg-emerald-500/5" : "border-white/10 bg-neutral-900/10"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex flex-col">
                            <span className={`text-[12px] font-bold tracking-wider uppercase ${
                              isUploaded ? "text-emerald-400" : "text-neutral-300"
                            }`}>
                              {req.name}
                            </span>
                            <span className="text-[9px] font-mono text-neutral-500 mt-0.5 lowercase">
                              key: {req.key} {req.submissionDate ? `• uploaded: ${req.submissionDate}` : ""}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 select-none">
                            <button
                              onClick={() => { setEditingReqKey(req.key); setEditingReqName(req.name); }}
                              className="text-[9px] text-neutral-500 hover:text-white uppercase transition-colors"
                              title="Rename requirement"
                            >
                              [RENAME]
                            </button>
                            <button
                              onClick={() => handleDeleteRequirementDefinition(req.key)}
                              className="text-[9px] text-rose-500/60 hover:text-rose-400 uppercase transition-colors"
                              title="Delete requirement definition"
                            >
                              [DELETE]
                            </button>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 border ${
                              isUploaded 
                                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" 
                                : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                            }`}>
                              {isUploaded ? "ACTIVE" : "MISSING"}
                            </span>
                          </div>
                        </div>

                        {/* Upload action controls */}
                        <div className="flex items-center gap-3 border-t border-white/5 pt-3">
                          {isUploaded ? (
                            <>
                              <button 
                                type="button"
                                onClick={() => setActivePreviewUrl(req.href)}
                                className="px-3 py-1 border border-white/10 hover:bg-white/5 text-neutral-300 hover:text-white text-[10px] tracking-wider uppercase cursor-pointer transition-colors"
                              >
                                VIEW_FILE
                              </button>
                              <button
                                onClick={() => handleDeleteFile(req.key)}
                                className="px-3 py-1 border border-rose-500/25 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] tracking-wider uppercase cursor-pointer transition-colors"
                              >
                                REMOVE
                              </button>
                            </>
                          ) : (
                            <label className="px-3 py-1 border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 text-[10px] tracking-wider uppercase cursor-pointer transition-colors">
                              CHOOSE & UPLOAD
                              <input 
                                type="file"
                                accept=".pdf,.docx,.png,.jpg,.jpeg"
                                onChange={(e) => handleFileUpload(req.key, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Embedded Document Viewer Modal */}
      {activePreviewUrl && (
        <div className="fixed inset-0 z-50 bg-[#151515]/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200 font-orbitron">
          <div className="w-full max-w-5xl h-[85vh] border border-white/20 bg-[#1e1e1e] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-white/10 px-6 py-4 bg-neutral-900/40">
              <div className="flex flex-col">
                <span className="text-[9px] text-neutral-500 font-mono tracking-widest uppercase">
                  SYS_PREVIEW_UTILITY
                </span>
                <span className="text-[13px] font-bold tracking-wider text-white truncate max-w-[200px] sm:max-w-lg">
                  {activePreviewUrl.split("/").pop()}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={activePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 border border-white/15 hover:bg-white/5 text-neutral-300 hover:text-white text-[10px] tracking-widest uppercase transition-colors"
                >
                  NEW_TAB
                </a>
                <button
                  onClick={() => setActivePreviewUrl(null)}
                  className="px-3 py-1.5 border border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 text-[10px] tracking-widest uppercase cursor-pointer transition-colors"
                >
                  CLOSE [X]
                </button>
              </div>
            </div>

            {/* Modal Body / Embedded File */}
            <div className="flex-grow bg-neutral-950/70 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              {activePreviewUrl.includes(".pdf") ? (
                <iframe
                  src={activePreviewUrl}
                  className="w-full h-full border-0"
                  title="PDF Document Viewer"
                />
              ) : /\.(jpg|jpeg|png|webp|gif|svg)/i.test(activePreviewUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePreviewUrl}
                  alt="Requirement Document"
                  className="max-w-full max-h-full object-contain select-none shadow-2xl"
                />
              ) : (
                <div className="text-center p-6 flex flex-col gap-4 max-w-md">
                  <div className="text-rose-500 font-mono text-lg">[!] NO_PREVIEW_AVAILABLE</div>
                  <p className="text-xs text-neutral-400 leading-relaxed font-sans">
                    This file format does not support inline rendering. Use the button above to open or download the file.
                  </p>
                  <a
                    href={activePreviewUrl}
                    download
                    className="self-center px-6 py-2 bg-[#d9d9d9] hover:bg-white text-[#252525] font-bold text-xs tracking-widest uppercase transition-all"
                  >
                    DOWNLOAD_FILE
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
