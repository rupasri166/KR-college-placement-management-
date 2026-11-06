const $ = (id) => document.getElementById(id);
const api = async (url, options={}) => {
  const response = await fetch(url, { headers: { "Content-Type":"application/json" }, ...options });
  const data = await response.json().catch(()=>({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong.");
  return data;
};
function toast(message, error=false) {
  const el=$("toast"); el.textContent=message; el.className=error?"show error":"show";
  clearTimeout(window.toastTimer); window.toastTimer=setTimeout(()=>el.className="",3200);
}
function esc(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function loadDashboard(){
  const d=await api("/api/dashboard");
  $("studentCount").textContent=d.students;$("companyCount").textContent=d.companies;
  $("driveCount").textContent=d.drives;$("applicationCount").textContent=d.applications;
}
async function loadStudents(){
  const rows=await api("/api/students");
  $("studentsTable").innerHTML=rows.map(s=>`<tr><td>${s.student_id}</td><td>${esc(s.name)}</td><td>${esc(s.roll_no)}</td><td>${esc(s.branch)}</td><td>${Number(s.cgpa).toFixed(2)}</td><td>${esc(s.email)}</td><td><button class="delete-btn" onclick="deleteStudent(${s.student_id})">Delete</button></td></tr>`).join("")||'<tr><td colspan="7">No students added yet.</td></tr>';
  $("applicationStudent").innerHTML='<option value="">Select student</option>'+rows.map(s=>`<option value="${s.student_id}">${esc(s.name)} (${esc(s.roll_no)})</option>`).join("");
}
async function loadCompanies(){
  const rows=await api("/api/companies");
  $("companiesTable").innerHTML=rows.map(c=>`<tr><td>${c.company_id}</td><td>${esc(c.company_name)}</td><td>${c.website?`<a href="${esc(c.website)}" target="_blank" rel="noopener">Visit website</a>`:"—"}</td><td>${esc(c.hr_email)}</td><td>${new Date(c.registered_at).toLocaleDateString()}</td></tr>`).join("")||'<tr><td colspan="5">No companies registered yet.</td></tr>';
  $("companySelect").innerHTML='<option value="">Select company</option>'+rows.map(c=>`<option value="${c.company_id}">${esc(c.company_name)}</option>`).join("");
}
async function loadJobs(){
  const rows=await api("/api/jobs");
  $("jobsTable").innerHTML=rows.map(j=>`<tr><td>${esc(j.company_name)}</td><td>${esc(j.job_role)}</td><td>${Number(j.min_cgpa).toFixed(2)}</td><td>${esc(j.eligible_branch)}</td><td>${j.package_lpa?Number(j.package_lpa).toFixed(2)+" LPA":"—"}</td><td>${new Date(j.drive_date).toLocaleDateString()}</td></tr>`).join("")||'<tr><td colspan="6">No recruitment drives available.</td></tr>';
  $("applicationJob").innerHTML='<option value="">Select recruitment drive</option>'+rows.map(j=>`<option value="${j.job_id}">${esc(j.company_name)} — ${esc(j.job_role)}</option>`).join("");
}
async function loadApplications(){
  const rows=await api("/api/applications");
  $("applicationsTable").innerHTML=rows.map(a=>`<tr><td>${a.application_id}</td><td>${esc(a.student_name)}</td><td>${esc(a.roll_no)}</td><td>${esc(a.company_name)}</td><td>${esc(a.job_role)}</td><td>${new Date(a.applied_at).toLocaleDateString()}</td><td><select class="status-select" onchange="updateStatus(${a.application_id},this.value)">${["Pending","Shortlisted","Selected","Rejected"].map(x=>`<option ${a.status===x?"selected":""}>${x}</option>`).join("")}</select></td></tr>`).join("")||'<tr><td colspan="7">No applications submitted yet.</td></tr>';
}
async function loadAll(){try{await Promise.all([loadDashboard(),loadStudents(),loadCompanies(),loadJobs(),loadApplications()]);}catch(e){toast(e.message+" Check database setup and server.",true);}}
async function deleteStudent(id){if(!confirm("Delete this student? Related applications will also be deleted."))return;try{const d=await api("/api/students/"+id,{method:"DELETE"});toast(d.message);loadAll();}catch(e){toast(e.message,true);}}
async function updateStatus(id,status){try{const d=await api("/api/applications/"+id,{method:"PATCH",body:JSON.stringify({status})});toast(d.message);loadDashboard();}catch(e){toast(e.message,true);}}
$("studentForm").addEventListener("submit",async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));try{const d=await api("/api/students",{method:"POST",body:JSON.stringify(body)});toast(d.message);e.target.reset();loadAll();}catch(err){toast(err.message,true);}});
$("companyForm").addEventListener("submit",async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));try{const d=await api("/api/companies",{method:"POST",body:JSON.stringify(body)});toast(d.message);e.target.reset();loadAll();}catch(err){toast(err.message,true);}});
$("jobForm").addEventListener("submit",async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));try{const d=await api("/api/jobs",{method:"POST",body:JSON.stringify(body)});toast(d.message);e.target.reset();loadAll();}catch(err){toast(err.message,true);}});
$("applicationForm").addEventListener("submit",async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(e.target));try{const d=await api("/api/applications",{method:"POST",body:JSON.stringify(body)});toast(d.message);e.target.reset();loadAll();}catch(err){toast(err.message,true);}});
loadAll();
