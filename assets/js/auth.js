// auth.js - simple Firebase Auth & role gating
// Replace firebaseConfig with your own from Firebase Console

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  getFirestore, doc, getDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db   = getFirestore(app);
const provider = new GoogleAuthProvider();

// buttons optional
const loginBtn  = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authState = document.getElementById('authState');

loginBtn?.addEventListener('click', async ()=>{ await signInWithPopup(auth, provider); });
logoutBtn?.addEventListener('click', async ()=>{ await signOut(auth); });

async function getRolesByEmail(email){
  if(!email) return {};
  const ref  = doc(db, "roles", email);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data() || {}) : {};
}

onAuthStateChanged(auth, async (user)=>{
  if(authState) authState.textContent = user ? `已登录：${user.displayName || user.email}` : "未登录";
  if(loginBtn)  loginBtn.style.display  = user ? "none" : "inline-flex";
  if(logoutBtn) logoutBtn.style.display = user ? "inline-flex" : "none";

  const gatedEls = document.querySelectorAll('.gated');
  if(!user){
    gatedEls.forEach(el=>el.classList.add('hidden'));
    return;
  }
  const roles = await getRolesByEmail(user.email || "");
  gatedEls.forEach(el=>{
    const need = (el.dataset.role||"").split(',').map(s=>s.trim()).filter(Boolean);
    let ok = false;
    if(need.length) ok = need.some(r=>roles[r]);
    if(!need.length) ok = true;
    el.classList.toggle('hidden', !ok);
  });
});

export function requireRole(role){
  return new Promise((resolve)=>{
    const stop = onAuthStateChanged(auth, async (user)=>{
      if(!user){ stop(); location.replace('index.html'); return; }
      const roles = await getRolesByEmail(user.email || "");
      if(roles[role] === true){ stop(); resolve(user); }
      else { stop(); location.replace('index.html'); }
    });
  });
}
