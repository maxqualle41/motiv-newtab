/* Versucht zuerst ein lokales Bild images/landscape.jpg zu laden.
   Falls das nicht existiert, nimmt es ein Unsplash-Landschaftsbild als Fallback. */
(function setBackground(){
  const local = 'images/landscape.jpg';
  const fallback = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80';
  const img = new Image();
  img.onload = () => {
    document.documentElement.style.setProperty('--bg-img', `url('${local}')`);
  };
  img.onerror = () => {
    document.documentElement.style.setProperty('--bg-img', `url('${fallback}')`);
  };
  img.src = local;
})();

// Minimal behavior: todos + quotes + time + auto-rotate
const qs = s => document.querySelector(s);

const newTodo = qs('#newTodo');
const addTodo = qs('#addTodo');
const todoList = qs('#todoList');
const clearDone = qs('#clearDone');
const clearAll = qs('#clearAll');

const quoteText = qs('#quoteText');
const nextQuoteBtn = qs('#nextQuote');
const prevQuoteBtn = qs('#prevQuote');
const autoRotate = qs('#autoRotate');

const timeEl = qs('#time');

const STORAGE_TODOS = 'm_todos_v1';
const STORAGE_QUOTE = 'm_quoteIndex_v1';
const STORAGE_AUTO = 'm_autoRotate_v1';

const quotes = [
  "Wer kämpft, kann verlieren. Wer nicht kämpft, hat schon verloren. — Bertolt Brecht",
  "Der Weg ist das Ziel. — Konfuzius",
  "Tu heute etwas, wofür dir dein zukünftiges Ich danken wird.",
  "Kleine Schritte jeden Tag führen zu großen Veränderungen.",
  "Glaube an dich selbst und du bist schon halb dort.",
  "Konzentriere dich auf den nächsten kleinen Schritt — nicht auf die ganze Strecke."
];

let quoteIndex = parseInt(localStorage.getItem(STORAGE_QUOTE) || '0',10) || 0;
let rotateTimer = null;

function updateTime(){
  const t = new Date();
  timeEl.textContent = t.toLocaleTimeString();
}
setInterval(updateTime,1000);
updateTime();

function getTodos(){ try{ return JSON.parse(localStorage.getItem(STORAGE_TODOS) || '[]') }catch(e){ return [] } }
function saveTodos(t){ localStorage.setItem(STORAGE_TODOS, JSON.stringify(t)) }

function renderTodos(){
  todoList.innerHTML = '';
  const todos = getTodos();
  todos.forEach((t,i)=>{
    const li = document.createElement('li');
    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked = !!t.done;
    cb.addEventListener('change', ()=>{ t.done = cb.checked; saveTodos(todos); renderTodos(); });
    const txt = document.createElement('div'); txt.className='text'; txt.textContent = t.text; if(t.done) txt.classList.add('todo-done');
    const del = document.createElement('button'); del.textContent='✕'; del.className='muted'; del.style.padding='6px 8px';
    del.addEventListener('click', ()=>{ todos.splice(i,1); saveTodos(todos); renderTodos(); });
    li.appendChild(cb); li.appendChild(txt); li.appendChild(del);
    todoList.appendChild(li);
  });
}

addTodo.addEventListener('click', ()=>{
  const v = newTodo.value.trim(); if(!v) return;
  const todos = getTodos(); todos.unshift({text:v,done:false});
  saveTodos(todos); newTodo.value=''; renderTodos();
});
newTodo.addEventListener('keydown', (e)=>{ if(e.key==='Enter') addTodo.click(); });

clearDone.addEventListener('click', ()=>{
  let t = getTodos(); t = t.filter(x=>!x.done); saveTodos(t); renderTodos();
});
clearAll.addEventListener('click', ()=>{
  if(confirm('Alle Aufgaben löschen?')) { saveTodos([]); renderTodos(); }
});

// Quotes
function showQuote(i){
  if(typeof i === 'number') quoteIndex = (i + quotes.length) % quotes.length;
  quoteText.textContent = quotes[quoteIndex];
  localStorage.setItem(STORAGE_QUOTE, quoteIndex);
}
qs('#nextQuote')?.addEventListener('click', ()=>{ showQuote(quoteIndex+1); });
qs('#prevQuote')?.addEventListener('click', ()=>{ showQuote(quoteIndex-1); });

function startAuto(){
  stopAuto();
  rotateTimer = setInterval(()=> showQuote(quoteIndex+1), 8000);
}
function stopAuto(){
  if(rotateTimer){ clearInterval(rotateTimer); rotateTimer = null; }
}

autoRotate.addEventListener('change', (e)=>{
  localStorage.setItem(STORAGE_AUTO, e.target.checked ? '1' : '0');
  if(e.target.checked) startAuto(); else stopAuto();
});

// Init
(function init(){
  if(!localStorage.getItem(STORAGE_TODOS)) localStorage.setItem(STORAGE_TODOS, '[]');
  renderTodos();
  const ar = localStorage.getItem(STORAGE_AUTO) === '1';
  autoRotate.checked = ar;
  showQuote(quoteIndex);
  if(ar) startAuto();
})();
