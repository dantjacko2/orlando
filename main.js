import './style.css';
import { createClient } from '@supabase/supabase-js';
import { schedule as seedSchedule, slotNames, locationMeta, families, familyBookings } from './data.js';

const url=import.meta.env.VITE_SUPABASE_URL, key=import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const configured=Boolean(url&&key&&!url.includes('YOUR_PROJECT'));
const supabase=configured?createClient(url,key):null;
const tripDates = seedSchedule
  .map(x => x.date)
  .sort();
 
function getDefaultDate() {

  const today = new Date();

  const todayString =
    today.toISOString().slice(0,10);

  if (tripDates.includes(todayString)) {
    return todayString;
  }

  if (todayString < tripDates[0]) {
    return tripDates[0];
  }

  return tripDates[
    tripDates.length - 1
  ];

}

let currentUser =
  localStorage.getItem(
    'orlando-profile'
  );

let profiles = [];

let reactions = [];

let weatherData={},
    bookings=[],
    bookingModal=null,
    bookingToEdit=null,
photoToEdit=null,
foodToEdit=null,
    tab='plans',
    selected=getDefaultDate(),
    modal=null,
    editing=null,
    photos=[],
    loading=false,
    rating=5,
    foodFilter='all',
    foodFamily='all',
    photoFilter='all';
const PROFILE_VERSION = 2;

const savedProfileVersion =
  localStorage.getItem(
    'orlando-profile-version'
  );

if(
  savedProfileVersion !==
  String(PROFILE_VERSION)
){

  localStorage.removeItem(
    'orlando-profile'
  );

  localStorage.setItem(
    'orlando-profile-version',
    PROFILE_VERSION
  );

}

let unlocked=!configured||localStorage.getItem('orlando-access')==='granted';
let schedule=structuredClone(seedSchedule);
const $=s=>document.querySelector(s); const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=d=>new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long'}).format(new Date(d+'T12:00:00'));
const short=d=>{const x=new Date(d+'T12:00:00');return [x.toLocaleDateString('en-GB',{weekday:'short'}),x.getDate()]};
function place(name){const [icon,cls]=locationMeta[name]||['📍',''];return `<span class="placeBadge ${cls}"><span>${icon}</span>${esc(name)}</span>`}
function bookingIcon(category){

  return {

    food:'🍽️',
    ride:'🎢',
    show:'🎭',
    travel:'✈️',
    cruise:'🚢',
    hotel:'🏨',
    experience:'✂️',
    other:'🎟️'

  }[category] || '🎟️';

}
function profileModal(){

  return `
<div class="modal">

<div class="sheet">

<h2>
👋 Welcome
</h2>

<p>
Who are you?
</p>

<form id="profileForm">

<select
  name="profile"
  required
>

<option value="">
Select profile
</option>

${profiles.map(
  p => `
<option>
${esc(p.display_name)}
</option>
`
).join('')}

</select>

<button
  class="primary"
  type="submit"
>
Continue
</button>

</form>

<hr style="margin:20px 0">

<form id="newProfileForm">

<label>
Add yourself
</label>

<input
  name="name"
  required
  placeholder="e.g. Grandad Steve"
>

<button
  class="primary"
  type="submit"
>
Create Profile
</button>

</form>

</div>

</div>
`;

}
function accessScreen(){return `<div class="accessGate"><div class="accessGlow one"></div><div class="accessGlow two"></div><div class="accessCard"><div class="accessIcon">🎡</div><div class="eyebrow">Private Orlando space</div><h1>Welcome to Orlando</h1><p>Enter the shared access PIN to view plans, photographs and food reviews.</p><form id="accessForm"><label>Access PIN</label><input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" required autocomplete="off" placeholder="6-digit PIN" autofocus><button class="primary" type="submit">Unlock Orlando</button><div id="accessError" class="accessError"></div></form></div></div>`}
async function unlockApp(e){e.preventDefault();const pin=new FormData(e.target).get('pin');const button=e.target.querySelector('button');button.disabled=true;button.textContent='Checking…';const {data,error}=await supabase.rpc('verify_access_pin',{p_pin:pin});if(error||data!==true){button.disabled=false;button.textContent='Unlock Orlando';const box=$('#accessError');if(box)box.textContent='That PIN is not correct. Please try again.';return}localStorage.setItem('orlando-access','granted');unlocked=true;render();loadSchedule()}
function header(){return `<header class="hero"><h1>Orlando</h1>

<button
  class="profileBadge"
  id="switchProfileBtn"
>
👤 ${esc(currentUser || 'Guest')}
</button>

<div class="heroCoaster">🎢</div>
<div class="heroCastle">🏰</div></header>`}function nav(){return `<nav class="tabs"><button data-tab="plans" class="${tab==='plans'?'on':''}">📍 Plans</button><button data-tab="photos" class="${tab==='photos'?'on':''}">📸 Photos</button><button data-tab="food" class="${tab==='food'?'on':''}">🍽️ Food</button></nav>`}
function overlapsFor(d){return ['m','a','e'].filter(k=>d.p[k]===d.s[k]&&d.p[k]!=="Flexible time");}
function plans(){const d=schedule.find(x=>x.date===selected)||schedule[0], ovs=overlapsFor(d);return `<main>${setupNote()}<div class="eyebrow">Shared schedule</div><h2 class="pageTitle">Where is everyone?</h2><div class="days">${schedule.map(x=>{const [w,n]=short(x.date);return `<button class="day ${x.date===selected?'on':''}" data-date="${x.date}">${overlapsFor(x).length?'<i class="overlapDot"></i>':''}<small>${w}</small><b>${n}</b></button>`}).join('')}</div><div class="dateTitle"><b>${fmt(d.date)}</b><small>Morning · afternoon · evening</small></div>${weatherData[d.date]
? `
<div class="weatherCard">

  <div class="weatherItem sun">
    <span>☀️</span>
    <b>${Math.round(weatherData[d.date].high)}°</b>
    <small>High</small>
  </div>

  <div class="weatherItem temp">
    <span>🌡️</span>
    <b>${Math.round(weatherData[d.date].low)}°</b>
    <small>Low</small>
  </div>

  <div class="weatherItem rain">
    <span>🌧️</span>
    <b>${weatherData[d.date].rain}%</b>
    <small>Rain</small>
  </div>

</div>
`
: `
<div class="weatherUnavailable">

  🌤️ Forecast available closer to travel

</div>
`}${ovs.length?`<div class="overlapBanner"><div><strong>⭐ OVERLAP</strong><h3>${ovs.map(k=>slotNames[k]).join(' + ')}</h3></div></div>`:''}${['m','a','e'].map(k=>slot(d,k,ovs.includes(k))).join('')}</main>`}
function slot(d,k,overlap){return `<section class="slot"><div class="slotTitle">${{m:'🌅',a:'☀️',e:'🌙'}[k]} ${slotNames[k]} ${overlap?'<span class="overlapPill">Overlap</span>':''}</div>${family('p','peterborough',families.peterborough,d.p[k],d.pDetails?.[k]||'',d.date,k)}${family('s','sthelens',families.sthelens,d.s[k],d.sDetails?.[k]||'',d.date,k)}</section>`}
function getFamilyEvents(date, family, slot){

  return bookings.filter(
    b =>
      b.trip_date === date &&
      b.family_id === family &&
      b.slot === slot
  );

}

