// ===== Nouran Senses - app.js (v3: lock fix + SW refresh + robust bindings) =====
document.addEventListener("DOMContentLoaded", () => {
  // -------- أدوات صغيرة --------
  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);

  // جرّب نحدّث الـ Service Worker عشان ما يفضّلش كاش قديم
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

  console.log("%c[Nouran] JS v3 loaded", "color:#e24ba8; font-weight:700");

  // ================== قفل الشاشة (إصلاح نهائي) ==================
  const lockOverlay = $("#lockOverlay");
  const lockEnterBtn = $("#lockEnter");

  // دالة تربط الحدث حتى لو العنصر اتأخّر
  function bindLockEnter() {
    const btn = $("#lockEnter");
    if (!btn) return false;
    btn.onclick = () => {
      console.log("[Lock] Enter clicked");
      toast("جاري التحقق …");
      const u = $("#lockUser")?.value || "";
      const p = $("#lockPass")?.value || "";
      const savedU = localStorage.getItem("LOCK_USER");
      const savedP = localStorage.getItem("LOCK_PASS");
      const enabled = localStorage.getItem("LOCK_ENABLED") === "true";

      // لو القفل متفعّل ومفيش بيانات محفوظة: دخل مؤقّت واطلب منه يحفظ
      if (enabled && (!savedU || !savedP)) {
        toast("⚠️ احفظ اسم مستخدم وكلمة مرور من الإعدادات أولاً", false);
        lockOverlay?.classList.add("hidden");
        console.warn("[Lock] Enabled but no creds stored -> soft open");
        return;
      }
      // لو القفل مش متفعّل أصلاً: افتح على طول
      if (!enabled) {
        lockOverlay?.classList.add("hidden");
        toast("القفل غير مفعّل ✅");
        console.log("[Lock] Not enabled -> open");
        return;
      }
      // تحقق عادي
      if (u === savedU && p === savedP) {
        lockOverlay?.classList.add("hidden");
        toast("✅ تم تسجيل الدخول");
        console.log("[Lock] Success");
      } else {
        toast("❌ بيانات غير صحيحة", false);
        console.warn("[Lock] Wrong creds");
      }
    };
    return true;
  }

  // أربط الآن، ولو العنصر مش موجود جرّب كل 300ms لحد ما يبان
  if (!bindLockEnter()) {
    const iv = setInterval(() => {
      if (bindLockEnter()) clearInterval(iv);
    }, 300);
  }

  // أظهر القفل حسب الإعدادات
  if (localStorage.getItem("LOCK_ENABLED") === "true") {
    lockOverlay?.classList.remove("hidden");
  } else {
    lockOverlay?.classList.add("hidden");
  }

  // ================== الكاميرا ==================
  $("#startCam")?.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      $("#liveVideo").srcObject = stream;
      startMicLevel(stream);
      toast("الكاميرا اشتغلت 🎥");
    } catch (e) { toast("فشل تشغيل الكاميرا", false); console.error(e); }
  });

  $("#stopCam")?.addEventListener("click", () => {
    const v = $("#liveVideo");
    if (v?.srcObject) {
      v.srcObject.getTracks().forEach(t => t.stop());
      v.srcObject = null;
      stopMicLevel();
      toast("تم إيقاف الكاميرا");
    }
  });

  $("#snap")?.addEventListener("click", () => {
    const v = $("#liveVideo");
    if (!v?.videoWidth) { toast("شغّل الكاميرا الأول", false); return; }
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
      };
      rec.start();
      toast("بدأ تسجيل الشاشة 🖥️");
    } catch (e) { toast("فشل: " + e.message, false); console.error(e); }
  });

  $("#stopScreen")?.addEventListener("click", () => {
    if (rec && rec.state !== "inactive") rec.stop();
  });

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
    if (text === "اهلا نوران") { appendMsg("assistant", "الوضع الخاص مفعّل ✨"); return; }
    appendMsg("assistant", "(رد تجريبي من نوران)");
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
    });
  });

  // ================== الإعدادات (حفظ محلي) ==================
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
    console.log("[Settings] saved");
  });

  $("#btnConnectDrive")?.addEventListener("click", () => toast("ربط Google Drive (تجريبي)"));
  $("#btnPickUpdate")?.addEventListener("click", () => $("#ghFiles").click());
  $("#btnUploadUpdate")?.addEventListener("click", () => toast("رفع التحديث (محاكاة) ✅"));
});
