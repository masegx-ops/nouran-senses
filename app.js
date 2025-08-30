// ========== عناصر مساعدة ==========
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function toast(msg, ok=true){
  const t = $("#toast");
  if(!t) return;
  t.textContent = msg;
  t.className = "toast show";
  t.style.background = ok ? "#1b1b1b" : "#a0183a";
  setTimeout(()=>t.className="toast", 2500);
}

// ========== الكاميرا ==========
$("#startCam")?.addEventListener("click", async ()=>{
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
    $("#liveVideo").srcObject = stream;
    toast("الكاميرا اشتغلت 🎥");
  } catch(e){ toast("فشل تشغيل الكاميرا", false); }
});
$("#stopCam")?.addEventListener("click", ()=>{
  if($("#liveVideo").srcObject){
    $("#liveVideo").srcObject.getTracks().forEach(t=>t.stop());
    $("#liveVideo").srcObject = null;
    toast("تم إيقاف الكاميرا");
  }
});
$("#snap")?.addEventListener("click", ()=>{
  const v=$("#liveVideo");
  if(!v.videoWidth){ toast("شغّل الكاميرا الأول",false); return; }
  const c=$("#previewCanvas");
  const ctx=c.getContext("2d");
  c.width=v.videoWidth; c.height=v.videoHeight;
  ctx.drawImage(v,0,0);
  c.toBlob(b=>{
    const url=URL.createObjectURL(b);
    const img=document.createElement("img");
    img.src=url; img.className="thumb";
    $("#shotsTray").appendChild(img);
    toast("لقطة محفوظة 📸");
  },"image/jpeg",0.9);
});

// ========== تسجيل الشاشة ==========
let rec, chunks=[];
$("#startScreen")?.addEventListener("click", async ()=>{
  try{
    const stream=await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
    rec=new MediaRecorder(stream);
    chunks=[];
    rec.ondataavailable=e=>{ if(e.data.size>0) chunks.push(e.data); };
    rec.onstop=()=>{
      const blob=new Blob(chunks,{type:"video/webm"});
      const url=URL.createObjectURL(blob);
      const v=$("#screenVideo");
      v.src=url; v.classList.remove("hidden");
      toast("معاينة التسجيل جاهزة 🎬");
    };
    rec.start();
    toast("بدأ تسجيل الشاشة 🖥️");
  }catch(e){ toast("فشل: "+e.message,false); }
});
$("#stopScreen")?.addEventListener("click", ()=>{
  if(rec && rec.state!=="inactive") rec.stop();
});

// ========== الباب السحري ==========
function appendMsg(role,text){
  const box=document.createElement("div");
  box.className="msg "+role;
  box.textContent=(role==="user"?"أنت: ":"نوران: ")+text;
  $("#chatlog").appendChild(box);
  $("#chatlog").scrollTop=$("#chatlog").scrollHeight;
}
$("#chatForm")?.addEventListener("submit",e=>{
  e.preventDefault();
  const text=$("#chatInput").value.trim();
  if(!text) return;
  $("#chatInput").value="";
  appendMsg("user",text);
  if(text==="اهلا نوران"){ appendMsg("assistant","الوضع الخاص مفعّل ✨"); return; }
  appendMsg("assistant","(رد تجريبي من نوران)");
});

// ========== Dock ==========
$$(".dock-btn").forEach(btn=>{
  btn.addEventListener("click",()=>{
    $$(".dock-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const target=btn.dataset.target;
    if(target){
      $$(".panel").forEach(p=>p.classList.remove("active"));
      $(target).classList.add("active");
    }
    if(btn.id==="btnSettings") $("#settingsDialog").showModal();
  });
});

// ========== الإعدادات ==========
$("#saveSettings")?.addEventListener("click",()=>{
  localStorage.setItem("OPENAI_KEY",$("#openaiKey").value);
  localStorage.setItem("GOOGLE_CLIENT_ID",$("#googleClientId").value);
  localStorage.setItem("DRIVE_FOLDER_ID",$("#driveFolderId").value);
  localStorage.setItem("GH_TOKEN",$("#ghToken").value);
  localStorage.setItem("GH_REPO",$("#ghRepo").value);
  localStorage.setItem("GH_BRANCH",$("#ghBranch").value);
  localStorage.setItem("LOCK_ENABLED", $("#lockEnabled").checked);
  localStorage.setItem("LOCK_USER", $("#lockCfgUser").value);
  localStorage.setItem("LOCK_PASS", $("#lockCfgPass").value);
  toast("تم حفظ الإعدادات ✅");
});
$("#btnConnectDrive")?.addEventListener("click",()=>toast("ربط Google Drive (تجريبي)"));
$("#btnPickUpdate")?.addEventListener("click",()=>$("#ghFiles").click());
$("#btnUploadUpdate")?.addEventListener("click",()=>toast("رفع التحديث (محاكاة) ✅"));

// ========== قفل الشاشة ==========
if(localStorage.getItem("LOCK_ENABLED")==="true"){
  $("#lockOverlay").classList.remove("hidden");
  $("#lockEnter").onclick=()=>{
    const u=$("#lockUser").value, p=$("#lockPass").value;
    const savedU = localStorage.getItem("LOCK_USER");
    const savedP = localStorage.getItem("LOCK_PASS");

    // لو مفيش بيانات متسجلة
    if(!savedU || !savedP){
      toast("⚠️ من فضلك احفظ اسم مستخدم وكلمة مرور من الإعدادات أولاً", false);
      $("#lockOverlay").classList.add("hidden");
      return;
    }

    // لو البيانات صح
    if(u===savedU && p===savedP){
      $("#lockOverlay").classList.add("hidden");
      toast("✅ تم تسجيل الدخول");
    }else{
      toast("❌ بيانات غير صحيحة", false);
    }
  };
} else {
  // لو القفل مش متفعّل أصلاً
  $("#lockOverlay")?.classList.add("hidden");
}