function family(cls,id,name,where,details,date,slot){

  const familyEvents =
    getFamilyEvents(date,id,slot);

  return `
<div class="familyRow">

<span class="familyDot ${cls}"></span>

<div>

<div class="familyName">
${name}
</div>

<div style="margin-top:5px">
${place(where)}
</div>

${details
  ? `<div class="activityDetails">${esc(details)}</div>`
  : ''
}

${familyEvents.length
  ? `
<div class="familyEvents">

${familyEvents.map(event => `
<div
  class="bookingItem"
  data-booking-id="${event.id}"
>
${bookingIcon(event.category)} ${esc(event.title)}
</div>
`).join('')}

</div>
`
  : ''
}

</div>

${configured
  ? `
<div style="display:flex;gap:6px">

<button
  class="editActivity"
  data-add-booking="${id}"
  data-date="${date}"
  data-slot="${slot}"
  aria-label="Add booking"
>
＋
</button>

<button
  class="editActivity"
  data-edit="${id}"
  data-date="${date}"
  data-slot="${slot}"
  aria-label="Edit ${name}"
>
✎
</button>

</div>
`
  : ''
}

</div>
`;

}
function setupNote(){return configured?'':`<div class="setup"><b>Preview mode:</b> Connect Supabase using the two Vercel environment variables to activate shared uploads.</div>`}
function photosView(){return `<main>${setupNote()}<div class="galleryHead"><div><div class="eyebrow">Shared memories</div><h2 class="pageTitle" style="margin-bottom:0">Photo gallery</h2><div style="margin-top:8px;color:#64748b;font-size:12px">

📸 ${photos.length} photos

<br>

💾 ${formatBytes(storageUsed())} / 1024 MB used

</div>

<div class="storageBar">

  <i
    style="width:${
      Math.min(
        100,
        storageUsed() /
        (1024*1024*1024) *
        100
      )
    }%"
  ></i>

</div></div><button class="roundAdd" data-add="general">＋</button></div><p style="color:#64748b;font-size:13px">Everyone with the link can view, upload and download.<div class="filters2">

<button
  data-photo-filter="all"
  class="${photoFilter==='all'?'on':''}"
>
All
</button>

<button
  data-photo-filter="Peterborough Jacksons"
  class="${photoFilter==='Peterborough Jacksons'?'on':''}"
>
Peterborough
</button>

<button
  data-photo-filter="St Helens Jacksons"
  class="${photoFilter==='St Helens Jacksons'?'on':''}"
>
St Helens
</button>

</div></p>${loading?'<div class="empty">Loading photos…</div>':`<div class="gallery">${photos.filter(
  p =>
    p.kind === 'general' &&
    (
      photoFilter === 'all' ||
      p.family_name === photoFilter
    )
).map(photoCard).join('')}</div>${photos.filter(
  p =>
    p.kind === 'general' &&
    (
      photoFilter === 'all' ||
      p.family_name === photoFilter
    )
).length?'':'<div class="empty">📸<br><b>No trip photos yet</b><br>Add the first Orlando memory.</div>'}`}</main>`}
function photoUrl(p){return supabase?.storage.from('trip-photos').getPublicUrl(p.storage_path).data.publicUrl||''}
function hasReacted(
  photoId,
  reaction
){

  return reactions.some(
    r =>
      r.photo_id === photoId &&
      r.profile_name === currentUser &&
      r.reaction === reaction
  );

}
function reactionUsers(
  photoId,
  reaction
){

  return reactions.filter(
    r =>
      r.photo_id === photoId &&
      r.reaction === reaction
  );

}
function reactionCount(
  photoId,
  reaction
){

  return reactions.filter(
    r =>
      r.photo_id === photoId &&
      r.reaction === reaction
  ).length;

}

