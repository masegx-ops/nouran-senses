/* Nouran Senses - منطق التطبيق
 * - بث الكاميرا والميكروفون
 * - تسجيل الشاشة بالصوت
 * - رفع الملفات على Google Drive
 * - تحليل الصور والفيديوهات باستخدام OpenAI
 * - إشارات سرّية (كلمة: "اهلا نوران")
 * - شات الباب السحري
 */

const qs = sel => document.querySelector(sel);

const state = {
  unlocked: false,
  streams: { cam: null, mic: null, screen: null },
  mediaRecorder: null,
  chunks: [],
  openaiKey: localStorage.getItem('OPENAI_KEY') || '',
  googleClientId: localStorage.getItem('GOOGLE_CLIENT_ID') || '',
  driveFolderId: localStorage.getItem('DRIVE_FOLDER_ID') || '',
  googleToken: null
};

// توست إشعارات
function toast(msg, ok=true){
  const el = qs('#toast');
  el.textContent = msg;
  el.className = 'toast show';
  el.style.background = ok ? '#1b1b1b' : '#a0183a';
  setTimeout(()=> el.className='toast', 3500);
}

// تشغيل الكاميرا
qs('#startCam').addEventListener('click', async ()=>{
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true });
    state.streams.cam = stream;
    qs('#liveVideo').srcObject = stream;
    startMicLevel(stream);
    toast('تم تشغيل الكاميرا 🎥');
  }catch(err){ toast('فشل تشغيل الكاميرا: '+err.message, false); }
});
qs('#stopCam').addEventListener('click', ()=>{
  stopStream(state.streams.cam);
  qs('#liveVideo').srcObject = null;
  stopMicLevel();
  toast('تم إيقاف الكاميرا');
});

// لقطة
qs('#snap').addEventListener('click', ()=>{
  const canvas = qs('#previewCanvas');
  canvas.classList.remove('hidden');
  const ctx = canvas.getContext('2d');
  canvas.width = qs('#liveVideo').videoWidth;
  canvas.height = qs('#liveVideo').videoHeight;
  ctx.drawImage(qs('#liveVideo'), 0, 0);
  canvas.toBlob(blob=>{
    toast('تم أخذ لقطة 📸');
    if(qs('#autoUpload').checked) uploadToDrive(blob, 'snapshot.jpg', 'image/jpeg');
  }, 'image/jpeg', .9);
});

// تسجيل الشاشة
qs('#startScreen').addEventListener('click', async ()=>{
  try{
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
    state.streams.screen = screenStream;
    qs('#screenVideo').classList.remove('hidden');
    qs('#screenVideo').srcObject = screenStream;
    startRecording(screenStream);
    toast('بدأ تسجيل الشاشة 🖥️');
  }catch(err){ toast('تعذّر بدء تسجيل الشاشة: '+err.message, false); }
});
qs('#stopScreen').addEventListener('click', ()=>{
  stopRecording();
  stopStream(state.streams.screen);
  toast('تم إيقاف التسجيل');
});

// مؤشر الصوت
let audioCtx, analyser, rafId;
function startMicLevel(stream){
  audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  const src = audioCtx.createMediaStreamSource(stream);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 512;
  src.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  const loop = ()=>{
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((a,b)=>a+b,0)/data.length;
    const pct = Math.min(100, Math.round((avg/255)*100));
    qs('#micBar').style.width = pct+'%';
    rafId = requestAnimationFrame(loop);
  };
  loop();
}
function stopMicLevel(){
  if(rafId) cancelAnimationFrame(rafId);
  if(audioCtx){ audioCtx.close(); audioCtx=null; }
  qs('#micBar').style.width='0%';
}
function stopStream(stream){ if(stream){ stream.getTracks().forEach(t=>t.stop()); } }

// تسجيل الفيديو
function startRecording(stream){
  state.chunks=[];
  const rec = new MediaRecorder(stream);
  state.mediaRecorder = rec;
  rec.ondataavailable = e=>{ if(e.data.size>0) state.chunks.push(e.data); };
  rec.onstop = ()=>{
    const blob = new Blob(state.chunks, { type:'video/webm' });
    qs('#screenVideo').src = URL.createObjectURL(blob);
    toast('تم حفظ التسجيل');
    if(qs('#autoUpload').checked) uploadToDrive(blob, 'screen.webm','video/webm');
    state.chunks=[];
  };
  rec.start();
}
function stopRecording(){
  if(state.mediaRecorder && state.mediaRecorder.state!=='inactive'){ state.mediaRecorder.stop(); }
}

// رفع الملفات لـ Google Drive
async function uploadToDrive(blob, filename, mime){
  try{
    if(!state.googleToken){ toast('اربط Google Drive أولاً', false); return; }
    const metadata = { name: filename, mimeType: mime };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)],{type:'application/json'}));
    form.append('file', blob);
    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method:'POST',
      headers:{ 'Authorization':'Bearer '+state.googleToken },
      body: form
    });
    if(res.ok){ toast('تم الرفع لـ Google Drive ☁️'); }
    else{ throw new Error(await res.text()); }
  }catch(err){ toast('فشل الرفع: '+err.message, false); }
}

// الشات السحري
function appendChat(role,text){
  const box=document.createElement('div');
  box.className='msg '+role;
  box.innerHTML=`<span class="badge">${role==='user'?'أنت':'نوران'}</span> ${text}`;
  qs('#chatlog').appendChild(box);
  qs('#chatlog').scrollTop=qs('#chatlog').scrollHeight;
}
qs('#chatForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const text=qs('#chatInput').value.trim();
  if(!text) return;
  qs('#chatInput').value='';
  appendChat('user', text);
  if(text==='اهلا نوران'){ state.unlocked=true; appendChat('assistant','الوضع الخاص مفعّل ✨'); return; }
  appendChat('assistant','(رد تجريبي)'); // ممكن تربط هنا OpenAI API
});
