// assets/js/auth.js
// Firebase v10 模块化示例

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// TODO: 替换为你的实际配置
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

export function requireLogin(onReady){
  onAuthStateChanged(auth, (user)=>{
    if(!user){
      location.href = "login.html";
      return;
    }
    onReady && onReady(user);
  });
}

export async function readUserDoc(user){
  try{
    const ref = doc(db, "user", user.email);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : {};

    const mapping = {
      name: data.name || "",
      id: data.badge || "",
      callsign: data.callsign || "",
      rank: data.division || "",
      status: data.status || "",
      phone: data.phone || "",
      email: user.email || ""
    };

    for(const [k,v] of Object.entries(mapping)){
      const el = document.getElementById(k);
      if(el) el.innerText = v;
    }

    try{
      const roleSnap = await getDoc(doc(db, "roles", user.email));
      const isAdmin = roleSnap.exists() && roleSnap.data().admin === true;
      const adminLink = document.getElementById("adminLink");
      if(adminLink) adminLink.style.display = isAdmin ? "inline" : "none";
    }catch(_){ }
  }catch(err){
    console.error("读取用户资料失败:", err);
  }
}

export async function doLogout(){
  await signOut(auth);
  location.href = "login.html";
}