function photoCard(p){const u=photoUrl(p);return `<article
  class="photoCard"
  data-photo-id="${p.id}"
><img src="${u}" alt="${esc(p.caption||'Orlando photo')}" loading="lazy"><div class="photoInfo"><b>${esc(p.caption||'Orlando memory')}</b><div class="meta">${esc(p.family_name)} · ${new Date(p.created_at).toLocaleDateString('en-GB')}</div><div class="likesRow">

<button
  class="reactionChip ${
  hasReacted(
    p.id,
    'love'
  )
    ? 'active'
    : ''
}"
  data-react-photo="${p.id}"
  data-react-type="love"
>
❤️ ${reactionCount(p.id,'love')}
</button>

<button
class="reactionChip ${
  hasReacted(
    p.id,
    'funny'
  )
    ? 'active'
    : ''
}"  data-react-photo="${p.id}"
  data-react-type="funny"
>
😂 ${reactionCount(p.id,'funny')}
</button>

<button
class="reactionChip ${
  hasReacted(
    p.id,
    'awesome'
  )
    ? 'active'
    : ''
}"  data-react-photo="${p.id}"
  data-react-type="awesome"
>
🤩 ${reactionCount(p.id,'awesome')}
</button>

</div></div></article>`}
function foodView(){

  const items = photos.filter(
    p =>
      p.kind === 'food' &&
      (
        foodFilter === 'all' ||
        String(p.rating) === foodFilter
      ) &&
      (
        foodFamily === 'all' ||
        p.family_name === foodFamily
      )
  );

  return `
<main>

${setupNote()}

<div class="galleryHead">

<div>
<div class="eyebrow">Holiday taste test</div>
<h2 class="pageTitle" style="margin-bottom:0">
Food gallery
</h2>
</div>

<button class="roundAdd" data-add="food">
＋
</button>

</div>

<p style="color:#64748b;font-size:13px">
Snap it, name it and give it a star rating.
</p>

<div class="filters2">

${['all','5','4','3','2','1']
  .map(x => `
<button
  data-food-filter="${x}"
  class="${foodFilter===x?'on':''}"
>
${x==='all'?'All food':`${x} ★`}
</button>
`)
.join('')}

</div>

<div class="filters2">

<button
  data-food-family="all"
  class="${foodFamily==='all'?'on':''}"
>
All families
</button>

<button
  data-food-family="Peterborough Jacksons"
  class="${foodFamily==='Peterborough Jacksons'?'on':''}"
>
Peterborough
</button>

<button
  data-food-family="St Helens Jacksons"
  class="${foodFamily==='St Helens Jacksons'?'on':''}"
>
St Helens
</button>

</div>

${loading
  ? '<div class="empty">Loading food…</div>'
  : items.map(foodCard).join('')
}

${
  !items.length && !loading
    ? '<div class="empty">🍽️<br><b>No food photos yet</b><br>Be the first holiday food critic.</div>'
    : ''
}

</main>
`;
}function foodCard(p){const u=photoUrl(p);return `<article
  class="foodCard"
  data-food-id="${p.id}"
><img src="${u}" alt="${esc(p.dish||'Food photo')}" loading="lazy"><div class="foodBody"><div class="stars">${'★'.repeat(p.rating)}<span style="color:#e5e7eb">${'★'.repeat(5-p.rating)}</span></div><h3>${esc(p.dish||'Mystery treat')}</h3><div style="color:#7e22ce;font-weight:900;margin-top:3px">🍴 ${esc(p.restaurant||'Orlando')}</div>${p.notes?`<p>${esc(p.notes)}</p>`:''}<div class="meta">${esc(p.family_name)} · ${new Date(p.created_at).toLocaleDateString('en-GB')}</div><a class="download" href="${u}" target="_blank" download>↧ Open / download</a></div></article>`}
function bookingEditModal(){

  return `
<div class="modal">

<div class="sheet">

<button
  class="close"
  data-close-booking-edit
>
×
</button>

<h2>
✏️ Edit booking
</h2>

<form id="editBookingForm">

<label>
Booking title
</label>

<input
  name="title"
  required
  value="${esc(bookingToEdit.title)}"
>

<label>
Date
</label>

<select name="trip_date">

${schedule.map(day=>`

<option
value="${day.date}"
${day.date===bookingToEdit.trip_date?'selected':''}
>
${fmt(day.date)}
</option>

`).join('')}

</select>

<label>
Time of day
</label>

<select name="slot">

<option value="m"
${bookingToEdit.slot==='m'?'selected':''}>
Morning
</option>

<option value="a"
${bookingToEdit.slot==='a'?'selected':''}>
Afternoon
</option>

<option value="e"
${bookingToEdit.slot==='e'?'selected':''}>
Evening
</option>

</select>

<label>
Category
</label>

<select name="category">

  <option value="food"
    ${bookingToEdit.category==='food'?'selected':''}>
    Dining
  </option>

  <option value="ride"
    ${bookingToEdit.category==='ride'?'selected':''}>
    Ride
  </option>

  <option value="show"
    ${bookingToEdit.category==='show'?'selected':''}>
    Show
  </option>

  <option value="travel"
    ${bookingToEdit.category==='travel'?'selected':''}>
    Travel
  </option>

  <option value="cruise"
    ${bookingToEdit.category==='cruise'?'selected':''}>
    Cruise
  </option>

  <option value="hotel"
    ${bookingToEdit.category==='hotel'?'selected':''}>
    Hotel
  </option>

  <option value="experience"
    ${bookingToEdit.category==='experience'?'selected':''}>
    Experience
  </option>

  <option value="other"
    ${bookingToEdit.category==='other'?'selected':''}>
    Other
  </option>

</select>

<button
  class="primary"
  type="submit"
>
Save changes
</button>

<button
  type="button"
  class="primary"
  id="deleteBookingBtn"
  style="margin-top:10px;background:#b91c1c"
>
Delete booking
</button>

</form>

</div>

</div>
`;
}

