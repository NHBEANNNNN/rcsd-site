// assets/js/auth.js (fix: normalize email to lowercase when reading docs)
// Firebase v12.2.1 CDN 版本

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.appspot.com",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec470bee070f1023db80b",
  measurementId: "G-6DY309969K"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(console.error);

let __redirecting = false;

export function guardLogin(showForm) {
  onAuthStateChanged(auth, (user) => {
    if (__redirecting) return;
    if (user) {
      __redirecting = true;
      location.href = "profile.html";
    } else {
      showForm && showForm();
    }
  });
}

export function requireLogin(onReady) {
  onAuthStateChanged(auth, (user) => {
    if (__redirecting) return;
    if (!user) {
      __redirecting = true;
      location.href = "login.html";
      return;
    }
    onReady && onReady(user);
  });
}

// Helper: safe get text element
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val ?? "";
}

export async function readUserDoc(user) {
  try {
    // 🔧 关键修复：用小写邮箱作为文档ID（你库里是小写）
    const lower = (user.email || "").toLowerCase();
    let ref = doc(db, "user", lower);
    let snap = await getDoc(ref);

    // 兼容：如果没找到，再尝试原始大小写（以防库里是大写）
    if (!snap.exists() && lower !== user.email) {
      ref = doc(db, "user", user.email);
      snap = await getDoc(ref);
    }

    if (!snap.exists()) {
      console.warn("未找到用户档案文档: user/", lower);
      // 也把邮箱显示出来，便于你核对
      setText("email", user.email || "");
      return;
    }

    const data = snap.data() || {};

    setText("name", data.name);
    setText("id", data.badge);           // badge → id
    setText("callsign", data.callsign);
    setText("rank", data.division);      // division → rank
    setText("status", data.status);
    setText("phone", data.phone);
    setText("email", user.email);

    // 管理员链接
    try {
      const roleRefLower = doc(db, "roles", lower);
      let roleSnap = await getDoc(roleRefLower);
      if (!roleSnap.exists() && lower !== user.email) {
        roleSnap = await getDoc(doc(db, "roles", user.email));
      }
      const isAdmin = roleSnap.exists() && roleSnap.data().admin === true;
      const adminLink = document.getElementById("adminLink");
      if (adminLink) adminLink.style.display = isAdmin ? "inline" : "none";
    } catch (_) {}
  } catch (err) {
    console.error("读取用户资料失败:", err);
    const el = document.getElementById("email");
    if (el) el.textContent = (user && user.email) ? user.email : "";
  }
}

export async function doLogin(email, password) {
  await signInWithEmailAndPassword(auth, email, password);
}

export async function doLogout() {
  await signOut(auth);
  location.href = "login.html";
}
<script type="module">
  import { auth } from "./assets/js/auth.js";
  import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

  onAuthStateChanged(auth, (user) => {
    const link = document.getElementById("informantsLink");
    if (link) link.style.display = user ? "inline" : "none";
  });
</script>

