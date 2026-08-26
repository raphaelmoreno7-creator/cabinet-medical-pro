const USERS=[
{id:"raphael",name:"Raphaël",role:"Médecin",password:"2012"},
{id:"jade",name:"Jade",role:"Médecin",password:"2017"},
{id:"victoria",name:"Victoria",role:"Médecin",password:"2017"}
];
const KEY="cabinetMedicalProV3",SESSION="cabinetMedicalProSessionV3";
const today=()=>new Date().toISOString().slice(0,10);
const uid=()=>crypto.randomUUID();
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const fmt=d=>d?new Date(d+"T12:00").toLocaleDateString("fr-FR"):"—";
const monthNames=["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
const FOOD_DB=[
['Eau','Boissons'],['Lait','Produits laitiers'],['Yaourt nature','Produits laitiers'],['Fromage','Produits laitiers'],['Pain','Céréales'],['Céréales petit-déjeuner','Céréales'],['Flocons d’avoine','Céréales'],['Riz','Céréales'],['Pâtes','Céréales'],['Semoule','Céréales'],['Pommes de terre','Céréales'],['Quinoa','Céréales'],['Poulet','Viandes/œufs/légumineuses'],['Bœuf','Viandes/œufs/légumineuses'],['Jambon','Viandes/œufs/légumineuses'],['Poisson','Viandes/œufs/légumineuses'],['Thon','Viandes/œufs/légumineuses'],['Œuf','Viandes/œufs/légumineuses'],['Lentilles','Viandes/œufs/légumineuses'],['Pois chiches','Viandes/œufs/légumineuses'],['Haricots','Viandes/œufs/légumineuses'],['Carotte','Légumes'],['Tomate','Légumes'],['Salade verte','Légumes'],['Courgette','Légumes'],['Brocoli','Légumes'],['Haricots verts','Légumes'],['Concombre','Légumes'],['Poivron','Légumes'],['Épinards','Légumes'],['Pomme','Fruits'],['Banane','Fruits'],['Orange','Fruits'],['Clémentine','Fruits'],['Fraise','Fruits'],['Raisin','Fruits'],['Poire','Fruits'],['Pêche','Fruits'],['Abricot','Fruits'],['Compote','Fruits'],['Huile d’olive','Matières grasses'],['Beurre','Matières grasses'],['Mayonnaise','Matières grasses'],['Noix','Matières grasses'],['Amandes','Matières grasses'],['Chocolat','Produits sucrés'],['Biscuits','Produits sucrés'],['Gâteau','Produits sucrés'],['Glace','Produits sucrés'],['Bonbons','Produits sucrés'],['Confiture','Produits sucrés'],['Soda','Produits sucrés'],['Jus de fruits','Boissons'],['Café','Boissons'],['Thé','Boissons'],['Pizza','Plats composés'],['Burger','Plats composés'],['Sandwich','Plats composés'],['Lasagnes','Plats composés'],['Soupe de légumes','Légumes'],['Salade composée','Plats composés'],['Tartine','Céréales']
];
const MEALS=[['breakfast','☀️ Petit-déjeuner'],['lunch','🍴 Déjeuner'],['snack','🍎 Goûter'],['dinner','🌙 Dîner'],['extras','🍪 Grignotage']];
let foodDraft={};
function emptyFoodPlan(){return {breakfast:[],lunch:[],snack:[],dinner:[],extras:[]}}
function foodPlanLabel(plan){return plan&&Object.values(plan).some(a=>a?.length)?'Bilan alimentaire créé':'Aucun bilan alimentaire'}
function foodCounts(plan){let counts={};(plan?Object.values(plan):[]).flat().forEach(x=>{counts[x.cat]=(counts[x.cat]||0)+Number(x.qty||1)});return counts}
const demo={
patients:[
{id:"p1",first:"Lucas",last:"Martin",birth:"2012-04-12",phone:"06 00 00 00 00",blood:"O+",allergies:"Aucune connue",history:"Aucun antécédent fictif",vaccines:"À jour (simulation)",treatments:"Aucun",notes:"Patient de démonstration."},
{id:"p2",first:"Emma",last:"Bernard",birth:"2011-09-03",phone:"06 11 11 11 11",blood:"A+",allergies:"Pollen",history:"Asthme fictif",vaccines:"À vérifier (simulation)",treatments:"Aucun",notes:"Dossier de démonstration."}
],
appointments:[
{id:"a1",date:today(),time:"09:00",patient:"Lucas Martin",reason:"Consultation de suivi",doctor:"Raphaël",status:"Prévu"},
{id:"a2",date:today(),time:"10:00",patient:"Emma Bernard",reason:"Contrôle",doctor:"Jade",status:"En attente"}
],
consultations:[],
prescriptions:[],
exams:[],
documents:[]
};
let data=JSON.parse(localStorage.getItem(KEY)||"null")||demo;
let currentUser=null,page="dashboard",calendarDate=new Date();

function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function toast(t){let x=document.createElement("div");x.className="toast";x.textContent=t;document.body.append(x);setTimeout(()=>x.remove(),2200)}
function loginScreen(){
document.getElementById("app").innerHTML=`<div class="login"><div class="login-card"><div class="logo">✚</div><h1>Cabinet Médical Pro</h1><p class="sub">Version 3 — simulation de cabinet médical.</p><div class="notice">🔐 Connexion par utilisateur. Toutes les données de ce site sont fictives et restent dans ce navigateur.</div><b>Choisissez le médecin</b><div class="users">${USERS.map(u=>`<button class="user-btn" onclick="passwordModal('${u.id}')"><div class="avatar">${u.name[0]}</div><div><b>${u.name}</b><div class="sub">${u.role}</div></div></button>`).join("")}</div></div></div>`
}
function passwordModal(id){
let u=USERS.find(x=>x.id===id);
modal("Connexion — "+u.name,`<form onsubmit="doLogin(event,'${id}')"><div class="field"><label>Mot de passe</label><input id="loginPassword" type="password" inputmode="numeric" autocomplete="off" required autofocus placeholder="Mot de passe"></div><div id="loginError"></div><div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Annuler</button><button class="btn">Se connecter</button></div></form>`);
setTimeout(()=>document.getElementById("loginPassword")?.focus(),50)
}
function doLogin(e,id){
e.preventDefault();
let u=USERS.find(x=>x.id===id),p=document.getElementById("loginPassword").value;
if(p!==u.password){document.getElementById("loginError").innerHTML='<div class="error">Mot de passe incorrect.</div>';return}
localStorage.setItem(SESSION,id);closeModal();page="dashboard";render();toast("Connexion réussie")
}
function logout(){localStorage.removeItem(SESSION);render()}
function render(){
currentUser=USERS.find(u=>u.id===localStorage.getItem(SESSION));
if(!currentUser)return loginScreen();
document.getElementById("app").innerHTML=`<div class="shell"><aside class="sidebar"><div class="brand">✚ <span>Cabinet Médical Pro</span><small>V3 • SIMULATION FICTIVE</small></div><nav class="nav">
${nav("dashboard","⌂","Tableau de bord")}${nav("patients","👥","Patients")}${nav("appointments","▣","Rendez-vous")}${nav("calendar","📅","Calendrier")}${nav("waiting","⏱","Salle d’attente")}${nav("consultations","🩺","Consultations")}${nav("prescriptions","💊","Ordonnances")}${nav("exams","🧪","Examens")}${nav("documents","📎","Documents")}${nav("stats","📊","Statistiques")}${nav("admin","⚙️","Administration")}
</nav><button class="logout" onclick="logout()">↪ <span>Déconnexion</span></button></aside>
<main class="main"><header class="topbar"><div><h1>${titles[page]||"Cabinet"}</h1><div class="sub">Mode simulation médicale • données fictives</div></div><div class="profile"><div class="avatar">${currentUser.name[0]}</div><div><b>${esc(currentUser.name)}</b><div class="sub">${currentUser.role}</div></div></div></header><div id="content"></div></main></div>`;
pageRender()
}
const titles={dashboard:"Tableau de bord",patients:"Patients",appointments:"Rendez-vous",calendar:"Calendrier",waiting:"Salle d’attente",consultations:"Consultations",prescriptions:"Ordonnances",exams:"Examens",documents:"Documents",stats:"Statistiques",admin:"Administration"};
function nav(id,i,l){return `<button class="${page===id?"active":""}" onclick="go('${id}')">${i} <span>${l}</span></button>`}
function go(p){page=p;render()}
function pageRender(){
let c=document.getElementById("content");
c.innerHTML=page==="dashboard"?dashboard():page==="patients"?patients():page==="appointments"?appointments():page==="calendar"?calendar():page==="waiting"?waiting():page==="consultations"?consultations():page==="prescriptions"?prescriptions():page==="exams"?exams():page==="documents"?documents():page==="stats"?stats():admin()
}
function dashboard(){
let ap=data.appointments.filter(a=>a.date===today()),mine=ap.filter(a=>a.doctor===currentUser.name),waiting=ap.filter(a=>["Arrivé","En attente","En consultation"].includes(a.status));
return `<div class="grid">
<div class="card"><div class="stat-label">Patients</div><div class="stat-value">${data.patients.length}</div></div>
<div class="card"><div class="stat-label">Rendez-vous aujourd’hui</div><div class="stat-value">${ap.length}</div></div>
<div class="card"><div class="stat-label">Consultations</div><div class="stat-value">${data.consultations.length}</div></div>
<div class="card"><div class="stat-label">Salle d’attente</div><div class="stat-value">${waiting.length}</div></div>
</div>
<div class="section"><div class="section-head"><h2>Agenda du jour</h2><button class="btn" onclick="go('appointments')">Gérer l’agenda</button></div><div class="card table-wrap">${ap.length?apptTable(ap):'<div class="empty">Aucun rendez-vous aujourd’hui.</div>'}</div></div>
<div class="section"><div class="grid grid3">
<div class="card"><h3>Nouveau patient</h3><p class="sub">Créer un dossier fictif.</p><button class="btn" onclick="patientModal()">Créer</button></div>
<div class="card"><h3>Nouvelle consultation</h3><p class="sub">Ouvrir une consultation complète.</p><button class="btn" onclick="consultModal()">Ouvrir</button></div>
<div class="card"><h3>Ordonnance</h3><p class="sub">Créer une prescription fictive.</p><button class="btn" onclick="prescriptionModal()">Créer</button></div>
</div></div>`
}
function patients(){
return `<div class="section-head"><p class="sub">Dossiers médicaux fictifs.</p><div class="actions"><input id="search" class="search" placeholder="Rechercher..." oninput="filterPatients()"><button class="btn" onclick="patientModal()">+ Nouveau patient</button></div></div>
<div class="card table-wrap"><table class="table"><thead><tr><th>Patient</th><th>Naissance</th><th>Téléphone</th><th>Allergies</th><th></th></tr></thead><tbody id="rows">${patientRows(data.patients)}</tbody></table></div>`
}
function patientRows(a){return a.length?a.map(p=>`<tr><td><b>${esc(p.first)} ${esc(p.last)}</b></td><td>${fmt(p.birth)}</td><td>${esc(p.phone||"—")}</td><td>${esc(p.allergies||"—")}</td><td><button class="btn secondary" onclick="openPatient('${p.id}')">Dossier</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Aucun patient.</td></tr>`}
function filterPatients(){let q=document.getElementById("search").value.toLowerCase();document.getElementById("rows").innerHTML=patientRows(data.patients.filter(p=>(p.first+" "+p.last).toLowerCase().includes(q)))}
function appointments(){return `<div class="section-head"><p class="sub">Créer, modifier, supprimer et gérer les statuts.</p><button class="btn" onclick="apptModal()">+ Nouveau rendez-vous</button></div><div class="card table-wrap">${apptTable(data.appointments,true)}</div>`}
function apptTable(a,actions=false){
return `<table class="table"><thead><tr><th>Date</th><th>Heure</th><th>Patient</th><th>Motif</th><th>Médecin</th><th>Statut</th>${actions?"<th>Actions</th>":""}</tr></thead><tbody>
${[...a].sort((x,y)=>(x.date+x.time).localeCompare(y.date+y.time)).map(x=>`<tr><td>${fmt(x.date)}</td><td><b>${esc(x.time)}</b></td><td>${esc(x.patient)}</td><td>${esc(x.reason)}</td><td>${esc(x.doctor)}</td><td>${statusBadge(x.status)}</td>${actions?`<td><button class="btn secondary" onclick="editAppt('${x.id}')">Modifier</button> <button class="btn danger" onclick="deleteAppt('${x.id}')">Supprimer</button></td>`:""}</tr>`).join("")}</tbody></table>`
}
function statusBadge(s){return `<span class="badge ${s==="En attente"?"warning-b":s==="Terminé"?"success-b":s==="Annulé"?"danger-b":s==="En consultation"?"blue-b":""}">${esc(s||"Prévu")}</span>`}
function calendar(){
let y=calendarDate.getFullYear(),m=calendarDate.getMonth(),first=new Date(y,m,1),last=new Date(y,m+1,0),start=(first.getDay()+6)%7;
let cells=[];for(let i=0;i<start;i++)cells.push(`<div class="day"></div>`);
for(let d=1;d<=last.getDate();d++){let date=`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`,events=data.appointments.filter(a=>a.date===date);cells.push(`<div class="day"><strong>${d}</strong>${events.map(e=>`<div class="event">${esc(e.time)} • ${esc(e.patient)}</div>`).join("")}</div>`)}
return `<div class="section-head"><div class="actions"><button class="btn secondary" onclick="changeMonth(-1)">‹</button><button class="btn secondary" onclick="calendarDate=new Date();render()">Aujourd’hui</button><button class="btn secondary" onclick="changeMonth(1)">›</button></div><h2>${monthNames[m]} ${y}</h2><button class="btn" onclick="apptModal()">+ Rendez-vous</button></div><div class="calendar">${["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"].map(x=>`<div class="day" style="min-height:auto;background:#eef3f9"><strong>${x}</strong></div>`).join("")}${cells.join("")}</div>`
}
function changeMonth(n){calendarDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth()+n,1);render()}
function waiting(){
let a=data.appointments.filter(x=>x.date===today()&&x.status!=="Annulé");
return `<div class="section-head"><p class="sub">Patients arrivés au cabinet.</p></div><div class="card table-wrap"><table class="table"><thead><tr><th>Heure</th><th>Patient</th><th>Motif</th><th>Statut</th><th>Actions</th></tr></thead><tbody>${a.length?a.map(x=>`<tr><td>${esc(x.time)}</td><td><b>${esc(x.patient)}</b></td><td>${esc(x.reason)}</td><td>${statusBadge(x.status)}</td><td><button class="btn secondary" onclick="setStatus('${x.id}','Arrivé')">Arrivé</button> <button class="btn" onclick="setStatus('${x.id}','En consultation');consultModalByName('${esc(x.patient)}')">Commencer</button> <button class="btn secondary" onclick="setStatus('${x.id}','Terminé')">Terminer</button></td></tr>`).join(""):`<tr><td colspan="5" class="empty">Aucun patient dans la salle d’attente.</td></tr>`}</tbody></table></div>`
}
function setStatus(id,s){let a=data.appointments.find(x=>x.id===id);if(a){a.status=s;save();render();toast("Statut mis à jour")}}
function consultations(){
return `<div class="section-head"><p class="sub">Historique des consultations fictives.</p><button class="btn" onclick="consultModal()">+ Nouvelle consultation</button></div><div class="card table-wrap">${data.consultations.length?`<table class="table"><thead><tr><th>Date</th><th>Patient</th><th>Motif</th><th>Constantes</th><th>Médecin</th><th>Actions</th></tr></thead><tbody>${data.consultations.map(c=>`<tr><td>${fmt(c.date)}</td><td><b>${esc(c.patient)}</b></td><td>${esc(c.reason)}</td><td>${esc(c.temp||"—")} °C • ${esc(c.pulse||"—")} bpm</td><td>${esc(c.doctor)}</td><td class="actions"><button class="btn secondary" onclick="viewConsult('${c.id}')">Afficher</button><button class="btn secondary" onclick="editConsult('${c.id}')">Modifier</button><button class="btn danger" onclick="deleteConsult('${c.id}')">Supprimer</button><button class="btn" onclick="downloadConsult('${c.id}')">Télécharger</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Aucune consultation.</div>'}</div>`
}
function prescriptions(){
return `<div class="section-head"><p class="sub">Ordonnances entièrement fictives.</p><button class="btn" onclick="prescriptionModal()">+ Nouvelle ordonnance</button></div><div class="card table-wrap">${data.prescriptions.length?`<table class="table"><thead><tr><th>Date</th><th>Patient</th><th>Prescription</th><th>Médecin</th><th>Actions</th></tr></thead><tbody>${data.prescriptions.map(p=>`<tr><td>${fmt(p.date)}</td><td><b>${esc(p.patient)}</b></td><td>${esc(p.content).slice(0,100)}</td><td>${esc(p.doctor)}</td><td><button class="btn secondary" onclick="printPrescription('${p.id}')">Imprimer</button> <button class="btn danger" onclick="deletePrescription('${p.id}')">Supprimer</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Aucune ordonnance.</div>'}</div>`
}
function exams(){
return `<div class="section-head"><p class="sub">Examens et analyses fictifs.</p><button class="btn" onclick="examModal()">+ Ajouter un examen</button></div><div class="card table-wrap">${data.exams.length?`<table class="table"><thead><tr><th>Date</th><th>Patient</th><th>Type</th><th>Résultat</th><th>Médecin</th><th>Actions</th></tr></thead><tbody>${data.exams.map(x=>`<tr><td>${fmt(x.date)}</td><td>${esc(x.patient)}</td><td>${esc(x.type)}</td><td>${esc(x.result)}</td><td>${esc(x.doctor)}</td><td><button class="btn danger" onclick="deleteExam('${x.id}')">Supprimer</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Aucun examen.</div>'}</div>`
}
function documents(){
return `<div class="section-head"><p class="sub">Documents fictifs du cabinet.</p><button class="btn" onclick="documentModal()">+ Ajouter un document</button></div><div class="card table-wrap">${data.documents.length?`<table class="table"><thead><tr><th>Date</th><th>Patient</th><th>Document</th><th>Catégorie</th><th>Actions</th></tr></thead><tbody>${data.documents.map(d=>`<tr><td>${fmt(d.date)}</td><td>${esc(d.patient)}</td><td>${esc(d.name)}</td><td>${esc(d.category)}</td><td><button class="btn danger" onclick="deleteDocument('${d.id}')">Supprimer</button></td></tr>`).join("")}</tbody></table>`:'<div class="empty">Aucun document.</div>'}</div>`
}
function stats(){
let total=data.appointments.length,done=data.appointments.filter(a=>a.status==="Terminé").length,cancel=data.appointments.filter(a=>a.status==="Annulé").length;
return `<div class="grid"><div class="card"><div class="stat-label">Patients</div><div class="stat-value">${data.patients.length}</div></div><div class="card"><div class="stat-label">Rendez-vous</div><div class="stat-value">${total}</div></div><div class="card"><div class="stat-label">Terminés</div><div class="stat-value">${done}</div></div><div class="card"><div class="stat-label">Annulés</div><div class="stat-value">${cancel}</div></div></div><div class="section"><div class="grid grid2"><div class="card"><h3>Activité du cabinet</h3><p>Consultations : <b>${data.consultations.length}</b></p><p>Ordonnances : <b>${data.prescriptions.length}</b></p><p>Examens : <b>${data.exams.length}</b></p><p>Documents : <b>${data.documents.length}</b></p></div><div class="card"><h3>Répartition des médecins</h3>${USERS.map(u=>`<p><b>${u.name}</b> — ${data.appointments.filter(a=>a.doctor===u.name).length} rendez-vous</p>`).join("")}</div></div></div>`
}
function admin(){
return `<div class="grid grid3"><div class="card"><h3>👨‍⚕️ Utilisateurs</h3>${USERS.map(u=>`<p><b>${u.name}</b><br><span class="sub">${u.role}</span></p>`).join("")}</div><div class="card"><h3>💾 Données locales</h3><p class="sub">Les données sont conservées uniquement dans ce navigateur.</p><button class="btn danger" onclick="resetData()">Réinitialiser les données fictives</button></div><div class="card"><h3>🔐 Sécurité</h3><p class="sub">Connexion par mot de passe pour le jeu. Ce système côté navigateur n'est pas une sécurité professionnelle.</p></div></div>`
}
function modal(title,body){document.body.insertAdjacentHTML("beforeend",`<div class="modal-bg" id="modal"><div class="modal"><div class="modal-head"><h2>${title}</h2><button class="close" onclick="closeModal()">×</button></div>${body}</div></div>`)}
function closeModal(){document.getElementById("modal")?.remove()}

function patientModal(existing=null){
let p=existing||{};
modal(existing?"Modifier le dossier patient":"Nouveau patient",`<form onsubmit="savePatient(event,'${p.id||""}')"><div class="form-grid">
<div class="field"><label>Prénom</label><input name="first" value="${esc(p.first)}" required></div><div class="field"><label>Nom</label><input name="last" value="${esc(p.last)}" required></div>
<div class="field"><label>Date de naissance</label><input name="birth" type="date" value="${esc(p.birth)}" required></div><div class="field"><label>Téléphone</label><input name="phone" value="${esc(p.phone)}"></div>
<div class="field"><label>Groupe sanguin</label><select name="blood">${["Inconnu","A+","A-","B+","B-","AB+","AB-","O+","O-"].map(x=>`<option ${p.blood===x?"selected":""}>${x}</option>`).join("")}</select></div>
<div class="field"><label>Allergies fictives</label><input name="allergies" value="${esc(p.allergies)}"></div>
<div class="field full"><label>Antécédents fictifs</label><textarea name="history">${esc(p.history)}</textarea></div>
<div class="field"><label>Vaccinations fictives</label><input name="vaccines" value="${esc(p.vaccines)}"></div><div class="field"><label>Traitements fictifs</label><input name="treatments" value="${esc(p.treatments)}"></div>
<div class="field full"><label>Notes</label><textarea name="notes">${esc(p.notes)}</textarea></div></div>
<div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Annuler</button><button class="btn">Enregistrer</button></div></form>`)
}
function savePatient(e,id){e.preventDefault();let f=new FormData(e.target),o={id:id||uid(),first:f.get("first"),last:f.get("last"),birth:f.get("birth"),phone:f.get("phone"),blood:f.get("blood"),allergies:f.get("allergies"),history:f.get("history"),vaccines:f.get("vaccines"),treatments:f.get("treatments"),notes:f.get("notes")};if(id)data.patients[data.patients.findIndex(p=>p.id===id)]=o;else data.patients.push(o);save();closeModal();render();toast(id?"Dossier modifié":"Patient ajouté")}
function openPatient(id){
let p=data.patients.find(x=>x.id===id);
modal("Dossier patient",`<div class="patient-head"><div class="big-avatar">${esc(p.first[0]+p.last[0])}</div><div><h2 style="margin:0">${esc(p.first)} ${esc(p.last)}</h2><div class="sub">Patient fictif • né(e) le ${fmt(p.birth)}</div></div></div>
<div class="detail-grid"><div class="detail"><span>Téléphone</span>${esc(p.phone||"—")}</div><div class="detail"><span>Groupe sanguin</span>${esc(p.blood||"—")}</div><div class="detail"><span>Allergies</span>${esc(p.allergies||"—")}</div><div class="detail"><span>Antécédents</span>${esc(p.history||"—")}</div><div class="detail"><span>Vaccinations</span>${esc(p.vaccines||"—")}</div><div class="detail"><span>Traitements</span>${esc(p.treatments||"—")}</div></div>
<div class="section"><div class="card"><b>Notes</b><p class="sub">${esc(p.notes||"Aucune note.")}</p></div></div>
<div class="section"><h3>Historique des consultations</h3><div class="timeline">${data.consultations.filter(c=>c.patient===p.first+" "+p.last).length?data.consultations.filter(c=>c.patient===p.first+" "+p.last).map(c=>`<div class="timeline-item"><b>${fmt(c.date)} — ${esc(c.reason)}</b><div class="sub">${esc(c.conclusion||c.notes||"Aucune conclusion.")}</div></div>`).join(""):"<div class='empty'>Aucune consultation.</div>"}</div></div>
<div class="modal-actions"><button class="btn secondary" onclick="closeModal()">Fermer</button><button class="btn secondary" onclick="closeModal();patientModal(data.patients.find(x=>x.id==='${p.id}'))">Modifier</button><button class="btn" onclick="closeModal();consultModal('${p.id}')">Nouvelle consultation</button><button class="btn danger" onclick="deletePatient('${p.id}')">Supprimer</button></div>`)
}
function deletePatient(id){if(confirm("Supprimer définitivement ce dossier fictif ?")){data.patients=data.patients.filter(p=>p.id!==id);save();closeModal();render();toast("Dossier supprimé")}}

function apptModal(existing=null){
let a=existing||{};
modal(existing?"Modifier le rendez-vous":"Nouveau rendez-vous",`<form onsubmit="saveAppt(event,'${a.id||""}')"><div class="form-grid">
<div class="field full"><label>Patient</label><select name="patient">${data.patients.map(p=>`<option ${a.patient===p.first+" "+p.last?"selected":""}>${esc(p.first+" "+p.last)}</option>`).join("")}</select></div>
<div class="field"><label>Date</label><input name="date" type="date" value="${esc(a.date||today())}" required></div><div class="field"><label>Heure</label><input name="time" type="time" value="${esc(a.time||"14:00")}" required></div>
<div class="field"><label>Médecin</label><select name="doctor">${USERS.map(u=>`<option ${a.doctor===u.name?"selected":""}>${u.name}</option>`).join("")}</select></div>
<div class="field"><label>Statut</label><select name="status">${["Prévu","Arrivé","En attente","En consultation","Terminé","Annulé"].map(s=>`<option ${a.status===s?"selected":""}>${s}</option>`).join("")}</select></div>
<div class="field full"><label>Motif</label><input name="reason" value="${esc(a.reason)}" required></div></div>
<div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Annuler</button><button class="btn">Enregistrer</button></div></form>`)
}
function saveAppt(e,id){e.preventDefault();let f=new FormData(e.target),o={id:id||uid(),patient:f.get("patient"),date:f.get("date"),time:f.get("time"),doctor:f.get("doctor"),reason:f.get("reason"),status:f.get("status")};if(id)data.appointments[data.appointments.findIndex(a=>a.id===id)]=o;else data.appointments.push(o);save();closeModal();render();toast(id?"Rendez-vous modifié":"Rendez-vous ajouté")}
function editAppt(id){apptModal(data.appointments.find(a=>a.id===id))}
function deleteAppt(id){if(confirm("Supprimer définitivement ce rendez-vous fictif ?")){data.appointments=data.appointments.filter(a=>a.id!==id);save();render();toast("Rendez-vous supprimé")}}

function consultModal(pid="",existing=null){
let c=existing||{},name=pid?(data.patients.find(p=>p.id===pid)?.first+" "+data.patients.find(p=>p.id===pid)?.last):c.patient||"";
foodDraft=JSON.parse(JSON.stringify(c.foodPlan||emptyFoodPlan()));
modal(existing?"Modifier la consultation":"Nouvelle consultation",`<form onsubmit="saveConsult(event,'${c.id||""}')"><div class="form-grid">
<div class="field full"><label>Patient</label><select name="patient">${data.patients.map(p=>`<option ${name===p.first+" "+p.last?"selected":""}>${esc(p.first+" "+p.last)}</option>`).join("")}</select></div>
<div class="field full"><label>Motif</label><input name="reason" value="${esc(c.reason)}" required></div>
<div class="field"><label>Température (°C)</label><input name="temp" value="${esc(c.temp)}" type="number" step=".1"></div><div class="field"><label>Pouls (bpm)</label><input name="pulse" value="${esc(c.pulse)}" type="number"></div>
<div class="field"><label>Tension</label><input name="bp" value="${esc(c.bp)}" placeholder="120/80"></div><div class="field"><label>Saturation (%)</label><input name="sat" value="${esc(c.sat)}" type="number"></div>
<div class="field full"><label>Symptômes / observations fictives</label><textarea name="notes">${esc(c.notes)}</textarea></div>
<div class="field full"><label>Examen clinique fictif</label><textarea name="exam">${esc(c.exam)}</textarea></div>
<div class="field full"><label>Diagnostic fictif</label><textarea name="diagnosis">${esc(c.diagnosis)}</textarea></div>
<div class="field full"><label>Traitement / prescription fictive</label><textarea name="treatment">${esc(c.treatment)}</textarea></div>
<div class="field full"><label>Conclusion</label><textarea name="conclusion">${esc(c.conclusion)}</textarea></div>
<div class="field full"><div class="card" style="background:#f7fbff"><div class="section-head"><div><b>🥗 Bilan alimentaire</b><div class="sub">Créer la journée alimentaire du patient et générer sa pyramide personnalisée.</div></div><button type="button" class="btn" onclick="openFoodPlanner()">${foodPlanLabel(foodDraft)==='Bilan alimentaire créé'?'Modifier le bilan':'Créer le bilan'}</button></div><div id="foodSummary">${foodPlanSummary(foodDraft)}</div></div></div>
</div><div class="notice">⚠️ Simulation de jeu : les données alimentaires, calculs et recommandations sont fictifs et ne remplacent pas un professionnel de santé.</div>
<div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Annuler</button><button class="btn">Enregistrer</button></div></form>`)
}
function foodPlanSummary(plan){let counts=foodCounts(plan);if(!plan||!Object.values(plan).some(a=>a?.length))return '<span class="sub">Aucun repas saisi.</span>';return `<b>${Object.values(plan).flat().length} aliments/plats saisis</b> • ${Object.entries(counts).map(([k,v])=>`${esc(k)} : ${v}`).join(' • ')}`}
function openFoodPlanner(){
let rows=MEALS.map(([key,label])=>`<div class="card" style="margin-bottom:12px"><div class="section-head"><h3 style="margin:0">${label}</h3><button type="button" class="btn secondary" onclick="addFood('${key}')">+ Ajouter</button></div><div id="meal-${key}">${foodRows(key)}</div></div>`).join('');
document.body.insertAdjacentHTML('beforeend',`<div class="modal-bg" id="foodModal"><div class="modal"><div class="modal-head"><div><h2>🥗 Journée alimentaire</h2><div class="sub">Saisissez les aliments consommés pour chaque repas.</div></div><button class="close" onclick="closeFoodPlanner()">×</button></div><div class="notice">La base est une base de jeu inspirée des grandes catégories alimentaires. Les portions sont indicatives.</div>${rows}<div class="modal-actions"><button class="btn secondary" onclick="closeFoodPlanner()">Annuler</button><button class="btn" onclick="saveFoodPlanner()">Valider la journée</button></div></div></div>`)
}
function foodRows(key){let arr=foodDraft[key]||[];if(!arr.length)return '<div class="empty" style="padding:20px">Aucun aliment pour ce repas.</div>';return arr.map((x,i)=>`<div class="actions" style="margin-bottom:8px"><select style="flex:1" onchange="changeFood('${key}',${i},this.value)">${FOOD_DB.map(f=>`<option value="${esc(f[0])}" ${f[0]===x.name?'selected':''}>${esc(f[0])} — ${esc(f[1])}</option>`).join('')}</select><input style="width:90px;padding:10px;border:1px solid #e4eaf2;border-radius:10px" type="number" min="1" step="1" value="${x.qty||1}" onchange="changeFoodQty('${key}',${i},this.value)" title="Portions"><button type="button" class="btn danger" onclick="removeFood('${key}',${i})">×</button></div>`).join('')}
function addFood(key){let f=FOOD_DB[0];foodDraft[key].push({name:f[0],cat:f[1],qty:1});document.getElementById('meal-'+key).innerHTML=foodRows(key)}
function changeFood(key,i,name){let f=FOOD_DB.find(x=>x[0]===name);foodDraft[key][i]={name:f[0],cat:f[1],qty:foodDraft[key][i].qty||1}}
function changeFoodQty(key,i,q){foodDraft[key][i].qty=Math.max(1,Number(q)||1)}
function removeFood(key,i){foodDraft[key].splice(i,1);document.getElementById('meal-'+key).innerHTML=foodRows(key)}
function closeFoodPlanner(){document.getElementById('foodModal')?.remove()}
function saveFoodPlanner(){closeFoodPlanner();let x=document.getElementById('foodSummary');if(x)x.innerHTML=foodPlanSummary(foodDraft);toast('Bilan alimentaire ajouté à la consultation')}
function pyramidHTML(plan){let counts=foodCounts(plan),cats=['Produits sucrés','Matières grasses','Viandes/œufs/légumineuses','Produits laitiers','Fruits','Légumes','Céréales','Boissons'];let max=Math.max(1,...cats.map(c=>counts[c]||0));return `<div class="pyramid-wrap"><div class="pyramid">${cats.map((c,i)=>{let n=counts[c]||0,w=22+i*9;let opacity=n?Math.min(.95,.35+.6*n/max):.18;return `<div class="pyr-level" style="width:${w}%;opacity:${opacity}"><span>${esc(c)}</span><b>${n} portion${n>1?'s':''}</b></div>`}).reverse().join('')}</div><div class="pyramid-legend">Plus une catégorie apparaît dans la journée, plus son niveau est rempli. <b>Cette pyramide est une visualisation ludique personnalisée</b>, pas une recommandation médicale.</div></div>`}
function viewConsult(id){let c=data.consultations.find(x=>x.id===id);if(!c)return;let plan=c.foodPlan||emptyFoodPlan();modal('Consultation — affichage',`<div class="patient-head"><div class="big-avatar">${esc(c.patient.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><h2 style="margin:0">${esc(c.patient)}</h2><div class="sub">${fmt(c.date)} • ${esc(c.doctor)} • ${esc(c.reason)}</div></div></div><div class="detail-grid"><div class="detail"><span>Température</span>${esc(c.temp||'—')} °C</div><div class="detail"><span>Pouls</span>${esc(c.pulse||'—')} bpm</div><div class="detail"><span>Tension</span>${esc(c.bp||'—')}</div><div class="detail"><span>Saturation</span>${esc(c.sat||'—')} %</div></div><div class="section"><div class="card"><b>Symptômes / observations</b><p>${esc(c.notes||'—')}</p><b>Examen clinique</b><p>${esc(c.exam||'—')}</p><b>Diagnostic fictif</b><p>${esc(c.diagnosis||'—')}</p><b>Traitement / prescription fictive</b><p>${esc(c.treatment||'—')}</p><b>Conclusion</b><p>${esc(c.conclusion||'—')}</p></div></div><div class="section"><div class="section-head"><h2>🥗 Pyramide alimentaire personnalisée</h2><span class="badge">${foodPlanLabel(plan)}</span></div>${Object.values(plan).some(a=>a.length)?pyramidHTML(plan):'<div class="empty">Aucun bilan alimentaire n’a été créé pour cette consultation.</div>'}</div><div class="section"><h3>Journée alimentaire</h3>${mealSummary(plan)}</div><div class="modal-actions"><button class="btn secondary" onclick="closeModal()">Fermer</button><button class="btn secondary" onclick="closeModal();editConsult('${c.id}')">Modifier</button><button class="btn" onclick="downloadConsult('${c.id}')">Télécharger</button></div>`)}
function mealSummary(plan){return MEALS.map(([k,l])=>`<div class="card" style="margin-bottom:8px"><b>${l}</b><div class="sub">${(plan[k]||[]).length?(plan[k].map(x=>`${esc(x.name)} × ${x.qty||1}`).join(' • ')):'Aucun aliment saisi.'}</div></div>`).join('')}
function downloadConsult(id){let c=data.consultations.find(x=>x.id===id);if(!c)return;let plan=c.foodPlan||emptyFoodPlan();let html=`<!doctype html><html lang="fr"><meta charset="utf-8"><title>Consultation fictive - ${esc(c.patient)}</title><style>body{font-family:Arial;padding:40px;color:#172033}h1{color:#1769e0}.box{border:1px solid #ddd;border-radius:12px;padding:16px;margin:14px 0}.pyramid{display:flex;flex-direction:column;align-items:center;gap:3px;margin:20px}.pyr{padding:9px;background:#dfeeff;text-align:center;border-radius:5px}</style><h1>Cabinet Médical Pro</h1><p><b>CONSULTATION — SIMULATION FICTIVE</b></p><div class="box"><b>Patient :</b> ${esc(c.patient)}<br><b>Date :</b> ${fmt(c.date)}<br><b>Médecin :</b> ${esc(c.doctor)}<br><b>Motif :</b> ${esc(c.reason)}</div><div class="box"><b>Constantes</b><p>Température : ${esc(c.temp||'—')} °C • Pouls : ${esc(c.pulse||'—')} bpm • Tension : ${esc(c.bp||'—')} • Saturation : ${esc(c.sat||'—')} %</p></div><div class="box"><b>Observations</b><p>${esc(c.notes||'—')}</p><b>Examen</b><p>${esc(c.exam||'—')}</p><b>Diagnostic fictif</b><p>${esc(c.diagnosis||'—')}</p><b>Traitement fictif</b><p>${esc(c.treatment||'—')}</p><b>Conclusion</b><p>${esc(c.conclusion||'—')}</p></div><div class="box"><h2>Pyramide alimentaire personnalisée</h2>${pyramidDownload(plan)}</div><div class="box"><h2>Journée alimentaire</h2>${mealSummary(plan)}</div><p style="color:#777">Document de jeu — sans valeur médicale.</p></html>`;let blob=new Blob([html],{type:'text/html;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='consultation-'+c.patient.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.html';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);toast('Consultation téléchargée')}
function pyramidDownload(plan){let counts=foodCounts(plan),cats=['Boissons','Céréales','Légumes','Fruits','Produits laitiers','Viandes/œufs/légumineuses','Matières grasses','Produits sucrés'],max=Math.max(1,...cats.map(c=>counts[c]||0));return `<div class="pyramid">${cats.map((c,i)=>`<div class="pyr" style="width:${20+i*10}%;opacity:${Math.min(.95,.35+.6*(counts[c]||0)/max)}">${esc(c)} — ${counts[c]||0}</div>`).join('')}</div>`}
function consultModalByName(name){let p=data.patients.find(x=>x.first+" "+x.last===name);consultModal(p?.id||"")}
function saveConsult(e,id){e.preventDefault();let f=new FormData(e.target),o={id:id||uid(),date:today(),patient:f.get("patient"),reason:f.get("reason"),temp:f.get("temp"),pulse:f.get("pulse"),bp:f.get("bp"),sat:f.get("sat"),notes:f.get("notes"),exam:f.get("exam"),diagnosis:f.get("diagnosis"),treatment:f.get("treatment"),conclusion:f.get("conclusion"),doctor:currentUser.name,foodPlan:JSON.parse(JSON.stringify(foodDraft))};if(id)data.consultations[data.consultations.findIndex(c=>c.id===id)]=o;else data.consultations.unshift(o);save();closeModal();render();toast(id?"Consultation modifiée":"Consultation enregistrée")}
function editConsult(id){consultModal("",data.consultations.find(c=>c.id===id))}
function deleteConsult(id){if(confirm("Supprimer définitivement cette consultation fictive ?")){data.consultations=data.consultations.filter(c=>c.id!==id);save();render();toast("Consultation supprimée")}}

function prescriptionModal(existing=null){
let p=existing||{};
modal("Nouvelle ordonnance fictive",`<form onsubmit="savePrescription(event,'${p.id||""}')"><div class="form-grid">
<div class="field full"><label>Patient</label><select name="patient">${data.patients.map(x=>`<option ${p.patient===x.first+" "+x.last?"selected":""}>${esc(x.first+" "+x.last)}</option>`).join("")}</select></div>
<div class="field"><label>Date</label><input type="date" name="date" value="${p.date||today()}" required></div>
<div class="field"><label>Durée fictive</label><input name="duration" value="${esc(p.duration||"7 jours")}"></div>
<div class="field full"><label>Prescription fictive</label><textarea name="content" placeholder="Exemple de médicament fictif, posologie, fréquence...">${esc(p.content)}</textarea></div></div>
<div class="notice">⚠️ Cette ordonnance est uniquement un accessoire de jeu et n'a aucune valeur médicale.</div>
<div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Annuler</button><button class="btn">Enregistrer</button></div></form>`)
}
function savePrescription(e,id){e.preventDefault();let f=new FormData(e.target),o={id:id||uid(),date:f.get("date"),patient:f.get("patient"),duration:f.get("duration"),content:f.get("content"),doctor:currentUser.name};if(id)data.prescriptions[data.prescriptions.findIndex(p=>p.id===id)]=o;else data.prescriptions.unshift(o);save();closeModal();render();toast("Ordonnance fictive enregistrée")}
function deletePrescription(id){if(confirm("Supprimer cette ordonnance fictive ?")){data.prescriptions=data.prescriptions.filter(p=>p.id!==id);save();render();toast("Ordonnance supprimée")}}
function printPrescription(id){
let p=data.prescriptions.find(x=>x.id===id),w=window.open("","_blank");
w.document.write(`<html><head><title>Ordonnance fictive</title><style>body{font-family:Arial;padding:50px}h1{margin-bottom:5px}.box{border:1px solid #ddd;padding:20px;margin-top:30px}footer{margin-top:80px;color:#777}</style></head><body><h1>Cabinet Médical Pro</h1><p>Ordonnance — SIMULATION</p><p><b>Patient :</b> ${esc(p.patient)}</p><p><b>Date :</b> ${fmt(p.date)}</p><div class="box">${esc(p.content).replace(/\n/g,"<br>")}<br><br><b>Durée :</b> ${esc(p.duration)}</div><footer>Médecin : ${esc(p.doctor)}<br>Document fictif sans valeur médicale.</footer><script>window.print()</script></body></html>`);w.document.close()
}

function examModal(){
modal("Ajouter un examen fictif",`<form onsubmit="saveExam(event)"><div class="form-grid">
<div class="field full"><label>Patient</label><select name="patient">${data.patients.map(p=>`<option>${esc(p.first+" "+p.last)}</option>`).join("")}</select></div>
<div class="field"><label>Type d'examen</label><select name="type"><option>Analyse sanguine</option><option>Test fictif</option><option>Radiographie fictive</option><option>Échographie fictive</option><option>Autre</option></select></div>
<div class="field"><label>Date</label><input name="date" type="date" value="${today()}"></div>
<div class="field full"><label>Résultat fictif</label><textarea name="result"></textarea></div></div>
<div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Annuler</button><button class="btn">Ajouter</button></div></form>`)
}
function saveExam(e){e.preventDefault();let f=new FormData(e.target);data.exams.unshift({id:uid(),patient:f.get("patient"),type:f.get("type"),date:f.get("date"),result:f.get("result"),doctor:currentUser.name});save();closeModal();render();toast("Examen ajouté")}
function deleteExam(id){if(confirm("Supprimer cet examen fictif ?")){data.exams=data.exams.filter(x=>x.id!==id);save();render();toast("Examen supprimé")}}

function documentModal(){
modal("Ajouter un document fictif",`<form onsubmit="saveDocument(event)"><div class="form-grid">
<div class="field full"><label>Patient</label><select name="patient">${data.patients.map(p=>`<option>${esc(p.first+" "+p.last)}</option>`).join("")}</select></div>
<div class="field"><label>Nom du document</label><input name="name" placeholder="Compte-rendu fictif" required></div><div class="field"><label>Catégorie</label><select name="category"><option>Compte-rendu</option><option>Courrier</option><option>Résultat</option><option>Autre</option></select></div></div>
<div class="modal-actions"><button type="button" class="btn secondary" onclick="closeModal()">Annuler</button><button class="btn">Ajouter</button></div></form>`)
}
function saveDocument(e){e.preventDefault();let f=new FormData(e.target);data.documents.unshift({id:uid(),date:today(),patient:f.get("patient"),name:f.get("name"),category:f.get("category")});save();closeModal();render();toast("Document ajouté")}
function deleteDocument(id){if(confirm("Supprimer ce document fictif ?")){data.documents=data.documents.filter(x=>x.id!==id);save();render();toast("Document supprimé")}}
function resetData(){if(confirm("Réinitialiser toutes les données fictives du navigateur ?")){localStorage.removeItem(KEY);render();toast("Données réinitialisées")}}
render();