function bookingModalView(){

  return `
<div class="modal">

<div class="sheet">

<button
  class="close"
  data-close-booking
>
×
</button>

<h2>
📅 Add booking
</h2>

<form id="bookingForm">

<label>
Booking title
</label>

<input
  name="title"
  required
  placeholder="e.g. Cinderella's Royal Table"
>

<label>
Category
</label>

<select name="category">

  <option value="food">Dining</option>

  <option value="ride">Ride</option>

  <option value="show">Show</option>

  <option value="travel">Travel</option>

  <option value="cruise">Cruise</option>

  <option value="hotel">Hotel</option>

  <option value="experience">Experience</option>

  <option value="other">Other</option>

</select>

<button class="primary" type="submit">
Save booking
</button>

</form>

</div>

</div>
`;
}
function uploadModal(kind){const food=kind==='food';return `<div class="modal"><div class="sheet"><button class="close" data-close>×</button><h2>${food?'🍽️ Add food review':'📸 Add a memory'}</h2><form id="uploadForm"><label>Photo</label><input
  name="file"
  type="file"
  accept="image/*"
  multiple
  required
><label>Who is posting?</label><select name="family"><option>Peterborough Jacksons</option><option>St Helens Jacksons</option><option>Both families</option></select>${food?`<label>Restaurant or location</label><input name="restaurant" required placeholder="e.g. Homecomin’"><label>Dish or drink</label><input name="dish" required placeholder="e.g. Fried chicken"><label>Star rating</label><div class="starPicker">${[1,2,3,4,5].map(n=>`<button type="button" data-rating="${n}" class="${n<=rating?'on':''}">★</button>`).join('')}</div><label>Review</label><textarea name="notes" placeholder="What made it great?"></textarea>`:`<label>Caption</label><textarea name="caption" placeholder="What’s happening?"></textarea>`}<button class="primary" type="submit">Upload for everyone</button><div id="progress"></div></form></div></div>`}
function photoEditModal(){

  return `
<div class="modal">

<div class="sheet">

<button
  class="close"
  data-close-photo
>
×
</button>

<h2>
📸 Edit Photo
</h2>

<form id="photoEditForm">

<label>
Caption
</label>

<textarea name="caption">
${esc(photoToEdit.caption || '')}
</textarea>

<div class="reactionSummary">

<h3>❤️ Loved by</h3>

${
  reactionUsers(photoToEdit.id,'love').length
    ? reactionUsers(photoToEdit.id,'love')
        .map(x => `<div class="reactionUser">${esc(x.profile_name)}</div>`)
        .join('')
    : '<div class="reactionUser">No reactions yet</div>'
}

<h3>😂 Found funny by</h3>

${
  reactionUsers(photoToEdit.id,'funny').length
    ? reactionUsers(photoToEdit.id,'funny')
        .map(x => `<div class="reactionUser">${esc(x.profile_name)}</div>`)
        .join('')
    : '<div class="reactionUser">No reactions yet</div>'
}

<h3>🤩 Thought was awesome by</h3>

${
  reactionUsers(photoToEdit.id,'awesome').length
    ? reactionUsers(photoToEdit.id,'awesome')
        .map(x => `<div class="reactionUser">${esc(x.profile_name)}</div>`)
        .join('')
    : '<div class="reactionUser">No reactions yet</div>'
}

</div>

<a
  class="download"
  href="${photoUrl(photoToEdit)}"
 y:block;
    margin:15px 0;
    font-weight:700;
  "
>
↧ Open / Download Original
</a>

<button
  class="primary"
  type="submit"
>
Save
</button>

<button
  type="button"
  id="deletePhotoBtn"
  class="primary"
  style="
    background:#b91c1c;
    margin-top:10px
  "
>
Delete Photo
</button>

</form>

</div>

</div>
`;

}
function foodEditModal(){

  return `
<div class="modal">

<div class="sheet">

<button
  class="close"
  data-close-food
>
×
</button>

<h2>
🍽️ Edit Food Review
</h2>

<form id="foodEditForm">

<label>
Restaurant
</label>

<input
  name="restaurant"
  value="${esc(foodToEdit.restaurant || '')}"
>

<label>
Dish
</label>

<input
  name="dish"
  value="${esc(foodToEdit.dish || '')}"
>

<label>
Review
</label>

<textarea name="notes">
${esc(foodToEdit.notes || '')}
</textarea>

<button
  class="primary"
  type="submit"
>
Save
</button>

<button
  type="button"
  id="deleteFoodBtn"
  class="primary"
  style="
    background:#b91c1c;
    margin-top:10px
  "
>
Delete Review
</button>

</form>

</div>

</div>
`;

}
function editModal(){const d=schedule.find(x=>x.date===editing.date),key=editing.family==='peterborough'?'p':'s',detailsKey=key==='p'?'pDetails':'sDetails';return `<div class="modal"><div class="sheet"><button class="close" data-close-edit>×</button><h2>✏️ Edit ${editing.family==='peterborough'?families.peterborough:families.sthelens}</h2><p class="editContext">${fmt(editing.date)} · ${slotNames[editing.slot]}</p><form id="editForm"><label>Activity or location</label><input name="location" required value="${esc(d[key][editing.slot])}" placeholder="e.g. EPCOT"><label>Details or time</label><textarea name="details" placeholder="Optional details">${esc(d[detailsKey]?.[editing.slot]||'')}</textarea><label>Universal editing PIN</label><input name="pin" type="password" inputmode="numeric" required autocomplete="off" placeholder="6-digit PIN"><button class="primary" type="submit">Save for everyone</button></form></div></div>`}
function render(){if(!unlocked){document.querySelector('#app').innerHTML=accessScreen();const access=$('#accessForm');if(access)access.onsubmit=unlockApp;return}if(!currentUser){

  document.querySelector('#app')
    .innerHTML = profileModal();

  bind();

  return;

}

document.querySelector('#app').innerHTML=`
<div class="shell">
${header()}
${tab==='plans'?plans():tab==='photos'?photosView():foodView()}
${nav()}
</div>
${modal?uploadModal(modal):''}
${editing?editModal():''}
${bookingModal?bookingModalView():''}
${bookingToEdit?bookingEditModal():''}
${photoToEdit?photoEditModal():''}
${foodToEdit?foodEditModal():''}
`;

bind();

}

