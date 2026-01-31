/* Reveal */
const revealEls = Array.from(document.querySelectorAll('.reveal'));
const io = new IntersectionObserver((entries) => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

/* Toast */
function toast(message){
  const t = document.createElement('div');
  t.textContent = message;
  t.style.position = 'fixed';
  t.style.left = '50%';
  t.style.bottom = '22px';
  t.style.transform = 'translateX(-50%)';
  t.style.padding = '10px 12px';
  t.style.borderRadius = '999px';
  t.style.border = '1px solid rgba(15,23,42,.12)';
  t.style.background = 'rgba(255,255,255,.92)';
  t.style.boxShadow = '0 18px 40px rgba(15,23,42,.14)';
  t.style.zIndex = '999';
  t.style.fontSize = '13px';
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity .35s ease'; }, 1400);
  setTimeout(() => t.remove(), 1900);
}

/* Copy helper */
async function copyText(txt, msg){
  try{
    await navigator.clipboard.writeText(txt);
    toast(msg || 'Copied.');
  }catch{
    const ta = document.createElement('textarea');
    ta.value = txt;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    toast(msg || 'Copied.');
  }
}

const starterPrompt =
`You are my office AI assistant. Help me draft a first pass, then add a review checklist.

Rules:
- Do not invent facts or names.
- Flag ambiguity and missing information.
- Keep tone professional and calm.
- End with a short "Review Before Sending" checklist.

Task:
[DESCRIBE TASK]

Context:
[PASTE NON-SENSITIVE CONTEXT HERE]`;

const emailPrompt =
`Rewrite this email in a warm, professional tone. Preserve facts and intent.

Output:
1) Concise version
2) More detailed version

Also:
- Flag any ambiguity or missing info.
- Do not invent details.

DRAFT:
[PASTE HERE]`;

const minutesPrompt =
`Turn these notes into meeting minutes with:
- Summary
- Decisions
- Action Items (owner + due date if stated)
- Open Questions

Do not invent details.

NOTES:
[PASTE HERE]`;

document.getElementById('copyStarterPrompt')?.addEventListener('click', () => copyText(starterPrompt, 'Copied starter prompt.'));
document.getElementById('copyEmailPrompt')?.addEventListener('click', () => copyText(emailPrompt, 'Copied email prompt.'));
document.getElementById('copyMinutesPrompt')?.addEventListener('click', () => copyText(minutesPrompt, 'Copied minutes prompt.'));
document.getElementById('mobileCopy')?.addEventListener('click', () => copyText(starterPrompt, 'Copied starter prompt.'));

document.getElementById('starterForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  toast('Thanks — starter pack will be sent (mock).');
});

/* Sidebar view switching + filtering */
const navItems = Array.from(document.querySelectorAll('.navItem[data-view]'));
const posts = Array.from(document.querySelectorAll('.post[data-tags]'));
const globalInput = document.getElementById('globalSearchInput');
const filterBtns = Array.from(document.querySelectorAll('[data-filter]'));

const feedTitle = document.getElementById('feedTitle');
const feedSubtitle = document.getElementById('feedSubtitle');
const resultsPill = document.getElementById('resultsPill');
const filterPill = document.getElementById('filterPill');

let activeView = 'updates';
let activeType = 'all';

function applyFilters(){
  const q = (globalInput?.value || '').trim().toLowerCase();
  let shown = 0;

  posts.forEach(p => {
    const tags = (p.getAttribute('data-tags') || '').toLowerCase();
    const view = (p.getAttribute('data-view') || '').toLowerCase();
    const type = (p.getAttribute('data-type') || '').toLowerCase();

    const matchQ = !q || tags.includes(q);
    const matchView = !activeView || view.includes(activeView);
    const matchType = (activeType === 'all') || type.includes(activeType);

    const ok = matchQ && matchView && matchType;
    p.style.display = ok ? '' : 'none';
    if (ok) shown++;
  });

  const qLabel = q ? `“${q}”` : '—';
  resultsPill.textContent = `Showing: ${activeView} • ${activeType} • ${shown} match${shown===1?'':'es'} • Search: ${qLabel}`;
}

function setView(view){
  activeView = view;
  navItems.forEach(n => n.classList.toggle('active', (n.getAttribute('data-view')||'') === view));

  const pretty = ({
    updates: ['Recent updates', 'New items added to the library'],
    writing: ['Writing', 'Emails, docs, summaries, and report structure'],
    meetings: ['Meetings', 'Agendas, minutes, action items, and follow-ups'],
    analysis: ['Analysis', 'Briefs, decision records, and structured thinking'],
    policy: ['Policy-safe', 'Redaction, boundaries, and safe habits'],
    downloads: ['Downloads', 'Mini books, prompt packs, and templates']
  })[view] || ['Library', 'Browse the playbook'];

  feedTitle.textContent = pretty[0];
  feedSubtitle.textContent = pretty[1];
  applyFilters();
}

navItems.forEach(n => {
  n.addEventListener('click', (e) => {
    e.preventDefault();
    setView(n.getAttribute('data-view'));
  });
});

filterBtns.forEach(b => {
  b.addEventListener('click', () => {
    activeType = (b.getAttribute('data-filter') || 'all').toLowerCase();
    filterPill.textContent = activeType.toUpperCase();
    applyFilters();
  });
});

globalInput?.addEventListener('input', applyFilters);

setView('updates');
applyFilters();
