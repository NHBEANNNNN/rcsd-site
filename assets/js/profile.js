import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAFHaPnQFnDX6akaGdnxKteU-vlYfPpBeM",
  authDomain: "lspd-undercover.firebaseapp.com",
  projectId: "lspd-undercover",
  storageBucket: "lspd-undercover.firebasestorage.app",
  messagingSenderId: "773732274642",
  appId: "1:773732274642:web:2ec2470be0f8123db80b",
  measurementId: "G-6DY309969K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = (s)=>document.querySelector(s);
const show=(el)=>el&&el.classList.remove('hidden');
const hide=(el)=>el&&el.classList.add('hidden');

let currentEmail = null;
let currentRole = 'officer';

async function fetchRole(email){
  const ref = doc(db, 'roles', String(email).toLowerCase());
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data().role || 'officer';
  return 'officer';
}

async function fetchProfile(email){
  const ref = doc(db, 'users', String(email).toLowerCase());
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : {};
}

async function saveProfile(email, data){
  const ref = doc(db, 'users', String(email).toLowerCase());
  await setDoc(ref, data, { merge: true });
}

async function reloadMyProfile(){
  if (!currentEmail) return;
  $('#currentEmail').textContent = '当前账号：' + currentEmail;
  const data = await fetchProfile(currentEmail);
  $('#p_name').value = data.name || '';
  $('#p_callsign').value = data.callsign || '';
  $('#p_division').value = data.division || '';
  $('#p_phone').value = data.phone || '';
}

async function saveMyProfile(){
  const data = {
    name: $('#p_name').value.trim(),
    callsign: $('#p_callsign').value.trim(),
    division: $('#p_division').value.trim(),
    phone: $('#p_phone').value.trim(),
    updatedAt: Date.now()
  };
  await saveProfile(currentEmail, data);
  $('#mySaveTip').textContent = '已保存。';
}

async function loadUser(){
  const email = $('#a_email').value.trim().toLowerCase();
  if (!email) return $('#adminTip').textContent = '请输入目标邮箱';
  const data = await fetchProfile(email);
  $('#a_name').value = data.name || '';
  $('#a_callsign').value = data.callsign || '';
  $('#a_division').value = data.division || '';
  $('#a_phone').value = data.phone || '';
  $('#adminTip').textContent = '已加载：' + email;
}

async function saveUser(){
  const email = $('#a_email').value.trim().toLowerCase();
  if (!email) return $('#adminTip').textContent = '请输入目标邮箱';
  const data = {
    name: $('#a_name').value.trim(),
    callsign: $('#a_callsign').value.trim(),
    division: $('#a_division').value.trim(),
    phone: $('#a_phone').value.trim(),
    updatedAt: Date.now()
  };
  await saveProfile(email, data);
  $('#adminTip').textContent = '已保存：' + email;
}

window.reloadMyProfile = reloadMyProfile;
window.saveMyProfile = saveMyProfile;
window.loadUser = loadUser;
window.saveUser = saveUser;

onAuthStateChanged(auth, async (user)=>{
  if (!user) return;
  currentEmail = user.email.toLowerCase();
  currentRole = await fetchRole(currentEmail);
  await reloadMyProfile();
  if (currentRole === 'admin') show($('#adminBox'));
  else hide($('#adminBox'));
});