function bind(){

const resetUserTest =
  $('#resetUserTest');

if(resetUserTest){

  resetUserTest.onclick = () => {

    localStorage.removeItem(
      'orlando-access'
    );

    localStorage.removeItem(
      'orlando-profile'
    );

    location.reload();

  };

}const profileForm =
  $('#profileForm');

if(profileForm){

  profileForm.onsubmit = e => {

    e.preventDefault();

    const selected =
      new FormData(e.target)
        .get('profile');

    currentUser =
      selected;

    localStorage.setItem(
      'orlando-profile',
      selected
    );

    render();

  };

}

const newProfileForm =
  $('#newProfileForm');

if(newProfileForm){

  newProfileForm.onsubmit =
    createProfile;

}

  document.querySelectorAll('[data-tab]').forEach(b=>{

    b.onclick=()=>{

      tab=b.dataset.tab;

      modal=null;
      editing=null;

      render();

      if(tab!=='plans'){
        loadPhotos();
      }

    };

  });

  document.querySelectorAll('[data-date]').forEach(b=>{

    b.onclick=()=>{

      selected=b.dataset.date;

      render();

    };

  });

document
  .querySelectorAll('.reactionChip')
  .forEach(btn=>{

    btn.onclick = async e => {

      e.preventDefault();

      e.stopPropagation();

      await toggleReaction(
        btn.dataset.reactPhoto,
        btn.dataset.reactType
      );

    };

  });

  document.querySelectorAll('[data-add]').forEach(b=>{

    b.onclick=()=>{

      if(!configured){
        return toast('Connect Supabase first');
      }

      modal=b.dataset.add;

      rating=5;

      render();

    };

  });

  document
    .querySelectorAll('[data-add-booking]')
    .forEach(b=>{

      b.onclick=()=>{

        bookingModal={
          family:b.dataset.addBooking,
          date:b.dataset.date,
          slot:b.dataset.slot
        };

        render();

      };

    });

  document
    .querySelectorAll('[data-close-booking]')
    .forEach(b=>{

      b.onclick=()=>{

        bookingModal=null;

        render();

      };

    });

  document
  .querySelectorAll('[data-close-booking-edit]')
  .forEach(b=>{

    b.onclick=()=>{

      bookingToEdit=null;

      render();

    };

  });

  document.querySelectorAll('[data-close]').forEach(b=>{

    b.onclick=()=>{

      modal=null;

      render();

    };

  });

  document.querySelectorAll('[data-close-edit]').forEach(b=>{

    b.onclick=()=>{

      editing=null;

      render();

    };

  });

  document.querySelectorAll('[data-edit]').forEach(b=>{

    b.onclick=()=>{

      editing={
        family:b.dataset.edit,
        date:b.dataset.date,
        slot:b.dataset.slot
      };

      render();

    };

  });

 document.querySelectorAll('[data-rating]').forEach(b=>{

  b.onclick=()=>{

    rating = +b.dataset.rating;

    document
      .querySelectorAll('[data-rating]')
      .forEach(star=>{

        star.classList.toggle(
          'on',
          +star.dataset.rating <= rating
        );

      });

  };

});

  document.querySelectorAll('[data-food-filter]').forEach(b=>{

    b.onclick=()=>{

      foodFilter=b.dataset.foodFilter;

      render();

    };

  });

  document.querySelectorAll('[data-food-family]').forEach(b=>{

    b.onclick=()=>{

      foodFamily=b.dataset.foodFamily;

      render();

    };

  });

  document.querySelectorAll('[data-photo-filter]').forEach(b=>{

    b.onclick=()=>{

      photoFilter=b.dataset.photoFilter;

      render();

    };

  });
document
.querySelectorAll('[data-booking-id]')
.forEach(b=>{

  b.onclick=()=>{

    bookingToEdit=
      bookings.find(
        x => x.id === b.dataset.bookingId
      );

    render();

  };

});
  document
  .querySelectorAll('[data-photo-id]')
  .forEach(card=>{

    card.onclick=()=>{

      photoToEdit =
        photos.find(
          p =>
            String(p.id) ===
            card.dataset.photoId
        );

      render();

    };

  });

document
  .querySelectorAll('[data-food-id]')
  .forEach(card=>{

    card.onclick=()=>{

      foodToEdit =
        photos.find(
          p =>
            String(p.id) ===
            card.dataset.foodId
        );

      render();

    };

  });
  const form=$('#uploadForm');
  if(form){
    form.onsubmit=upload;
  }

  const edit=$('#editForm');
  if(edit){
    edit.onsubmit=saveSchedule;
  }

const bookingForm=$('#bookingForm');
if(bookingForm){
  bookingForm.onsubmit=saveBooking;
}
const photoEditForm =
  $('#photoEditForm');

if(photoEditForm){

  photoEditForm.onsubmit =
    savePhotoEdit;

}

  const foodEditForm =
  $('#foodEditForm');

if(foodEditForm){

  foodEditForm.onsubmit =
    saveFoodEdit;

}

const editBookingForm=
  $('#editBookingForm');

if(editBookingForm){

  editBookingForm.onsubmit=
    updateBooking;

}
document
  .querySelectorAll('[data-close-photo]')
  .forEach(btn=>{

    btn.onclick=()=>{

      photoToEdit=null;

      render();

    };

  });

document
  .querySelectorAll('[data-close-food]')
  .forEach(btn=>{

    btn.onclick=()=>{

      foodToEdit=null;

      render();

    };

  });

const deletePhotoBtn =
  $('#deletePhotoBtn');

if(deletePhotoBtn){

  deletePhotoBtn.onclick = () => {

    deletePhoto();

  };

}
const deleteFoodBtn =
  $('#deleteFoodBtn');

if(deleteFoodBtn){

  deleteFoodBtn.onclick = () => {

    deleteFood();

  };

}
const switchProfileBtn =
  $('#switchProfileBtn');

if(switchProfileBtn){

  switchProfileBtn.onclick = () => {

    const confirmed =
      confirm(
        'Are you sure you want to change user?'
      );

    if(!confirmed){
      return;
    }

    localStorage.removeItem(
      'orlando-profile'
    );

    currentUser = null;

    render();

  };

}  
const deleteBtn=
  $('#deleteBookingBtn');

if(deleteBtn){

  deleteBtn.onclick=
    deleteBooking;

}

}

