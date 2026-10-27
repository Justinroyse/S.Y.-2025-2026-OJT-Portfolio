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
  avatarUrl?: string;
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
  const [activeTab, setActiveTab] = useState<
    "profile" | "hte" | "logs" | "uploads"
  >("profile");
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [hteData, setHteData] = useState<HTEData | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

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

  // Close preview modal on Escape
  useEffect(() => {
    if (!activePreviewUrl) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setActivePreviewUrl(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePreviewUrl]);

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
        showStatus("Could not load CMS data from server.", "error");
      }
    } catch {
      showStatus("Network error while fetching CMS data.", "error");
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
        setAuthError(data.error || "Invalid passcode.");
      }
    } catch {
      setAuthError("Unable to reach authentication server.");
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
      showStatus("Logout failed.", "error");
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

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showStatus("Profile details saved.");
        router.refresh();
      } else {
        showStatus(data.error || "Could not update profile.", "error");
      }
    } catch {
      showStatus("Server error while saving profile.", "error");
    }
  }

  // Handle Profile Photo Upload
  async function handleProfilePhotoUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", "profile_photo");

    showStatus("Uploading profile picture...");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (aboutData) {
          const updatedAbout = { ...aboutData, avatarUrl: data.url };
          setAboutData(updatedAbout);

          await fetch("/api/cms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update-about",
              payload: updatedAbout,
            }),
          });
        }
        showStatus("Profile picture uploaded and saved.");
        router.refresh();
      } else {
        const err = await res.json();
        showStatus(err.error || "Profile picture upload failed.", "error");
      }
    } catch {
      showStatus("Network error during profile photo upload.", "error");
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

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showStatus("HTE profile saved.");
        router.refresh();
      } else {
        showStatus(data.error || "Could not update HTE profile.", "error");
      }
    } catch {
      showStatus("Server error while saving HTE profile.", "error");
    }
  }

  // Handle HTE Logo Upload
  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", "hte_logo");

    showStatus("Uploading HTE logo...");

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

          await fetch("/api/cms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update-hte",
              payload: updatedHte,
            }),
          });
        }
        showStatus("HTE logo uploaded and saved.");
        router.refresh();
      } else {
        const err = await res.json();
        showStatus(err.error || "Logo upload failed.", "error");
      }
    } catch {
      showStatus("Network error during upload.", "error");
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

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showStatus(isNew ? "Weekly log entry added." : "Weekly log updated.");
        setEditingLog(null);
        fetchCMSData();
        router.refresh();
      } else {
        showStatus(data.error || "Could not save log entry.", "error");
      }
    } catch {
      showStatus("Server error while saving log entry.", "error");
    }
  }

  // Delete Log
  async function handleDeleteLog(id: string) {
    if (!confirm("Delete this weekly log entry?")) return;

    try {
      const res = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-log",
          payload: { id },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        showStatus("Weekly log entry deleted.");
        fetchCMSData();
        router.refresh();
      } else {
        showStatus(data.error || "Could not delete log entry.", "error");
      }
    } catch {
      showStatus("Server error during deletion.", "error");
    }
  }

  // Upload File for Requirement
  async function handleFileUpload(
    key: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
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
        showStatus("Document uploaded.");
        fetchCMSData();
        router.refresh();
      } else {
        const err = await res.json();
        showStatus(err.error || "File upload failed.", "error");
      }
    } catch {
      showStatus("Network error during upload.", "error");
    }
  }

  // Delete File Upload
  async function handleDeleteFile(key: string) {
    if (!confirm("Remove this attached document?")) return;

    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });

      if (res.ok) {
        showStatus("Document removed.");
        fetchCMSData();
        router.refresh();
      } else {
        showStatus("Could not remove document.", "error");
      }
    } catch {
      showStatus("Server error during deletion.", "error");
    }
  }

  // Add Custom Requirement definition
  async function handleAddRequirement(e: React.FormEvent) {
    e.preventDefault();
    if (!newReqName.trim() || !newReqKey.trim()) return;

    const key = newReqKey
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_");
    if (requirements.some((r) => r.key === key)) {
      showStatus("A requirement with this key already exists.", "error");
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
        showStatus("Requirement definition added.");
        setNewReqName("");
        setNewReqKey("");
        setShowAddReqForm(false);
        fetchCMSData();
        router.refresh();
      } else {
        showStatus("Could not add requirement.", "error");
      }
    } catch {
      showStatus("Server error while adding requirement.", "error");
    }
  }

  // Delete Requirement definition (along with file)
  async function handleDeleteRequirementDefinition(key: string) {
    if (
      !confirm(
        "Delete this requirement item and any uploaded file attached to it?"
      )
    )
      return;

    const item = requirements.find((r) => r.key === key);
    if (item && item.href && item.href !== "#") {
      try {
        await fetch("/api/upload", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key }),
        });
      } catch (err) {
        console.warn("Could not delete file attachment:", err);
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
        showStatus("Requirement deleted.");
        fetchCMSData();
        router.refresh();
      } else {
        showStatus("Could not delete requirement.", "error");
      }
    } catch {
      showStatus("Server error while deleting requirement.", "error");
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
        showStatus("Requirement renamed.");
        setEditingReqKey(null);
        setEditingReqName("");
        fetchCMSData();
        router.refresh();
      } else {
        showStatus("Could not rename requirement.", "error");
      }
    } catch {
      showStatus("Server error while renaming requirement.", "error");
    }
  }

  // Render Loader
  if (isAuthenticated === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] gap-4">
        <div className="w-9 h-9 border-2 border-white/20 border-t-white animate-spin rounded-full" />
        <span className="text-xs font-mono text-neutral-400 tracking-widest uppercase">
          Verifying session...
        </span>
      </div>
    );
  }

  // Render Login Page
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[380px] py-6">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm border border-white/15 bg-[#1b1c1e] p-6 sm:p-8 flex flex-col gap-6"
        >
          <div className="border-b border-white/10 pb-4">
            <span className="text-[10px] text-neutral-400 font-mono tracking-[0.2em] uppercase">
              RESTRICTED ACCESS
            </span>
            <h2 className="text-[18px] font-orbitron font-bold text-white tracking-[0.16em] uppercase mt-1">
              Admin Console Sign In
            </h2>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="admin-passcode"
              className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase"
            >
              Passcode
            </label>
            <input
              id="admin-passcode"
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter admin passcode"
              className="w-full min-h-[42px] bg-[#121314] border border-white/15 text-white font-mono px-4 py-2.5 text-sm rounded-none focus:outline-none focus:border-white/50 tracking-widest"
              required
            />
          </div>

          {authError ? (
            <div className="text-[12px] text-rose-300 bg-rose-500/10 border border-rose-500/30 p-3 font-mono">
              {authError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmittingAuth}
            className="w-full min-h-[44px] bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-xs tracking-widest uppercase cursor-pointer transition-colors disabled:opacity-50"
          >
            {isSubmittingAuth ? "Signing in..." : "Unlock Console"}
          </button>
        </form>
      </div>
    );
  }

  const submittedDocsCount = requirements.filter(
    (r) => Boolean(r.href && r.href !== "#")
  ).length;

  // Render Main Admin Panel
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Admin Header */}
      <div className="border-b border-white/15 pb-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-emerald-400 tracking-[0.2em] uppercase">
            AUTHENTICATED SESSION
          </span>
          <h2 className="text-[20px] sm:text-[24px] font-bold font-orbitron tracking-[0.16em] text-white uppercase mt-1">
            Portfolio CMS Console
          </h2>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="min-h-[40px] px-4 py-2 border border-rose-500/35 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold font-orbitron tracking-widest text-[11px] uppercase cursor-pointer transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Status Toast */}
      {statusMessage ? (
        <div
          role="status"
          className={`text-[12px] font-mono p-3.5 tracking-wide border font-semibold ${
            statusMessage.type === "success"
              ? "border-emerald-500/35 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/35 bg-rose-500/10 text-rose-300"
          }`}
        >
          {statusMessage.text}
        </div>
      ) : null}

      {/* Tab Navigation */}
      <div
        role="tablist"
        aria-label="CMS Sections"
        className="flex border-b border-white/15 gap-1.5 sm:gap-2 select-none overflow-x-auto no-scrollbar"
      >
        {(
          [
            { id: "profile", label: "Student Profile" },
            { id: "hte", label: "HTE Establishment" },
            { id: "logs", label: `Weekly Logs (${logs.length})` },
            {
              id: "uploads",
              label: `Deliverables (${submittedDocsCount}/${requirements.length})`,
            },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingLog(null);
              }}
              className={`min-h-[44px] px-4 py-2.5 text-[11px] sm:text-[12px] font-orbitron tracking-wider uppercase whitespace-nowrap cursor-pointer border-t border-x transition-colors ${
                active
                  ? "border-white/20 bg-[#1b1c1e] text-white font-bold"
                  : "border-transparent text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[360px]">
        {isLoadingData ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white animate-spin rounded-full" />
            <span className="text-[11px] font-mono text-neutral-400 tracking-wider uppercase">
              Loading portfolio records...
            </span>
          </div>
        ) : (
          <>
            {/* 1. ABOUT PROFILE EDITOR TAB */}
            {activeTab === "profile" && aboutData ? (
              <form
                onSubmit={handleSaveProfile}
                className="flex flex-col gap-6 border border-white/15 bg-[#1b1c1e]/60 p-5 sm:p-6"
              >
                {/* Profile Picture Upload Block */}
                <div className="flex flex-col gap-3 border-b border-white/10 pb-6">
                  <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                    Student Profile Picture
                  </label>
                  <div className="border border-white/10 bg-[#121314]/60 p-4 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative w-[100px] h-[100px] border border-white/25 bg-[#18191b] flex items-center justify-center overflow-hidden select-none shrink-0">
                      <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/70 pointer-events-none z-10" />
                      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/70 pointer-events-none z-10" />
                      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/70 pointer-events-none z-10" />
                      <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/70 pointer-events-none z-10" />

                      {aboutData.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={aboutData.avatarUrl}
                          alt="Profile picture preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          NO PHOTO
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2.5 text-center sm:text-left">
                      <p className="text-xs text-neutral-400 font-sans">
                        Displayed in the sidebar title block and on your About
                        profile page. Square portrait images (JPG, PNG, WebP)
                        work best.
                      </p>
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        <label className="min-h-[40px] px-4 py-2 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono tracking-wider uppercase cursor-pointer transition-colors inline-flex items-center">
                          Upload Profile Photo
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg,.webp"
                            onChange={handleProfilePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        {aboutData.avatarUrl ? (
                          <button
                            type="button"
                            onClick={async () => {
                              if (!confirm("Remove current profile picture?"))
                                return;
                              try {
                                await fetch("/api/upload", {
                                  method: "DELETE",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    key: "profile_photo",
                                    url: aboutData.avatarUrl,
                                  }),
                                });
                                const updatedAbout = {
                                  ...aboutData,
                                  avatarUrl: "",
                                };
                                setAboutData(updatedAbout);

                                await fetch("/api/cms", {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    action: "update-about",
                                    payload: updatedAbout,
                                  }),
                                });
                                showStatus("Profile picture removed.");
                                router.refresh();
                              } catch {
                                showStatus(
                                  "Could not remove profile picture.",
                                  "error"
                                );
                              }
                            }}
                            className="min-h-[40px] px-4 py-2 border border-rose-500/30 hover:bg-rose-500/15 text-rose-300 text-xs font-mono tracking-wider uppercase cursor-pointer transition-colors"
                          >
                            Remove Photo
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      value={aboutData.name}
                      onChange={(e) =>
                        setAboutData({ ...aboutData, name: e.target.value })
                      }
                      className="min-h-[42px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                      Course &amp; Section
                    </label>
                    <input
                      type="text"
                      value={aboutData.course}
                      onChange={(e) =>
                        setAboutData({ ...aboutData, course: e.target.value })
                      }
                      className="min-h-[42px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                      Student ID Number
                    </label>
                    <input
                      type="text"
                      value={aboutData.studentId}
                      onChange={(e) =>
                        setAboutData({
                          ...aboutData,
                          studentId: e.target.value,
                        })
                      }
                      className="min-h-[42px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm font-mono focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                    Engineering Biography
                  </label>
                  <textarea
                    rows={4}
                    value={aboutData.biography}
                    onChange={(e) =>
                      setAboutData({ ...aboutData, biography: e.target.value })
                    }
                    className="bg-[#121314] border border-white/15 text-white px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-white/40 font-sans"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                    Internship Objectives
                  </label>
                  <textarea
                    rows={4}
                    value={aboutData.objective}
                    onChange={(e) =>
                      setAboutData({ ...aboutData, objective: e.target.value })
                    }
                    className="bg-[#121314] border border-white/15 text-white px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-white/40 font-sans"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                    Competencies (Comma Separated)
                  </label>
                  <input
                    type="text"
                    value={aboutData.skillSet.join(", ")}
                    onChange={(e) =>
                      setAboutData({
                        ...aboutData,
                        skillSet: e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    className="min-h-[42px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none focus:border-white/40"
                    placeholder="Next.js, Python, QA Testing"
                  />
                </div>

                {/* Edit Contacts list (Responsive on Mobile) */}
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                    Contact Channels
                  </label>
                  <div className="flex flex-col gap-3 border border-white/10 bg-[#121314]/60 p-4">
                    {aboutData.contactInfo.map((contact, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-[120px_1fr_1fr] gap-2.5 sm:gap-3 pb-3 sm:pb-0 border-b sm:border-b-0 border-white/10 last:border-b-0 last:pb-0"
                      >
                        <input
                          type="text"
                          value={contact.label}
                          disabled
                          className="min-h-[38px] bg-white/5 border border-white/10 text-neutral-400 px-3 py-1.5 text-xs font-mono uppercase focus:outline-none"
                        />
                        <input
                          type="text"
                          value={contact.value}
                          onChange={(e) => {
                            const newContact = [...aboutData.contactInfo];
                            newContact[idx] = {
                              ...newContact[idx],
                              value: e.target.value,
                            };
                            setAboutData({
                              ...aboutData,
                              contactInfo: newContact,
                            });
                          }}
                          className="min-h-[38px] bg-[#121314] border border-white/15 text-white px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:border-white/40"
                          placeholder="Display value"
                        />
                        <input
                          type="text"
                          value={contact.href}
                          onChange={(e) => {
                            const newContact = [...aboutData.contactInfo];
                            newContact[idx] = {
                              ...newContact[idx],
                              href: e.target.value,
                            };
                            setAboutData({
                              ...aboutData,
                              contactInfo: newContact,
                            });
                          }}
                          className="min-h-[38px] bg-[#121314] border border-white/15 text-white px-3 py-1.5 text-xs sm:text-sm font-mono focus:outline-none focus:border-white/40"
                          placeholder="mailto:, https://..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="min-h-[44px] px-8 bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-xs tracking-widest uppercase cursor-pointer transition-colors"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            ) : null}

            {/* HTE PROFILE EDITOR TAB */}
            {activeTab === "hte" && hteData ? (
              <form
                onSubmit={handleSaveHte}
                className="flex flex-col gap-6 border border-white/15 bg-[#1b1c1e]/60 p-5 sm:p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                      Host Establishment Name
                    </label>
                    <input
                      type="text"
                      value={hteData.name}
                      onChange={(e) =>
                        setHteData({ ...hteData, name: e.target.value })
                      }
                      className="min-h-[42px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                      Internship Designation / Role
                    </label>
                    <input
                      type="text"
                      value={hteData.designation}
                      onChange={(e) =>
                        setHteData({ ...hteData, designation: e.target.value })
                      }
                      className="min-h-[42px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none focus:border-white/40"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                    Establishment Overview &amp; Role Description
                  </label>
                  <textarea
                    rows={5}
                    value={hteData.details}
                    onChange={(e) =>
                      setHteData({ ...hteData, details: e.target.value })
                    }
                    className="bg-[#121314] border border-white/15 text-white px-3.5 py-2.5 text-sm leading-relaxed focus:outline-none focus:border-white/40 font-sans"
                    required
                  />
                </div>

                {/* Logo upload block */}
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-mono text-neutral-300 tracking-wider uppercase">
                    HTE Official Seal / Logo
                  </label>
                  <div className="border border-white/10 bg-[#121314]/60 p-4 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-[110px] h-[110px] border border-white/20 bg-[#18191b] flex items-center justify-center relative overflow-hidden select-none shrink-0">
                      {hteData.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={hteData.logoUrl}
                          alt="HTE Logo preview"
                          className="max-w-[88%] max-h-[88%] object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-neutral-500 font-mono">
                          NO LOGO
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <label className="min-h-[40px] px-4 py-2 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono tracking-wider uppercase cursor-pointer transition-colors inline-flex items-center">
                        Upload New Seal
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                      {hteData.logoUrl ? (
                        <button
                          type="button"
                          onClick={async () => {
                            if (!confirm("Remove current HTE logo?")) return;
                            try {
                              await fetch("/api/upload", {
                                method: "DELETE",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  key: "hte_logo",
                                  url: hteData.logoUrl,
                                }),
                              });
                              const updatedHte = { ...hteData, logoUrl: "" };
                              setHteData(updatedHte);

                              await fetch("/api/cms", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  action: "update-hte",
                                  payload: updatedHte,
                                }),
                              });
                              showStatus("HTE logo removed.");
                              router.refresh();
                            } catch {
                              showStatus("Could not remove logo.", "error");
                            }
                          }}
                          className="min-h-[40px] px-4 py-2 border border-rose-500/30 hover:bg-rose-500/15 text-rose-300 text-xs font-mono tracking-wider uppercase cursor-pointer transition-colors"
                        >
                          Remove Seal
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="min-h-[44px] px-8 bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-xs tracking-widest uppercase cursor-pointer transition-colors"
                  >
                    Save HTE Details
                  </button>
                </div>
              </form>
            ) : null}

            {/* 2. WEEKLY LOGS TAB */}
            {activeTab === "logs" ? (
              <div className="flex flex-col gap-6">
                {editingLog ? (
                  <form
                    onSubmit={handleSaveLog}
                    className="border border-white/15 bg-[#1b1c1e]/80 p-5 sm:p-6 flex flex-col gap-5"
                  >
                    <div className="border-b border-white/10 pb-3 flex justify-between items-center">
                      <span className="text-[13px] font-orbitron font-bold text-white tracking-wider uppercase">
                        {editingLog.id
                          ? "Edit Weekly Log Entry"
                          : "New Weekly Log Entry"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingLog(null)}
                        className="min-h-[36px] px-3 text-[11px] font-mono text-neutral-400 hover:text-white uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-300 tracking-wider uppercase">
                          Week Label
                        </label>
                        <input
                          type="text"
                          value={editingLog.week || ""}
                          onChange={(e) =>
                            setEditingLog({
                              ...editingLog,
                              week: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="WEEK 01"
                          className="min-h-[40px] bg-[#121314] border border-white/15 text-white px-3 py-2 text-xs sm:text-sm font-orbitron focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label className="text-[10px] font-mono text-neutral-300 tracking-wider uppercase">
                          Date Range
                        </label>
                        <input
                          type="text"
                          value={editingLog.dates || ""}
                          onChange={(e) =>
                            setEditingLog({
                              ...editingLog,
                              dates: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="JUNE 01 - JUNE 05, 2026"
                          className="min-h-[40px] bg-[#121314] border border-white/15 text-white px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-300 tracking-wider uppercase">
                          Hours Logged
                        </label>
                        <input
                          type="text"
                          value={editingLog.hours || ""}
                          onChange={(e) =>
                            setEditingLog({
                              ...editingLog,
                              hours: e.target.value.toUpperCase(),
                            })
                          }
                          placeholder="40 HOURS"
                          className="min-h-[40px] bg-[#121314] border border-white/15 text-white px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-300 tracking-wider uppercase">
                          Verification Status
                        </label>
                        <select
                          value={editingLog.status || "APPROVED"}
                          onChange={(e) =>
                            setEditingLog({
                              ...editingLog,
                              status: e.target.value,
                            })
                          }
                          className="min-h-[40px] bg-[#121314] border border-white/15 text-white px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none cursor-pointer"
                        >
                          <option value="APPROVED">APPROVED</option>
                          <option value="SUBMITTED">SUBMITTED</option>
                          <option value="PENDING">PENDING</option>
                        </select>
                      </div>
                    </div>

                    {/* Bullet tasks editor */}
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-mono text-neutral-300 tracking-wider uppercase">
                        Completed Tasks &amp; Accomplishments
                      </label>

                      <div className="flex flex-col gap-2.5">
                        {editingLog.tasks?.map((task, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <span className="text-emerald-400 font-mono text-xs select-none shrink-0">
                              ▸
                            </span>
                            <input
                              type="text"
                              value={task}
                              onChange={(e) =>
                                updateLogTask(idx, e.target.value)
                              }
                              className="flex-grow min-h-[38px] bg-[#121314] border border-white/15 text-white px-3 py-1.5 text-sm focus:outline-none font-sans"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => removeLogTask(idx)}
                              aria-label={`Remove task ${idx + 1}`}
                              className="min-h-[38px] px-3 border border-rose-500/30 hover:bg-rose-500/15 text-rose-300 text-xs font-mono cursor-pointer shrink-0"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add task block */}
                      <div className="flex flex-col sm:flex-row gap-2.5 sm:items-center border-t border-white/10 pt-3">
                        <input
                          type="text"
                          value={newTaskInput}
                          onChange={(e) => setNewTaskInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addLogTask();
                            }
                          }}
                          placeholder="Describe a completed task and press Add..."
                          className="flex-grow min-h-[40px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none font-sans"
                        />
                        <button
                          type="button"
                          onClick={addLogTask}
                          className="min-h-[40px] px-4 py-2 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono uppercase tracking-wider cursor-pointer shrink-0"
                        >
                          + Add Task
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-3">
                      <button
                        type="submit"
                        className="min-h-[42px] px-6 bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-xs tracking-widest uppercase cursor-pointer transition-colors"
                      >
                        Save Log Entry
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingLog(null)}
                        className="min-h-[42px] px-6 border border-white/15 text-neutral-300 hover:text-white text-xs font-mono tracking-widest uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap justify-between items-center gap-3">
                      <span className="text-[12px] font-mono text-neutral-400 tracking-wider uppercase">
                        {logs.length} Recorded Weeks
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingLog({
                            week: "",
                            dates: "",
                            hours: "40 HOURS",
                            status: "APPROVED",
                            tasks: [],
                          })
                        }
                        className="min-h-[40px] px-4 py-2 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold font-orbitron tracking-widest text-[11px] uppercase cursor-pointer transition-colors"
                      >
                        + Add Week Log
                      </button>
                    </div>

                    <div className="flex flex-col gap-3.5">
                      {logs.map((entry) => (
                        <div
                          key={entry.id}
                          className="border border-white/15 bg-[#1b1c1e]/60 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                          <div className="flex flex-col gap-1.5">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <span className="text-[14px] font-orbitron font-bold text-white tracking-wider">
                                {entry.week}
                              </span>
                              <span className="text-[11px] text-neutral-400 font-mono">
                                [{entry.dates}]
                              </span>
                            </div>
                            <div className="text-[12px] text-neutral-300 font-mono">
                              {entry.hours} • {entry.status} •{" "}
                              {entry.tasks.length} accomplishments
                            </div>
                          </div>
                          <div className="flex items-center gap-2.5 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={() => setEditingLog(entry)}
                              className="min-h-[38px] px-3.5 py-1.5 border border-white/15 hover:bg-white/10 text-neutral-200 hover:text-white text-xs font-mono uppercase cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLog(entry.id)}
                              className="min-h-[38px] px-3.5 py-1.5 border border-rose-500/30 hover:bg-rose-500/15 text-rose-300 text-xs font-mono uppercase cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : null}

            {/* 3. UPLOADS TAB */}
            {activeTab === "uploads" ? (
              <div className="flex flex-col gap-6">
                <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/10 pb-3">
                  <span className="text-[12px] font-mono text-neutral-400 tracking-wider uppercase">
                    Manage OJT Deliverables (PDF or Images)
                  </span>

                  <button
                    type="button"
                    onClick={() => setShowAddReqForm(true)}
                    className="min-h-[40px] px-4 py-2 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold font-orbitron tracking-widest text-[11px] uppercase cursor-pointer"
                  >
                    + Add Requirement
                  </button>
                </div>

                {/* Add requirement definition form */}
                {showAddReqForm ? (
                  <form
                    onSubmit={handleAddRequirement}
                    className="border border-emerald-500/30 bg-[#1b1c1e] p-5 flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[12px] font-orbitron font-bold text-emerald-300 uppercase">
                        New Requirement Definition
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddReqForm(false)}
                        className="min-h-[34px] px-2 text-[11px] font-mono text-neutral-400 hover:text-white uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-300 uppercase">
                          Requirement Title
                        </label>
                        <input
                          type="text"
                          value={newReqName}
                          onChange={(e) => {
                            setNewReqName(e.target.value);
                            if (!newReqKey) {
                              setNewReqKey(
                                e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9_]/g, "_")
                                  .replace(/_+/g, "_")
                              );
                            }
                          }}
                          placeholder="e.g. Official Receipt"
                          className="min-h-[40px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-300 uppercase">
                          Document Key
                        </label>
                        <input
                          type="text"
                          value={newReqKey}
                          onChange={(e) =>
                            setNewReqKey(
                              e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9_]/g, "_")
                            )
                          }
                          placeholder="official_receipt"
                          className="min-h-[40px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm font-mono focus:outline-none"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="min-h-[40px] self-start px-5 bg-emerald-400 hover:bg-emerald-300 text-[#18191b] font-orbitron font-bold text-xs tracking-wider uppercase cursor-pointer"
                    >
                      Save Requirement
                    </button>
                  </form>
                ) : null}

                {/* Rename Form */}
                {editingReqKey ? (
                  <form
                    onSubmit={handleRenameRequirement}
                    className="border border-white/25 bg-[#1b1c1e] p-5 flex flex-col gap-4"
                  >
                    <div className="flex justify-between items-center border-b border-white/10 pb-2">
                      <span className="text-[12px] font-orbitron font-bold text-white uppercase">
                        Rename Requirement ({editingReqKey})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReqKey(null);
                          setEditingReqName("");
                        }}
                        className="min-h-[34px] px-2 text-[11px] font-mono text-neutral-400 hover:text-white uppercase cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                      <div className="flex-grow flex flex-col gap-1.5">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase">
                          Display Name
                        </label>
                        <input
                          type="text"
                          value={editingReqName}
                          onChange={(e) => setEditingReqName(e.target.value)}
                          className="min-h-[40px] bg-[#121314] border border-white/15 text-white px-3.5 py-2 text-sm focus:outline-none"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        className="min-h-[40px] px-5 bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-xs tracking-wider uppercase cursor-pointer"
                      >
                        Save Name
                      </button>
                    </div>
                  </form>
                ) : null}

                {/* Requirements Grid (Natural Flow) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {requirements.map((req) => {
                    const isUploaded = Boolean(req.href && req.href !== "#");
                    return (
                      <div
                        key={req.key}
                        className={`p-4 sm:p-5 border flex flex-col justify-between gap-4 transition-colors ${
                          isUploaded
                            ? "border-emerald-500/30 bg-emerald-500/[0.06]"
                            : "border-white/15 bg-[#1b1c1e]/55"
                        }`}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex flex-col min-w-0">
                            <span
                              className={`text-[14px] font-orbitron font-bold tracking-wide uppercase break-words ${
                                isUploaded ? "text-emerald-300" : "text-white"
                              }`}
                            >
                              {req.name}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400 mt-1">
                              {req.key}
                              {req.submissionDate
                                ? ` • Filed ${req.submissionDate}`
                                : ""}
                            </span>
                          </div>

                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 border shrink-0 uppercase ${
                              isUploaded
                                ? "border-emerald-500/35 bg-emerald-500/15 text-emerald-300"
                                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
                            }`}
                          >
                            {isUploaded ? "FILED" : "MISSING"}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {isUploaded ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const filename = req.href.split("/").pop();
                                    const viewUrl = req.href.startsWith(
                                      "/api/view/"
                                    )
                                      ? req.href
                                      : `/api/view/${filename}`;
                                    setActivePreviewUrl(viewUrl);
                                  }}
                                  className="min-h-[36px] px-3 py-1.5 border border-white/20 hover:bg-white/10 text-white text-[11px] font-mono tracking-wider uppercase cursor-pointer transition-colors"
                                >
                                  Preview
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(req.key)}
                                  className="min-h-[36px] px-3 py-1.5 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-mono tracking-wider uppercase cursor-pointer transition-colors"
                                >
                                  Remove File
                                </button>
                              </>
                            ) : (
                              <label className="min-h-[36px] px-3.5 py-1.5 border border-emerald-500/35 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-mono tracking-wider uppercase cursor-pointer transition-colors inline-flex items-center">
                                Upload File
                                <input
                                  type="file"
                                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                                  onChange={(e) =>
                                    handleFileUpload(req.key, e)
                                  }
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReqKey(req.key);
                                setEditingReqName(req.name);
                              }}
                              className="min-h-[34px] px-2.5 text-[11px] font-mono text-neutral-400 hover:text-white uppercase transition-colors cursor-pointer"
                            >
                              Rename
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteRequirementDefinition(req.key)
                              }
                              className="min-h-[34px] px-2.5 text-[11px] font-mono text-rose-400/80 hover:text-rose-300 uppercase transition-colors cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Embedded Document Viewer Modal */}
      {activePreviewUrl ? (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setActivePreviewUrl(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-0 sm:p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-5xl h-dvh sm:h-[88vh] border-0 sm:border border-white/25 bg-[#1b1c1e] flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex flex-wrap justify-between items-center gap-3 border-b border-white/15 px-4 py-3.5 sm:px-6 sm:py-4 bg-[#252525]">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] text-neutral-400 font-mono tracking-widest uppercase">
                  DOCUMENT PREVIEW
                </span>
                <span className="text-[13px] font-orbitron font-bold tracking-wider text-white truncate max-w-[200px] sm:max-w-lg">
                  {activePreviewUrl.split("/").pop()}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <a
                  href={activePreviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[38px] px-3.5 py-2 border border-white/20 hover:bg-white/10 text-neutral-200 hover:text-white text-[11px] font-mono tracking-wider uppercase inline-flex items-center transition-colors"
                >
                  Open in New Tab ↗
                </a>
                <button
                  type="button"
                  onClick={() => setActivePreviewUrl(null)}
                  className="min-h-[38px] px-3.5 py-2 border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[11px] font-mono font-semibold tracking-wider uppercase inline-flex items-center cursor-pointer transition-colors"
                >
                  Close [ESC]
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-grow bg-[#121314] p-2 sm:p-4 flex items-center justify-center overflow-hidden">
              {activePreviewUrl.includes(".pdf") ||
              activePreviewUrl.includes("/api/view/") ? (
                <object
                  data={activePreviewUrl}
                  type="application/pdf"
                  className="w-full h-full border-0"
                >
                  <iframe
                    src={activePreviewUrl}
                    className="w-full h-full border-0"
                    title="PDF Document Viewer"
                  />
                </object>
              ) : /\.(jpg|jpeg|png|webp|gif|svg)/i.test(activePreviewUrl) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePreviewUrl}
                  alt="Requirement Document"
                  className="max-w-full max-h-full object-contain select-none shadow-2xl"
                />
              ) : (
                <div className="text-center p-6 flex flex-col gap-4 max-w-md">
                  <div className="text-amber-400 font-orbitron font-bold text-base uppercase">
                    Inline Preview Unavailable
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed font-sans">
                    This file format does not support inline browser rendering.
                    Download the file to view it locally.
                  </p>
                  <a
                    href={activePreviewUrl}
                    download
                    className="min-h-[42px] self-center px-6 py-2.5 bg-[#e4e4e7] hover:bg-white text-[#18191b] font-orbitron font-bold text-xs tracking-widest uppercase inline-flex items-center transition-colors"
                  >
                    Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
