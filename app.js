// ===== Nouran Senses - app.js (v4: continuity event integration) =====
document.addEventListener("DOMContentLoaded", () => {
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const C = window.NouranContinuity;
  const event = (type, payload = {}) => { try { C?.record(type, payload); } catch (e) { console.warn("[Continuity]", e); } };

  if (navigator.serviceWorker && navigator.serviceWorker.getRegistration) {
    navigator.serviceWorker.getRegistration().then(reg => reg?.update?.());
  }

  function toast(msg, ok = true) {
    const t = $("#toast");
    if (!t) { console.log("[TOAST]", msg); return; }
    t.textContent = msg;
    t.className = "toast show";
    t.style.background = ok ? "#1b1b1b" : "#a0183a";
    setTimeout(() => (t.className = "toast"), 2500);
  }

  console.log("%c[Nouran] JS v4 loaded", "color:#e24ba8; font-weight:700");
  event("app_ready", { version: 4 });

  // ================== قفل الشاشة ==================
  const lockOverlay = $("#lockOverlay");
  function bindLockEnter() {
    const btn = $("#lockEnter");
    if (!btn) return false;
    btn.onclick = () => {
      toast("جاري التحقق …");
      const u = $("#lockUser")?.value || "";
      const p = $("#lockPass")?.value || "";
      const savedU = localStorage.getItem("LOCK_USER");
      const savedP = localStorage.getItem("LOCK_PASS");
      const enabled = localStorage.getItem("LOCK_ENABLED") === "true";
      if (enabled && (!savedU || !savedP)) {
        toast("⚠️ احفظ اسم مستخدم وكلمة مرور من الإعدادات أولاً", false);
        lockOverlay?.classList.add("hidden");
        event("lock_soft_open", { reason: "enabled_without_credentials" });
        return;
      }
      if (!enabled) {
        lockOverlay?.classList.add("hidden");
        toast("القفل غير مفعّل ✅");
        event("lock_open", { mode: "disabled" });
        return;
      }
      if (u === savedU && p === savedP) {
        lockOverlay?.classList.add("hidden");
        toast("✅ تم تسجيل الدخول");
        event("lock_open", { mode: "verified" });
      } else {
        toast("❌ بيانات غير صحيحة", false);
        event("lock_failed", {});
      }
    };
    return true;
  }
  if (!bindLockEnter()) {
    const iv = setInterval(() => { if (bindLockEnter()) clearInterval(iv); }, 300);
  }
  if (localStorage.getItem("LOCK_ENABLED") === "true") lockOverlay?.classList.remove("hidden");
  else lockOverlay?.classList.add("hidden");

  // ================== الكاميرا ==================
  $("#startCam")?.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      $("#liveVideo").srcObject = stream;
      startMicLevel(stream);
      toast("الكاميرا اشتغلت 🎥");
      event("camera_started", { video: true, audio: true });
    } catch (e) { toast("فشل تشغيل الكاميرا", false); event("camera_start_failed", { message: e?.message || String(e) }); console.error(e); }
  });
  $("#stopCam")?.addEventListener("click", () => {
    const v = $("#liveVideo");
    if (v?.srcObject) {
      v.srcObject.getTracks().forEach(t => t.stop());
      v.srcObject = null;
      stopMicLevel();
      toast("تم إيقاف الكاميرا");
      event("camera_stopped", {});
    }
  });
  $("#snap")?.addEventListener("click", () => {
    const v = $("#liveVideo");
    if (!v?.videoWidth) { toast("شغّل الكاميرا الأول", false); event("snapshot_failed", { reason: "camera_not_ready" }); return; }
    const c = $("#previewCanvas");
    const ctx = c.getContext("2d");
    c.width = v.videoWidth; c.height = v.videoHeight;
    ctx.drawImage(v, 0, 0);
    c.toBlob(b => {
      const url = URL.createObjectURL(b);
      const img = document.createElement("img");
      img.src = url; img.className = "thumb";
      $("#shotsTray").appendChild(img);
      toast("لقطة محفوظة 📸");
      event("snapshot_created", { width: c.width, height: c.height });
    }, "image/jpeg", 0.9);
  });

  // ================== تسجيل الشاشة ==================
  let rec, chunks = [];
  $("#startScreen")?.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      rec = new MediaRecorder(stream);
      chunks = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const v = $("#screenVideo");
        v.src = url; v.classList.remove("hidden");
        toast("معاينة التسجيل جاهزة 🎬");
        event("screen_recording_stopped", { bytes: blob.size });
      };
      rec.start();
      toast("بدأ تسجيل الشاشة 🖥️");
      event("screen_recording_started", {});
    } catch (e) { toast("فشل: " + e.message, false); event("screen_recording_failed", { message: e?.message || String(e) }); console.error(e); }
  });
  $("#stopScreen")?.addEventListener("click", () => { if (rec && rec.state !== "inactive") rec.stop(); });

  // ================== مؤشر الصوت ==================
  let audioCtx, analyser, raf;
  function startMicLevel(stream) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const src = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser(); analyser.fftSize = 512;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const loop = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        const pct = Math.min(100, Math.round((avg / 255) * 100));
        const b1 = $("#micBar"), b2 = $("#micBarBig");
        if (b1) b1.style.width = pct + "%";
        if (b2) b2.style.width = pct + "%";
        raf = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) { console.warn("Mic meter err", e); }
  }
  function stopMicLevel() { if (raf) cancelAnimationFrame(raf); if (audioCtx) audioCtx.close(); }

  // ================== الباب السحري ==================
  function appendMsg(role, text) {
    const box = document.createElement("div");
    box.className = "msg " + role;
    box.textContent = (role === "user" ? "أنت: " : "نوران: ") + text;
    $("#chatlog").appendChild(box);
    $("#chatlog").scrollTop = $("#chatlog").scrollHeight;
  }
  $("#chatForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const text = $("#chatInput").value.trim();
    if (!text) return;
    $("#chatInput").value = "";
    appendMsg("user", text);
    event("chat_input", { textLength: text.length });
    if (text === "اهلا نوران") {
      appendMsg("assistant", "الوضع الخاص مفعّل ✨");
      event("chat_response", { kind: "greeting" });
      return;
    }
    appendMsg("assistant", "(رد تجريبي من نوران)");
    event("chat_response", { kind: "demo" });
  });

  // ================== الـ Dock ==================
  $$(".dock-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".dock-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const target = btn.dataset.target;
      if (target) {
        $$(".panel").forEach(p => p.classList.remove("active"));
        $(target).classList.add("active");
      }
      if (btn.id === "btnSettings") $("#settingsDialog").showModal();
      event("navigation", { button: btn.id || null, target: target || null });
    });
  });

  // ================== الإعدادات ==================
  $("#saveSettings")?.addEventListener("click", () => {
    localStorage.setItem("OPENAI_KEY", $("#openaiKey")?.value || "");
    localStorage.setItem("GOOGLE_CLIENT_ID", $("#googleClientId")?.value || "");
    localStorage.setItem("DRIVE_FOLDER_ID", $("#driveFolderId")?.value || "");
    localStorage.setItem("GH_TOKEN", $("#ghToken")?.value || "");
    localStorage.setItem("GH_REPO", $("#ghRepo")?.value || "");
    localStorage.setItem("GH_BRANCH", $("#ghBranch")?.value || "main");
    localStorage.setItem("LOCK_ENABLED", $("#lockEnabled")?.checked ? "true" : "false");
    localStorage.setItem("LOCK_USER", $("#lockCfgUser")?.value || "");
    localStorage.setItem("LOCK_PASS", $("#lockCfgPass")?.value || "");
    toast("تم حفظ الإعدادات ✅");
    event("settings_saved", { lockEnabled: $("#lockEnabled")?.checked === true, repoConfigured: !!$("#ghRepo")?.value });
  });
  $("#btnConnectDrive")?.addEventListener("click", () => { toast("ربط Google Drive (تجريبي)"); event("drive_connect_attempt", {}); });
  $("#btnPickUpdate")?.addEventListener("click", () => { $("#ghFiles").click(); event("update_file_picker_opened", {}); });
  $("#btnUploadUpdate")?.addEventListener("click", () => { toast("رفع التحديث (محاكاة) ✅"); event("update_upload_demo", {}); });
});