async function loadSchedule(){if(!configured)return;const {data,error}=await supabase.from('schedule_slots').select('*');if(error){toast('Schedule connection: '+error.message);return}for(const row of data||[]){const d=schedule.find(x=>x.date===row.trip_date);if(!d)continue;const k=row.family_id==='peterborough'?'p':'s',dk=k==='p'?'pDetails':'sDetails';d[k][row.slot]=row.location;d[dk]??={m:'',a:'',e:''};d[dk][row.slot]=row.details||''}schedule.forEach(day => {

  // Peterborough Jacksons
  if (
    day.date < "2026-08-20" ||
    day.date > "2026-09-03"
  ) {
    day.p = {
      m: "Home",
      a: "Home",
      e: "Home"
    };
  }

  // St Helens Jacksons
  if (
    day.date < "2026-08-14" ||
    day.date > "2026-09-01"
  ) {
    day.s = {
      m: "Home",
      a: "Home",
      e: "Home"
    };
  }

});render()}
async function saveSchedule(e){e.preventDefault();const fd=new FormData(e.target);const args={p_trip_date:editing.date,p_family_id:editing.family,p_slot:editing.slot,p_location:fd.get('location'),p_details:fd.get('details'),p_pin:fd.get('pin')};const {error}=await supabase.rpc('edit_schedule_slot',args);if(error){toast(error.message.includes('Incorrect')?'Incorrect universal PIN':error.message);return}editing=null;toast('Schedule updated for everyone');await loadSchedule()}
async function loadWeather(){

  try{

    const response =
      await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=28.5383&longitude=-81.3792&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto'
      );

    const data =
      await response.json();

    weatherData={};

    data.daily.time.forEach(
      (date,index)=>{

        weatherData[date]={

          high:
            data.daily.temperature_2m_max[index],

          low:
            data.daily.temperature_2m_min[index],

          rain:
            data.daily.precipitation_probability_max[index]

        };

      }
    );

    render();

  }catch(err){

    console.error(err);

  }

}

