// ========== عناصر مساعدة ==========
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const state = {
  streams: { cam: null, screen: null },
  recorder: null, chunks: [],
  googleToken: null,
  openaiKey: localStorage.getItem("OPENAI_KEY") || "",
  googleClientId: localStorage.getItem("GOOGLE_CLIENT_ID") || "",
  driveFolderId: localStorage.getItem("DRIVE_FOLDER_ID") || "",
  ghToken: localStorage.getItem("GH_TOKEN") || "",
  ghRepo: localStorage.getItem("GH_REPO") || "",
  ghBranch: localStorage.getItem("GH_BRANCH") || "main",
  locked: false
};

function toast(msg, ok=true){
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast show";
  t.style.background = ok ? "#1b1b1b" : "#a0183a";
  setTimeout(()=>t.className="toast", 2500);
}

// ========== الكاميرا ==========
$("#startCam")?.addEventListener("click", async ()=>{
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
    state.streams.cam = stream;
    $("#liveVideo").srcObject = stream;
    startMicLevel(stream);
    toast("الكاميرا اشتغلت 🎥");
  } catch(e){ toast("فشل تشغيل الكاميرا: "+e.message, false); }
});
$("#stopCam")?.addEventListener("click", ()=>{
  stopStream(state.streams.cam);
  $("#liveVideo").srcObject = null;
  stopMicLevel();
  toast("تم إيقاف الكاميرا");
});
$("#snap")?.addEventListener("click", ()=>{
  const v=$("#liveVideo");
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
$("#startScreen")?.addEventListener("click", async ()=>{
  try{
    const stream=await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
    state.streams.screen=stream;
    startRecording(stream);
    toast("بدأ تسجيل الشاشة 🖥️");
  }catch(e){ toast("فشل: "+e.message, false); }
});
$("#stopScreen")?.addEventListener("click", ()=>{
  stopRecording();
  stopStream(state.streams.screen);
});

function startRecording(stream){
  state.chunks=[];
  const rec=new MediaRecorder(stream);
  state.recorder=rec;
  rec.ondataavailable=e=>{ if(e.data.size>0) state.chunks.push(e.data); };
  rec.onstop=()=>{
    const blob=new Blob(state.chunks,{type:"video/webm"});
    const url=URL.createObjectURL(blob);
    const v=$("#screenVideo");
    v.src=url; v.classList.remove("hidden");
    toast("معاينة التسجيل جاهزة 🎬");
    state.chunks=[];
  };
  rec.start();
}
function stopRecording(){
  if(state.recorder && state.recorder.state!=="inactive") state.recorder.stop();
}
function stopStream(s){ if(s) s.getTracks().forEach(t=>t.stop()); }

// ========== الصوت ==========
let audioCtx, analyser, raf;
function startMicLevel(stream){
  audioCtx=new (window.AudioContext||window.webkitAudioContext)();
  const src=audioCtx.createMediaStreamSource(stream);
  analyser=audioCtx.createAnalyser(); analyser.fftSize=512;
  src.connect(analyser);
  const data=new Uint8Array(analyser.frequencyBinCount);
  const loop=()=>{
    analyser.getByteFrequencyData(data);
    const avg=data.reduce((a,b)=>a+b,0)/data.length;
    const pct=Math.min(100, Math.round((avg/255)*100));
    $("#micBar").style.width=pct+"%";
    $("#micBarBig").style.width=pct+"%";
    raf=requestAnimationFrame(loop);
  };
  loop();
}
function stopMicLevel(){ if(raf) cancelAnimationFrame(raf); if(audioCtx) audioCtx.close(); }

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

// ========== Dock Panels ==========
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
$$("[data-minimize]")?.forEach(ch=>{
  ch.addEventListener("click",()=>{
    const sel=ch.dataset.minimize;
    $(sel).classList.remove("active");
    const mini=document.createElement("button");
    mini.textContent=$(sel).querySelector("h2").textContent;
    mini.className="chip";
    mini.onclick=()=>{ $(sel).classList.add("active"); mini.remove(); };
    $("#miniBar").appendChild(mini);
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
  toast("تم حفظ الإعدادات");
});
$("#btnConnectDrive")?.addEventListener("click",()=>toast("تم الربط التجريبي مع Google Drive"));
$("#btnPickUpdate")?.addEventListener("click",()=>$("#ghFiles").click());
$("#btnUploadUpdate")?.addEventListener("click",()=>{
  toast("رفع التحديث (محاكاة) ✅");
});

// ========== قفل الشاشة ==========
if(localStorage.getItem("LOCK_ENABLED")==="true"){
  $("#lockOverlay").classList.remove("hidden");
  $("#lockEnter").onclick=()=>{
    const u=$("#lockUser").value, p=$("#lockPass").value;
    if(u===localStorage.getItem("LOCK_USER") && p===localStorage.getItem("LOCK_PASS")){
      $("#lockOverlay").classList.add("hidden");
    }else toast("بيانات غير صحيحة",false);
  };
}
$("#lockEnabled")?.addEventListener("change",e=>{
  localStorage.setItem("LOCK_ENABLED",e.target.checked);
});
$("#lockCfgUser")?.addEventListener("input",e=>localStorage.setItem("LOCK_USER",e.target.value));
$("#lockCfgPass")?.addEventListener("input",e=>localStorage.setItem("LOCK_PASS",e.target.value));