async function loadBookings(){

  if(!configured)return;

  const {data,error} =
    await supabase
      .from('family_bookings')
      .select('*');

  if(error){

    console.error(error);

    return;

  }

  bookings = data || [];

render();

}
async function saveFoodEdit(e){

  e.preventDefault();

  const fd =
    new FormData(e.target);

  const { error } =
    await supabase
      .from('trip_photos')
      .update({

        restaurant:
          fd.get('restaurant'),

        dish:
          fd.get('dish'),

        notes:
          fd.get('notes')

      })
      .eq('id', foodToEdit.id);

  if(error){

    toast(error.message);

    return;

  }

  foodToEdit = null;

  toast('Food review updated');

  await loadPhotos();

}
async function toggleReaction(
  photoId,
  reactionType
){

  const existing =
    reactions.find(
      r =>
        r.photo_id === photoId &&
        r.profile_name === currentUser &&
        r.reaction === reactionType
    );

  if(existing){

    const result =
      await supabase
        .from('photo_reactions')
        .delete()
        .eq('id', existing.id);

  }else{

    const result =
      await supabase
        .from('photo_reactions')
        .insert({

          photo_id:
            photoId,

          profile_name:
            currentUser,

          reaction:
            reactionType

        });

  }

await loadReactions();

document
  .querySelectorAll('.reactionChip')
  .forEach(chip => {

    const photoId =
      chip.dataset.reactPhoto;

    const reactionType =
      chip.dataset.reactType;

    const count =
      reactionCount(
        photoId,
        reactionType
      );

    const icon = {

      love:'❤️',
      funny:'😂',
      awesome:'🤩'

    }[reactionType];

    chip.textContent =
      `${icon} ${count}`;

    chip.classList.toggle(
      'active',
      hasReacted(
        photoId,
        reactionType
      )
    );

  });

  }

async function savePhotoEdit(e){

  e.preventDefault();

  const fd =
    new FormData(e.target);

  const { error } =
    await supabase
      .from('trip_photos')
      .update({

        caption:
          fd.get('caption')

      })
      .eq('id', photoToEdit.id);

  if(error){

    toast(error.message);

    return;

  }

  photoToEdit = null;

  toast('Photo updated');

  await loadPhotos();

}
async function deleteFood(){

  const { error: storageError } =
    await supabase.storage
      .from('trip-photos')
      .remove([
        foodToEdit.storage_path
      ]);

  if(storageError){

    toast(storageError.message);

    return;

  }

  const { error } =
    await supabase
      .from('trip_photos')
      .delete()
      .eq('id', foodToEdit.id);

  if(error){

    toast(error.message);

    return;

  }

  foodToEdit = null;

  toast('Food review deleted');

  await loadPhotos();

}
async function deletePhoto(){

  const { error: storageError } =
    await supabase.storage
      .from('trip-photos')
      .remove([
        photoToEdit.storage_path
      ]);

  if(storageError){

    toast(storageError.message);

    return;

  }

  const { error } =
    await supabase
      .from('trip_photos')
      .delete()
      .eq('id', photoToEdit.id);

  if(error){

    toast(error.message);

    return;

  }

  photoToEdit = null;

  toast('Photo deleted');

  await loadPhotos();

}
async function deleteBooking(){

  const {error} =
    await supabase
      .from('family_bookings')
      .delete()
      .eq('id',bookingToEdit.id);

  if(error){

    toast(error.message);

    return;

  }

  bookingToEdit=null;
  toast('Booking deleted');
  await loadBookings();

}

async function updateBooking(e){

  e.preventDefault();

  const fd =
    new FormData(e.target);

  const {error} =
    await supabase
      .from('family_bookings')
    .update({

  title:fd.get('title'),
  trip_date:fd.get('trip_date'),
  slot:fd.get('slot'),
  category:fd.get('category')

})

      .eq('id',bookingToEdit.id);

  if(error){

    toast(error.message);

    return;

  }

  bookingToEdit=null;
  toast('Booking updated');
  await loadBookings();

}
async function saveBooking(e){

  e.preventDefault();

  const fd =
    new FormData(e.target);

  const {error} =
    await supabase
      .from('family_bookings')
      .insert({

        trip_date:
          bookingModal.date,

        family_id:
          bookingModal.family,

        slot:
          bookingModal.slot,
        
title:
  fd.get('title'),

category:
  fd.get('category')

      });

  if(error){

    toast(error.message);

    return;

  }

  bookingModal=null;

  await loadBookings();

}
async function createProfile(e){

  e.preventDefault();

  const name =
    new FormData(e.target)
      .get('name')
      .trim();

  if(!name)return;

  const { error } =
    await supabase
      .from('social_profiles')
      .insert({

        display_name:name

      });

 if(error){

  if(
    error.message
      .toLowerCase()
      .includes('duplicate')
  ){

    toast(
      'That profile is already in use. Please add your surname.'
    );

  }else{

    toast(error.message);

  }

  return;

}

  currentUser = name;

  localStorage.setItem(
    'orlando-profile',
    name
  );

  await loadProfiles();

  render();

}
async function loadProfiles(){

  if(!configured)return;

  const { data,error } =
    await supabase
      .from('social_profiles')
      .select('*')
      .order(
        'display_name'
      );

  if(error){

    console.error(error);

    return;

  }

  profiles = data || [];

}
async function loadReactions(){

  if(!configured)return;

  const { data,error } =
    await supabase
      .from('photo_reactions')
      .select('*');

  if(error){

    console.error(error);

    return;

  }

  reactions = data || [];

}
async function loadPhotos(){if(!configured)return;loading=true;render();const {data,error}=await supabase.from('trip_photos').select('*').order('created_at',{ascending:false});loading=false;if(error)toast(error.message);else photos=data||[];render()}
async function resize(
  file,
  maxSize = 1400,
  quality = .82
){

  const bitmap =
    await createImageBitmap(file);

  const scale =
    Math.min(
      1,
      maxSize /
      Math.max(
        bitmap.width,
        bitmap.height
      )
    );

  const canvas =
    document.createElement('canvas');

  canvas.width =
    Math.round(bitmap.width * scale);

  canvas.height =
    Math.round(bitmap.height * scale);

  canvas
    .getContext('2d')
    .drawImage(
      bitmap,
      0,
      0,
      canvas.width,
      canvas.height
    );

  return await new Promise(
    resolve =>
      canvas.toBlob(
        resolve,
        'image/jpeg',
        quality
      )
  );

}
function storageUsed(){

  return photos.reduce(
    (total,p) =>
      total + (p.size_bytes || 0),
    0
  );

}

function formatBytes(bytes){

  const mb =
    bytes /
    1024 /
    1024;

  return `${mb.toFixed(1)} MB`;

}
async function upload(e){

  e.preventDefault();

  const fd =
    new FormData(e.target);

  const files =
    [...fd.getAll('file')]
      .filter(f => f?.size);

  if(files.length > 20){

    toast(
      'Maximum 20 photos per upload'
    );

    return;

  }

  try{

    $('#progress').innerHTML =
      '<div class="progress"><i style="width:25%"></i></div>';

    for(const file of files){

      const blob =
        await resize(

          file,

          modal === 'food'
            ? 800
            : 1400,

          modal === 'food'
            ? .60
            : .82

        );

      const path =
        `${modal}/${Date.now()}-${crypto.randomUUID()}.jpg`;

      let q =
        await supabase.storage
          .from('trip-photos')
          .upload(
            path,
            blob,
            {
              contentType:'image/jpeg'
            }
          );

      if(q.error){
        throw q.error;
      }

      const row = {

        kind:modal,

        storage_path:path,

        size_bytes:blob.size,

        family_name:
          fd.get('family'),

        caption:
          fd.get('caption') || null,

        restaurant:
          fd.get('restaurant') || null,

        dish:
          fd.get('dish') || null,

        rating:
          modal === 'food'
            ? rating
            : null,

        notes:
          fd.get('notes') || null

      };

      q =
        await supabase
          .from('trip_photos')
          .insert(row);

      if(q.error){
        throw q.error;
      }

    }

    $('#progress').innerHTML =
      '<div class="progress"><i style="width:100%"></i></div>';

    modal = null;

    toast('Uploaded for everyone');

    await loadPhotos();

  }catch(err){

    toast(
      err.message ||
      'Upload failed'
    );

  }

}
function toast(msg){const t=document.createElement('div');t.className='toast';t.textContent=msg;document.body.append(t);setTimeout(()=>t.remove(),3500)}
render();
if(configured){

  loadProfiles();

}

if(configured&&unlocked){

loadProfiles();

loadSchedule();

loadBookings();

  loadReactions();

loadWeather();

}
if(configured){

  supabase.channel('schedule-live')
    .on(
      'postgres_changes',
      {
        event:'UPDATE',
        schema:'public',
        table:'schedule_slots'
      },
      ()=>{
        if(unlocked)loadSchedule()
      }
    )
    .subscribe();

  supabase.channel('booking-live')
    .on(
      'postgres_changes',
      {
        event:'*',
        schema:'public',
        table:'family_bookings'
      },
      ()=>{
        if(unlocked)loadBookings()
      }
    )
    .subscribe();

}
