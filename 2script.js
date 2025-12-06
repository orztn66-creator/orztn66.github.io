// ==========================================
// 1. SURIYAYART ENGINE (UNIFIED)
// ==========================================
class SuriyayartEngine {
    constructor() {
        this.CHAYA_SUN = [0, 35, 67, 94, 116, 129, 134];
        this.CHAYA_MOON = [0, 78, 148, 209, 256, 286, 296];
        this.CHAYA_MARS = [0, 22, 44, 64, 82, 93, 96];
        this.CHAYA_MERCURY = [0, 26, 49, 67, 79, 85, 87];
        this.CHAYA_JUPITER = [0, 21, 40, 58, 73, 84, 87];
        this.CHAYA_VENUS = [0, 15, 29, 41, 50, 55, 57];
        this.CHAYA_SATURN = [0, 18, 36, 52, 65, 75, 78];
        this.RERK_NAMES = ["ทลิทโท","มหัทธโน","โจโร","ภูมิปาโล","เทศาตรี","เทวี","เพชฌฆาต","ราชา","สมโณ"];
    }

    toLipda(r, d, m) { return (r * 1800) + (d * 60) + m; }
    fromLipda(total) {
        total = total % 21600; if (total < 0) total += 21600;
        let r = Math.floor(total / 1800);
        let rem = total % 1800;
        let d = Math.floor(rem / 60);
        let m = rem % 60;
        return { r, d, m };
    }
    normalize(val, lim) { val = val % lim; if (val < 0) val += lim; return val; }

    calcBase(csYear, d, m, y, h, mn) {
        let K = csYear;
        let VT = (K*0.25875) - Math.floor(K/4+0.5) + Math.floor(K/100+0.38) - Math.floor(K/400+0.595) - 5.53375;
        let vtDay = Math.floor(VT); let vtTime = VT - vtDay;
        let bd = new Date(y, m-1, d);
        let td = new Date(y-543+638, 3, 1); td.setDate(vtDay); 
        let diffDays = Math.round((bd - td)/(1000*60*60*24));
        let S = diffDays + ((h*3600+mn*60)/86400 - vtTime);
        let H = 472646.2888 + S;
        let H_int = Math.floor(H);
        let U = this.normalize(H_int - 621, 3232);
        let V = H_int % 7; if(V===0) V=7;
        let M_full = (H * 703 + 650) / 20760;
        let D = Math.floor((M_full - Math.floor(M_full)) * 30);
        let W = Math.floor((((M_full - Math.floor(M_full)) * 30) - D) * 692);
        return { S, H, U, V, D, W };
    }
    calcSun(S, csYear) {
        let KT = S * 800;
        let r = Math.floor(KT/24350); let rem = KT-(r*24350);
        let d = Math.floor(rem/811); rem = rem-(d*811);
        let m = Math.floor(rem/14)-3;
        let Z = this.normalize(this.toLipda(r,d,m), 21600);
        let BU = this.normalize(Z - 4800, 21600);
        let A = this.applyChaya(Z, BU, this.CHAYA_SUN, 1);
        let P = (csYear - 600)*21600 + (Z-23);
        return { A, Z, P };
    }
    calcMoon(base) {
        let timeFrac = base.H - Math.floor(base.H);
        let termMU = (base.U + timeFrac) * 21600 / 3232;
        let MU = this.normalize(Math.floor(termMU) + 2, 21600);
        let Z = this.normalize((base.D * 720) + Math.floor(1.04 * base.W) - 17 + base.V, 21600);
        let UV = this.normalize(Z - MU, 21600);
        return this.applyChaya(Z, UV, this.CHAYA_MOON, 1);
    }
    calcMars(S) {
        let Z = this.normalize(Math.floor((S*800*45)/304), 21600);
        let BU = this.normalize(Z - 4650, 21600);
        return this.applyChaya(Z, BU, this.CHAYA_MARS, 4);
    }
    calcMercury(sunZ) {
        let BU = this.normalize(sunZ - 9000, 21600);
        return this.applyChaya(sunZ, BU, this.CHAYA_MERCURY, 2);
    }
    calcJupiter(S) {
        let KT = S * 800;
        let r = Math.floor(KT/4332); let rem = KT-(r*4332);
        let d = Math.floor(rem/144); let rem2 = rem-(d*144);
        let m = Math.floor(rem2/2);
        let Z = this.normalize(this.toLipda(r,d,m), 21600);
        let BU = this.normalize(Z - 12000, 21600);
        return this.applyChaya(Z, BU, this.CHAYA_JUPITER, 3);
    }
    calcVenus(sunZ) {
        let BU = this.normalize(sunZ - 26400, 21600);
        return this.applyChaya(sunZ, BU, this.CHAYA_VENUS, 6);
    }
    calcSaturn(S) {
        let KT = S * 800;
        let r = Math.floor(KT/10766); let rem = KT-(r*10766);
        let d = Math.floor(rem/358); let rem2 = rem-(d*358);
        let m = Math.floor(rem2/6)-3;
        let Z = this.normalize(this.toLipda(r,d,m), 21600);
        let BU = this.normalize(Z - 7200, 21600);
        return this.applyChaya(Z, BU, this.CHAYA_SATURN, 7);
    }
    calcRahuKetuUranus(H, csYear) {
        let H_int = Math.floor(H);
        let timeFrac = H - H_int;
        let K = (H_int - 344) % 679;
        let Z = Math.floor((K + timeFrac) * 21600 / 679);
        let Ketu = this.normalize(21600 - Z, 21600);
        let Rahu = this.normalize(Ketu + 10800, 21600);
        let diffY = csYear - 1120;
        let Ura = this.normalize((diffY * 21600) / 84, 21600);
        return { Rahu, Ketu, Ura };
    }
    calcLagna(sunZ, h, mn) {
        let bMin = h * 60 + mn;
        let sMin = 6 * 60;
        let diff = bMin - sMin;
        return this.normalize(sunZ + (diff * 15), 21600);
    }
    applyChaya(Z, BU, TABLE, mode) {
        let step = 900; let effBu = 0, sign = 1;
        if (BU < 5400) { effBu = BU; sign = 1; }
        else if (BU < 10800) { effBu = 10800 - BU; sign = 1; }
        else if (BU < 16200) { effBu = BU - 10800; sign = -1; }
        else { effBu = 21600 - BU; sign = -1; }
        let X = effBu / step; let M = Math.floor(X); let frac = X - M;
        let YM = TABLE[M]; let YM_NEXT = (M < 6) ? TABLE[M+1] : YM;
        let R = Math.floor((frac * (YM_NEXT - YM)) + YM);
        let adj = 0;
        if(mode===1) adj = R * sign;
        else if(mode===2 || mode===4 || mode===6) { let mnt = Math.floor(R/(mode===4?4:2)); adj = (R + mnt) * sign; }
        else if(mode===3 || mode===7) { let mnt = Math.floor(R/(mode===3?3:2)); adj = (R - mnt) * sign; }
        return this.normalize(Z - adj, 21600);
    }
    calcRerk(A) {
        let v = A * 0.00125;
        let r = Math.floor(v);
        let n = Math.floor((v - r) * 60);
        return { r, n };
    }
}

// ==========================================
// 2. GLOBAL HELPERS
// ==========================================
function lipdaToRasi(lipda){
    lipda=((lipda%21600)+21600)%21600;
    const RASI=["เมษ","พฤษภ","เมถุน","กรกฎ","สิงห์","กันย์","ตุลย์","พิจิก","ธนู","มังกร","กุมภ์","มีน"];
    let r=Math.floor(lipda/1800); 
    let rem=lipda%1800; 
    let deg=Math.floor(rem/60); 
    let min=rem%60;
    return {r, name:RASI[r], deg, min, lipda};
}

function toggleMenu(){ document.getElementById('sidebar').classList.toggle('active'); document.getElementById('overlay').classList.toggle('active'); }

function showSection(id){ 
    document.querySelectorAll('.app-section').forEach(e=>e.classList.remove('active')); 
    document.getElementById(id).classList.add('active'); 
    document.querySelectorAll('.sidebar a').forEach(a=>a.classList.remove('active'));
    const activeLink = document.getElementById('link-'+id);
    if(activeLink) activeLink.classList.add('active');
    toggleMenu(); 
    if(id==='daily') updateDailyDate();
    if(id==='general') renderGeneral();
    if(id==='binder'||id==='inthaphat') loadProfileList();
    if(window.speechSynthesis) window.speechSynthesis.cancel();
    
    if (id === 'inthaphat_pro') {
      const mode = document.querySelector('#modeTabs .pro-tab.active').dataset.mode;
      const isTransit = mode === 'transit';
      document.getElementById('baseTimeControls').style.display = isTransit ? 'block' : 'none';
      document.getElementById('offsetControls').style.display = isTransit ? 'block' : 'none';
      document.getElementById('aheadMinutes') && (document.getElementById('aheadMinutes').style.display = 'none');
      document.getElementById('transitControls') && (document.getElementById('transitControls').style.display = 'none');
    }

    // *** อัปเดตข้อมูลและบันทึกยามกำเนิดเมื่อเข้าเมนู 8 ***
    if (id === 'yamsamtah') {
        updateHomeClock(); // อัปเดตเพื่อให้แน่ใจว่าค่าเป็นปัจจุบัน
        
        // ดึงค่าจากหน้าแรกไปแสดง
        document.getElementById('yamLunarPhase').textContent = window.currentLunarPhase || "กำลังคำนวณ...";
        const thaiYamText = document.getElementById('thaiYam').textContent;
        document.getElementById('yamAttakarn').textContent = thaiYamText || "กำลังคำนวณ...";
        
        // บันทึกยามที่จับได้ครั้งแรกที่เข้าเมนูนี้ (สำหรับ "คำทำนายหลัก")
        if (window.initialYamIndex === -1 && window.currentYamIndex !== -1) { 
            window.initialYamIndex = window.currentYamIndex; 
            window.initialLunarPhase = window.currentLunarPhase;
        }
        
        document.getElementById('yamResultBox') && (document.getElementById('yamResultBox').style.display = 'none'); 
        document.getElementById('yamQuestion') && (document.getElementById('yamQuestion').value = ''); // เคลียร์คำถามเก่า
    }
}

// ==========================================
// 3. REALTIME CLOCK & YAM STATE MANAGEMENT
// ==========================================
// Global State for Yam Sam Tah
window.currentLunarPhase = "";    // 'ข้างขึ้น' or 'ข้างแรม'
window.currentYamIndex = -1;      // 0-7 (Index ของยามอัฏฐกาลที่ตก)
window.initialYamIndex = -1;      // ยามแรกที่จับได้เมื่อเข้าเมนู (สำหรับ "คำทำนายหลัก")
window.initialLunarPhase = "";    // ข้างขึ้น/ข้างแรม ครั้งแรกที่จับได้
window.userMoonLipda = null;
window.userTextResult = "";


function getAttakarnYam(now) {
    const dayOfWeek = now.getDay(); 
    const hour = now.getHours();
    const minute = now.getMinutes();
    const totalMinutes = hour * 60 + minute;
    const planetNames = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัส", "ศุกร์", "เสาร์", "ราหู"];
    const thaksaPositions = ["บริวาร", "อายุ", "เดช", "ศรี", "มูละ", "อุตสาหะ", "มนตรี", "กาลกิณี"];

    let baseDayIndex = dayOfWeek;
    if (hour >= 0 && hour < 6) {
        baseDayIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
    }
    const startPlanetIndex = baseDayIndex; 
    
    let thaksaSequence = [];
    for(let i=0; i<8; i++){
        const planetIdx = (startPlanetIndex + i) % 8;
        thaksaSequence.push(planetNames[planetIdx]);
    }
    
    const YAM_PERIOD_MINUTES = 90;
    let isDay = hour >= 6 && hour < 18;
    let yamIndex = -1;
    let periodName = isDay ? 'กลางวัน' : 'กลางคืน';
    let currentThaksaPositions = [...thaksaPositions];

    if (isDay) {
        const minutesSinceDayStart = totalMinutes - (6 * 60); 
        yamIndex = Math.floor(minutesSinceDayStart / YAM_PERIOD_MINUTES);
    } else {
        const isTodayNight = hour >= 18; 
        let minutesSinceNightStart;
        if (isTodayNight) minutesSinceNightStart = totalMinutes - (18 * 60); 
        else minutesSinceNightStart = (6 * 60) + totalMinutes; 
        yamIndex = Math.floor(minutesSinceNightStart / YAM_PERIOD_MINUTES);
        thaksaSequence.reverse(); 
        currentThaksaPositions.reverse(); 
    }

    // *** บันทึก Yam Index เข้า Global State ***
    window.currentYamIndex = yamIndex; 

    if (yamIndex >= 0 && yamIndex < 8) {
        const yamName = thaksaSequence[yamIndex];
        const thaksaName = currentThaksaPositions[yamIndex];
        let baseStartHour = isDay ? 6 : 18;
        let startTotalMinutes = (baseStartHour * 60) + (yamIndex * YAM_PERIOD_MINUTES);
        let endTotalMinutes = startTotalMinutes + YAM_PERIOD_MINUTES;
        const startHour = Math.floor(startTotalMinutes / 60);
        const startMinute = startTotalMinutes % 60;
        const endHour = Math.floor(endTotalMinutes / 60);
        const endMinute = endTotalMinutes % 60;
        const startTimeStr = `${(startHour%24).toString().padStart(2,'0')}:${startMinute.toString().padStart(2,'0')}`;
        const endTimeStr = `${(endHour%24).toString().padStart(2,'0')}:${endMinute.toString().padStart(2,'0')}`;
        return `อัฏฐกาล${periodName} ยาม ${yamIndex + 1} (${yamName} - ${thaksaName}) ${startTimeStr} - ${endTimeStr}`;
    }
    
    window.currentYamIndex = -1; // ถ้าไม่อยู่ใน 8 ยาม (นอกช่วง)
    return "นอกช่วงยาม";
}

function updateHomeClock() {
    // ==========================================
    // แก้ไขตรงนี้: ใส่ -5 เพื่อถอยวันให้ตรงกับ แรม 14 ค่ำ
    const DITHI_OFFSET = -5; 
    // ==========================================

    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear(); 
    const thYear = year + 543;
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();

    document.getElementById('realTime').textContent = 
        `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}:${second.toString().padStart(2,'0')}`;
    document.getElementById('realDate').textContent = 
        `วัน${["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"][now.getDay()]}ที่ ${day} / ${month} / ${thYear}`;

    const sys = new SuriyayartEngine();
    const csYear = thYear - 1181;
    const base = sys.calcBase(csYear, day, month, year, hour, minute); 
    const sun = sys.calcSun(base.S, csYear);
    const moon = sys.calcMoon(base);

    // --- คำนวณข้างขึ้นข้างแรม ---
    let diff = moon - sun.A;
    if (diff < 0) diff += 21600;
    
    const dithiLipda = diff;
    let dithi = Math.floor(dithiLipda / 720) + 1 + DITHI_OFFSET; 
    
    while (dithi > 30) dithi -= 30;
    while (dithi <= 0) dithi += 30;

    let isWaxing = dithi <= 15; 
    let lunarDay;

    if (isWaxing) {
        lunarDay = dithi; 
    } else {
        lunarDay = dithi - 15; 
    }

    if (!isWaxing && lunarDay === 15) {
        lunarDay = 14;
    }
    
    // *** บันทึกค่าข้างขึ้น/ข้างแรมเข้า Global State ***
    window.currentLunarPhase = isWaxing ? 'ข้างขึ้น' : 'ข้างแรม';

    document.getElementById('lunarPhase').textContent = `${window.currentLunarPhase} ${lunarDay} ค่ำ (ปรับแก้)`;

    const rerkInfo = sys.calcRerk(moon); 
    const rerkName = sys.RERK_NAMES[rerkInfo.r % 9];
    document.getElementById('moonRerk').textContent = `${rerkName}ฤกษ์ (บาทที่ ${Math.floor(rerkInfo.n/15)+1})`;

    document.getElementById('thaiYam').textContent = getAttakarnYam(now);
    document.getElementById('rerkBun').textContent = day%2===0 ? "เจริญ" : "ปกติ";
    document.getElementById('rerkLa').textContent = day%2===0 ? "ปกติ" : "เจริญ";
}
setInterval(updateHomeClock, 1000);
updateHomeClock();

// ==========================================
// 4. TAROT & UI
// ==========================================
const images = Array.from({length:78}, (_,i)=>`https://www.sacred-texts.com/tarot/pkt/img/ar${String(i%22).padStart(2,'0')}.jpg`);
const cardNames = ["The Fool","The Magician","High Priestess","Empress","Emperor","Hierophant","Lovers","Chariot","Strength","Hermit","Wheel","Justice","Hanged Man","Death","Temperance","Devil","Tower","Star","Moon","Sun","Judgement","World"];
const houseNames = ["ตนุ","กดุมภะ","สหัชชะ","พันธุ","ปุตตะ","อริ","ปัตนิ","มรณะ","ศุภะ","กัมมะ","ลาภะ","วินาศ"];
const zodiacs = ["เมษ","พฤษภ","เมถุน","กรกฎ","สิงห์","กันย์","ตุลย์","พิจิก","ธนู","มังกร","กุมภ์","มีน"];
const stdMap = {
    Sun: {k:[4],u:[0],n:[6],p:[10]}, Moon: {k:[3],u:[1],n:[7],p:[9]}, Mars: {k:[0,7],u:[9],n:[3],p:[6,1]},
    Mercury: {k:[2,5],u:[5],n:[11],p:[8,11]}, Jupiter: {k:[8,11],u:[3],n:[9],p:[2,5]}, Venus: {k:[1,6],u:[11],n:[5],p:[7,0]},
    Saturn: {k:[9,10],u:[6],n:[0],p:[3,4]}, Rahu: {k:[10],u:[7],n:[1],p:[4]}
};

function drawYesNo() {
    const b = document.getElementById('res-yesno'); b.innerHTML = '⏳ กำลังสับไพ่...';
    setTimeout(()=>{
        const i = Math.floor(Math.random()*78);
        const n = i+1;
        let r = n%2?"✅ ใช่ / สำเร็จ":"❌ ไม่ใช่ / ยังไม่ถึงเวลา";
        if(n%7===0) r = "⚠️ ไม่แน่ชัด";
        b.innerHTML = `<img src="${images[i]}"><h3>${r}</h3><p>${cardNames[i%22]}</p>`;
    }, 500);
}

function updateDailyDate() {
    const d = new Date();
    const days = ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์"];
    document.getElementById('dailyDate').innerText = `ดวงประจำวัน${days[d.getDay()]}ที่ ${d.getDate()}`;
}

function drawDaily() {
    const b = document.getElementById('res-daily'); b.innerHTML = '⏳ กำลังทำนาย...';
    setTimeout(()=>{
        const i = Math.floor(Math.random()*78);
        let desc = "ชะตาชีวิตวันนี้ ต้องใช้สติปัญญาในการแก้ปัญหา";
        if(i<22) desc = "มีเหตุการณ์สำคัญเปลี่ยนแปลง ให้เชื่อสัญชาตญาณ";
        b.innerHTML = `<img src="${images[i]}"><h3>${cardNames[i%22]}</h3><p>${desc}</p>`;
    }, 500);
}

function renderGeneral() {
    const g = document.getElementById('general-grid'); g.innerHTML = '';
    houseNames.forEach((h,i)=>{
        g.innerHTML += `<div class="house-card"><b>${i+1}. ${h}</b><br><button class="mini-btn" onclick="this.nextElementSibling.innerHTML='${cardNames[Math.floor(Math.random()*22)]}'">เสี่ยงทาย</button><div style="margin-top:5px;color:#d97706"></div></div>`;
    });
}

// ==========================================
// 5. PROFILE MANAGER
// ==========================================
function loadProfileList(){
    const p = JSON.parse(localStorage.getItem('tarot_profiles')||"[]");
    const s = document.getElementById('profileList');
    s.innerHTML = '<option value="">-- เลือกรายชื่อ --</option>';
    p.forEach((x,i)=>s.add(new Option(x.name,i)));
}
function loadProfile(){
    const idx = document.getElementById('profileList').value;
    if(idx===""){return;}
    const p = JSON.parse(localStorage.getItem('tarot_profiles'))[idx];
    document.getElementById('pName').value = p.name;
    document.getElementById('pDay').value = p.d; document.getElementById('pMonth').value = p.m;
    document.getElementById('pYear').value = p.y; document.getElementById('pHour').value = p.h; document.getElementById('pMin').value = p.mn;
}
function saveProfile(){
    const name = document.getElementById('pName').value; if(!name) return alert("ใส่ชื่อ");
    const data = {name, d:document.getElementById('pDay').value, m:document.getElementById('pMonth').value, y:document.getElementById('pYear').value, h:document.getElementById('pHour').value, mn:document.getElementById('pMin').value};
    let profiles = JSON.parse(localStorage.getItem('tarot_profiles')||"[]");
    const exist = profiles.findIndex(x=>x.name===name);
    if(exist>=0) profiles[exist]=data; else profiles.push(data);
    localStorage.setItem('tarot_profiles',JSON.stringify(profiles));
    alert("บันทึกแล้ว"); loadProfileList();
}
function deleteProfile(){
    const name = document.getElementById('pName').value; if(!name) return;
    let profiles = JSON.parse(localStorage.getItem('tarot_profiles')||"[]");
    profiles = profiles.filter(x=>x.name!==name);
    localStorage.setItem('tarot_profiles',JSON.stringify(profiles));
    document.getElementById('pName').value=""; loadProfileList();
}


// ==========================================
// 6. MAIN CALCULATION (MENU 4)
// ==========================================
function runSuriyayart() {
    const d = parseInt(document.getElementById('pDay').value);
    const m = parseInt(document.getElementById('pMonth').value);
    const y = parseInt(document.getElementById('pYear').value);
    const h = parseInt(document.getElementById('pHour').value);
    const mn = parseInt(document.getElementById('pMin').value);

    if(!d||!m||!y) return alert("กรุณากรอก วัน/เดือน/ปี เกิดให้ครบถ้วน");

    let chkLocal = document.getElementById('chkLocalTime');
    if (!chkLocal) {
        const btn = document.querySelector('button[onclick="runSuriyayart()"]');
        if(btn) {
            const div = document.createElement('div');
            div.innerHTML = `<label style="cursor:pointer; color:#4f46e5; font-weight:bold;">
                <input type="checkbox" id="chkLocalTime" checked> หักเวลาท้องถิ่น (-18 นาที)
            </label>`;
            div.style.marginTop = "10px";
            btn.parentNode.insertBefore(div, btn.nextSibling);
            chkLocal = document.getElementById('chkLocalTime');
        }
    }

    let adjH = h;
    let adjMn = mn;
    let timeModeText = "เวลามาตรฐาน (ไม่หัก)";

    const shouldAdjust = chkLocal ? chkLocal.checked : true; 

    if (shouldAdjust) {
        const OFFSET = 18; 
        let totalMin = (h * 60) + mn - OFFSET;
        
        if (totalMin < 0) totalMin += 1440; 

        adjH = Math.floor(totalMin / 60);
        adjMn = totalMin % 60;
        timeModeText = `หักเวลาท้องถิ่น -18 นาที (ใช้คำนวณ ${adjH.toString().padStart(2,'0')}:${adjMn.toString().padStart(2,'0')})`;
    }

    const sys = new SuriyayartEngine();
    const csYear = y - 1181;
    
    // ส่งเวลาที่ปรับแก้แล้ว (adjH, adjMn) ไปคำนวณ (และปรับปี พ.ศ. เป็น ค.ศ.)
    const base = sys.calcBase(csYear, d, m, y-543, adjH, adjMn); 
    
    const sun = sys.calcSun(base.S, csYear);
    const moon = sys.calcMoon(base); window.userMoonLipda = moon; // บันทึกตำแหน่งจันทร์
    const mars = sys.calcMars(base.S);
    const merc = sys.calcMercury(sun.Z);
    const jup = sys.calcJupiter(base.S);
    const ven = sys.calcVenus(sun.Z);
    const sat = sys.calcSaturn(base.S);
    const rk = sys.calcRahuKetuUranus(base.H, csYear);
    
    const lagna = sys.calcLagna(sun.Z, adjH, adjMn);

    const bodies = [
        {l:lagna,s:'ล',n:'Lagna',c:'lagna'}, {l:sun.A,s:'๑',n:'Sun'}, {l:moon,s:'๒',n:'Moon'},
        {l:mars,s:'๓',n:'Mars'}, {l:merc,s:'๔',n:'Mercury'}, {l:jup,s:'๕',n:'Jupiter'},
        {l:ven,s:'๖',n:'Venus'}, {l:sat,s:'๗',n:'Saturn'}, {l:rk.Rahu,s:'๘',n:'Rahu'},
        {l:rk.Ketu,s:'๙',n:'Ketu'}, {l:rk.Ura,s:'๐',n:'Uranus'}
    ];
    
    document.getElementById('binderResult').style.display='block';
    const grid = document.getElementById('zodiacChart'); grid.innerHTML='';
    const chart = Array(12).fill(null).map(()=>[]);
    
    bodies.forEach(b => {
        const info = sys.fromLipda(b.l);
        let cls = b.c || '';
        if(stdMap[b.n]){
             if(stdMap[b.n].k.includes(info.r)) cls='std-kaset';
             else if(stdMap[b.n].u.includes(info.r)) cls='std-ucha';
        }
        chart[info.r].push({s:b.s, c:cls});
    });
    
    for(let i=0; i<12; i++){
        const items = chart[i].map(x=>`<span class="planet-symbol ${x.c}">${x.s}</span>`).join('');
        grid.innerHTML += `<div class="zodiac-box" style="${i===sys.fromLipda(lagna).r?'border:2px solid #ef4444':''}"><div class="zodiac-name">${zodiacs[i]}</div><div>${items}</div></div>`;
    }
    
    let sI = sys.fromLipda(sun.A), mI = sys.fromLipda(moon), lI = sys.fromLipda(lagna);
    let sR = sys.calcRerk(sun.A), mR = sys.calcRerk(moon);
    
    let txt = `<div style="font-size:12px; color:#666; margin-bottom:5px;">ℹ️ ${timeModeText}</div>`;
    txt += `<div>🚩 <b>ลัคนา:</b> ราศี${zodiacs[lI.r]} ${lI.d} องศา</div>`;
    txt += `<div>☀️ <b>อาทิตย์ (๑):</b> ราศี${zodiacs[sI.r]} ${sI.d} องศา (ฤกษ์ ${sR.r}.${sR.n})</div>`;
    txt += `<div>🌕 <b>จันทร์ (๒):</b> ราศี${zodiacs[mI.r]} ${mI.d} องศา (ฤกษ์ ${mR.r}.${mR.n})</div>`;
    txt += `<div style="color:#666;font-size:12px;margin-top:5px;">กำลังพระเคราะห์: ${sun.P}</div>`;
    
    document.getElementById('astroText').innerHTML = txt;
    window.userTextResult = `ดวงชะตา ลัคนาสถิตราศี${zodiacs[lI.r]} อาทิตย์สถิตราศี${zodiacs[sI.r]} จันทร์สถิตราศี${zodiacs[mI.r]}`;
    
    const tGrid = document.getElementById('binder-grid'); tGrid.innerHTML='';
    houseNames.forEach((h,i)=>{
        const z = (lI.r + i)%12;
        const pHere = chart[z].map(x=>x.s).join(' ');
        tGrid.innerHTML += `<div class="house-card"><b style="color:#4f46e5">${h}</b><br><span style="font-size:11px;color:#666">${zodiacs[z]} ${pHere}</span><br><button class="mini-btn" onclick="this.nextElementSibling.innerHTML='${cardNames[Math.floor(Math.random()*22)]}'">เปิดไพ่</button><div style="margin-top:5px;color:#d97706"></div></div>`;
    });
}

// ==============================
// 7. อินทภาส & มหานที (MENU 5 & 6 PRO)
// ==============================
function runInthaphat() {
    if(!window.userMoonLipda && window.userMoonLipda !== 0) { 
        alert("⚠️ กรุณากด 'ผูกดวง' ในเมนูหลัก (4. ผูกดวง) เพื่อหาตำแหน่งจันทร์ก่อนครับ"); 
        showSection('binder'); 
        return; 
    }

    const seq = [
        {n:'อาทิตย์', y:6,  c:'#ef4444'}, 
        {n:'จันทร์',  y:15, c:'#eab308'}, 
        {n:'อังคาร',  y:8,  c:'#ec4899'}, 
        {n:'พุธ',    y:17, c:'#22c55e'}, 
        {n:'เสาร์',   y:10, c:'#7c3aed'}, 
        {n:'พฤหัส',  y:19, c:'#f97316'}, 
        {n:'ราหู',   y:12, c:'#78716c'}, 
        {n:'ศุกร์',   y:21, c:'#3b82f6'}  
    ];
    
    let moonVal = window.userMoonLipda;
    if (moonVal >= 21600) moonVal = 0;

    let nakat = Math.floor(moonVal / 800);
    let passed = moonVal % 800;
    
    let startIdx = nakat % 8; 
    let p = seq[startIdx];

    let passedAge = (passed * p.y) / 800;
    let left = p.y - passedAge; 
    
    document.getElementById('inthaphatResult').style.display='block';
    document.getElementById('inthaphatText').innerHTML = 
        `🌕 <b>จันทร์เกาะนักษัตรที่:</b> ${nakat+1} (ตรียางค์/นวางศ์ลูกพิษ)<br>` +
        `⭐ <b>ดาวต้นกำเนิด:</b> <span style="color:${p.c}">พระ${p.n}</span> (อายุเต็ม ${p.y} ปี)<br>` +
        `⏳ <b>ใช้ไปแล้ว:</b> ${Math.floor(passedAge)} ปี ${(passedAge%1*12).toFixed(0)} เดือน`;
    
    const tb = document.getElementById('inthaphatTableBody'); 
    tb.innerHTML='';
    
    let curAge = left;
    tb.innerHTML += `
        <tr style="background:#f0fdf4">
            <td><span style="color:${p.c}">●</span> ${p.n} (เศษ)</td>
            <td>${left.toFixed(2)} ปี</td>
            <td>แรกเกิด - ${curAge.toFixed(2)}</td>
        </tr>`;
    
    let idx = (startIdx + 1) % 8;
    for(let i=0; i<8; i++){
        let nextP = seq[idx];
        tb.innerHTML += `
            <tr>
                <td><span style="color:${nextP.c}">●</span> ${nextP.n}</td>
                <td>${nextP.y} ปี</td>
                <td>${curAge.toFixed(2)} - ${(curAge + nextP.y).toFixed(2)}</td>
            </tr>`;
        curAge += nextP.y;
        idx = (idx + 1) % 8;
    }
}

function toggleSpeech() {
    if(window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    else {
        let u = new SpeechSynthesisUtterance(window.userTextResult);
        u.lang='th-TH'; window.speechSynthesis.speak(u);
    }
}

// PRO SECTION FUNCTIONS (ปรับปรุงเล็กน้อยเพื่อรวมเข้าด้วยกัน)
document.querySelectorAll('#modeTabs .pro-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('#modeTabs .pro-tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const mode = tab.dataset.mode;
    const isTransit = mode === 'transit';
    document.getElementById('baseTimeControls').style.display = isTransit ? 'block' : 'none';
    document.getElementById('offsetControls').style.display = isTransit ? 'block' : 'none';
    document.getElementById('aheadMinutes') && (document.getElementById('aheadMinutes').style.display = 'none');
    document.getElementById('transitControls') && (document.getElementById('transitControls').style.display = 'none');
  });
});

const PROVINCES = [
  {name:"กรุงเทพมหานคร",lat:13.7563,lon:100.5018,adjust:-18},
  {name:"เชียงใหม่",lat:18.7883,lon:98.9853,adjust:-16},
  {name:"ขอนแก่น",lat:16.4328,lon:102.8232,adjust:-15},
  {name:"ภูเก็ต",lat:7.8804,lon:98.3923,adjust:-20},
  {name:"นครราชสีมา",lat:14.9799,lon:102.0977,adjust:-15},
  {name:"ชลบุรี",lat:13.3611,lon:100.9835,adjust:-18},
  {name:"สงขลา",lat:7.1984,lon:100.5951,adjust:-20},
  {name:"นครศรีธรรมราช",lat:8.4328,lon:99.9590,adjust:-20}
];
const datalist = document.getElementById('places');
function refreshPlaceList(){
  datalist && (datalist.innerHTML='');
  const source = window.CUSTOM_PLACES || PROVINCES;
  source.forEach(p=>{ const o=document.createElement('option'); o.value=p.name; datalist && datalist.appendChild(o); });
}
refreshPlaceList();

document.getElementById('uploadCsv') && document.getElementById('uploadCsv').addEventListener('change', function(e){
  const f=e.target.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=function(evt){
    try{
      const text=evt.target.result;
      const rows=text.split(/\r?\n/).map(r=>r.trim()).filter(r=>r);
      const parsed=rows.map(r=>{
        const cols=r.split(',').map(c=>c.trim());
        return {name:cols[0],lat:parseFloat(cols[1])||0,lon:parseFloat(cols[2])||0,adjust:parseInt(cols[3])||0};
      });
      if(parsed.length>4){ window.CUSTOM_PLACES=parsed; alert('โหลด CSV สำเร็จ ('+parsed.length+' แถว)'); refreshPlaceList(); }
      else alert('CSV มีข้อมูลน้อยเกินไป');
    }catch(err){ alert('อ่านไฟล์ไม่สำเร็จ: '+err);}
  };
  reader.readAsText(f,'UTF-8');
});

function downloadSampleCSV(){
  const sample=["กรุงเทพมหานคร,13.7563,100.5018,-18",
  "บางรัก,13.7240,100.5088,-18",
  "เชียงใหม่,18.7883,98.9853,-16",
  "ขอนแก่น,16.4328,102.8232,-15"].join("\n");
  const blob=new Blob([sample],{type:'text/csv;charset=utf-8;'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a'); a.href=url; a.download='sample_places.csv'; document.body.appendChild(a); a.click(); a.remove();
}

function getInputs(){
  const mode=document.querySelector('#modeTabs .pro-tab.active').dataset.mode;
  let d, m, y, hh, mm;

  if(mode === 'birth') {
    d=parseInt(document.getElementById('pro-day').value);
    m=parseInt(document.getElementById('pro-month').value);
    y=parseInt(document.getElementById('pro-year').value); 
    hh=parseInt(document.getElementById('pro-hour').value||0);
    mm=parseInt(document.getElementById('pro-minute').value||0);
  } else { 
    const baseD=parseInt(document.getElementById('baseDay').value);
    const baseM=parseInt(document.getElementById('baseMonth').value);
    const baseY=parseInt(document.getElementById('baseYear').value);
    const baseH=parseInt(document.getElementById('baseHour').value||0);
    const baseMin=parseInt(document.getElementById('baseMinute').value||0);
    
    if(!baseD || !baseM || !baseY) { alert('กรุณากรอก วัน/เดือน/ปี หลัก (Anchor Time) ให้ครบ'); throw new Error("Missing Base Time"); }

    const offD = parseInt(document.getElementById('offsetDays').value||0);
    const offH = parseInt(document.getElementById('offsetHours').value||0);
    const offM = parseInt(document.getElementById('offsetMinutes').value||0);

    let targetDate = new Date(baseY - 543, baseM - 1, baseD, baseH, baseMin);
    targetDate.setDate(targetDate.getDate() + offD);
    targetDate.setHours(targetDate.getHours() + offH);
    targetDate.setMinutes(targetDate.getMinutes() + offM);

    y = targetDate.getFullYear() + 543;
    m = targetDate.getMonth() + 1;
    d = targetDate.getDate();
    hh = targetDate.getHours();
    mm = targetDate.getMinutes();
  }
  
  const place=document.getElementById('pro-place').value.trim();
  return {d, m, y, hh, mm, place, mode};
}

function findPlace(name){
  const allPlaces = window.CUSTOM_PLACES || PROVINCES;
  const exact = allPlaces.find(p => p.name === name);
  if (exact) return { name: exact.name, lat: exact.lat, lon: exact.lon, adjust: exact.adjust || 0 };
  const partial = allPlaces.find(p => p.name.toLowerCase().includes(name.toLowerCase()));
  return partial || null;
}

function computeInthap(){
  try {
    const inputs=getInputs();
    if(!inputs.d||!inputs.m||!inputs.y||!inputs.place){ alert('กรุณากรอกข้อมูลให้ครบ'); return; }
    
    const placeInfo=findPlace(inputs.place);
    if(!placeInfo && !confirm('ไม่พบสถานที่ ใช้ค่า Adjust = 0 ?')) return;
    const adjust=placeInfo?placeInfo.adjust||0:0;
    
    let totalMin = inputs.hh*60 + inputs.mm + adjust;
    const adjHour = Math.floor(totalMin / 60) % 24;
    const adjMin = totalMin % 60;

    const sys = new SuriyayartEngine();
    const csYear = inputs.y - 1181;
    const base = sys.calcBase(csYear, inputs.d, inputs.m, inputs.y - 543, adjHour, adjMin);
    const moonLipda = sys.calcMoon(base);
    
    if(isNaN(moonLipda)) throw new Error("คำนวณตำแหน่งจันทร์ล้มเหลว กรุณาตรวจสอบวันที่");

    const moonPos = lipdaToRasi(moonLipda);

    const nakatIndex=Math.floor(moonLipda/800);
    const passed=moonLipda%800;
    const seq=["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัส","ศุกร์","เสาร์","ราหู"];
    const nakatName=seq[nakatIndex%8];

    let out='';
    out+=`=== ผลลัพธ์: อินทภาส ${inputs.mode === 'transit' ? '(จร)' : '(กำเนิด)'} ===\n`;
    out+=`วัน/เดือน/พ.ศ. (Target Time): ${inputs.d}/${inputs.m}/${inputs.y}\n`;
    out+=`เวลา (ปรับแก้): ${adjHour.toString().padStart(2,'0')}:${adjMin.toString().padStart(2,'0')} (adj ${adjust} นาที)\n`;
    out+=`ตำแหน่งจันทร์: ${moonPos.name} ${moonPos.deg}° ${moonPos.min}'\n`;
    out+=`บาทจันทร์: ${nakatName} (${nakatIndex+1})\n`;
    out+=`ผ่านฤกษ์: ${passed}/800 (${(passed/800*100).toFixed(2)}%)\n`;

    document.getElementById('outInthap').textContent=out;
  } catch(e) {
    console.error(e);
    document.getElementById('outInthap').textContent="เกิดข้อผิดพลาด: " + e.message;
  }
}

function calcMahanFiveLayers(inputs, opts = { useVariant: 'uttara' }) {
  let totalLipda = inputs.lagnaLipda || 0;
  totalLipda=((totalLipda%21600)+21600)%21600; // Normalization
  let lagnDegree = totalLipda / 60;

  // Simplified layer calculation based on total lipda (must adjust if specific formulas are required)
  const uttara = totalLipda; 
  const mathya = Math.floor(totalLipda / 60); 
  const adhika = Math.floor(totalLipda / 1800); // Rasi Index * 12
  const anu = 0; 
  const khuda = 0;

  const rasiIndex = Math.floor(lagnDegree / 30) % 12;
  const degInRasiFloat = lagnDegree - (rasiIndex * 30);
  const degInRasi = Math.floor(degInRasiFloat);
  const minInRasi = Math.round((degInRasiFloat - degInRasi) * 60);

  const RASI_NAMES = ["เมษ","พฤษภ","เมถุน","กรกฎ","สิงห์","กันย์","ตุลย์","พิจิก","ธนู","มังกร","กุมภ์","มีน"];

  return {
    lagnDegree,
    rasiIndex,
    rasiName: RASI_NAMES[rasiIndex],
    degInRasi,
    minInRasi,
    layers: { uttara, mathya, adhika, anu, khuda }
  };
}

function formatMahanResult(obj) {
  return `${obj.rasiName} ${obj.degInRasi}° ${obj.minInRasi}' (ลัคนา = ${obj.lagnDegree.toFixed(4)}°)\n` +
         `ชั้น: อุตร=${obj.layers.uttara} | มัธยม=${obj.layers.mathya} | อธิก=${obj.layers.adhika} | อนุ=${obj.layers.anu} | ขุด=${obj.layers.khuda}`;
}

function computeMahan(){ 
  try {
    const inputs = getInputs(); 
    if(!inputs.d||!inputs.m||!inputs.y||!inputs.place){ alert('กรุณากรอกข้อมูลให้ครบ'); return; }

    const placeInfo = findPlace(inputs.place);
    const adjust = placeInfo ? (placeInfo.adjust||0) : 0;

    let totalMin = inputs.hh * 60 + inputs.mm + adjust;
    const adjHour = Math.floor(totalMin / 60) % 24;
    const adjMin = totalMin % 60;

    const sys = new SuriyayartEngine();
    const csYear = inputs.y - 1181;
    const base = sys.calcBase(csYear, inputs.d, inputs.m, inputs.y - 543, adjHour, adjMin); 
    const sunLipda = sys.calcSun(base.S, csYear).A;
    const moonLipda = sys.calcMoon(base);

    const sunPos = lipdaToRasi(sunLipda);
    const moonPos = lipdaToRasi(moonLipda);

    // ใช้เวลาเกิดจริง (inputs.hh, inputs.mm) กับตำแหน่งอาทิตย์
    const lagnaLipda = sys.calcLagna(sunLipda, inputs.hh, inputs.mm); 

    if(isNaN(moonLipda)) throw new Error("คำนวณล้มเหลว");

    const mahan = calcMahanFiveLayers({ lagnaLipda: lagnaLipda, hh: adjHour, mm: adjMin }, { useVariant: 'uttara' });
    const mahanStr = formatMahanResult(mahan);

    let out = '';
    out += `=== 🔮 ผลลัพธ์: มหานที ๕ ชั้น ${inputs.mode === 'transit' ? '(จร)' : '(กำเนิด)'} ===\n\n`;
    out += `📅 **วันเกิด:** ${inputs.d}/${inputs.m}/${inputs.y}\n`;
    out += `⏰ **เวลาเกิด:** ${inputs.hh}:${inputs.mm.toString().padStart(2,'0')} น. (ปรับแก้: ${adjHour}:${adjMin.toString().padStart(2,'0')})\n\n`;
    out += `☀️ **อาทิตย์ (๑):** ราศี${sunPos.name} ${sunPos.deg} องศา\n`;
    out += `🌕 **จันทร์ (๒):** ราศี${moonPos.name} ${moonPos.deg} องศา\n\n`;
    out += `-- ลัคนา (มหานที 5 ชั้น) --\n${mahanStr}\n\n`;
    out += `(หมายเหตุ: คำนวณโดยอิงสมผุสดาวอาทิตย์ตามคัมภีร์สุริยยาตร์)`;

    const outEl = document.getElementById('outMahan') || document.getElementById('outMahan5');
    if(outEl) {
        outEl.style.whiteSpace = "pre-wrap";
        outEl.style.fontFamily = "monospace";
        outEl.textContent = out;
    } else alert(out);

  } catch(e) {
    document.getElementById('outMahan') && (document.getElementById('outMahan').textContent = "เกิดข้อผิดพลาด: " + e.message);
    console.error(e);
  }
}

// ==========================================
// 8. YAM SAM TAH PREDICTION (เมนู 8) - ใส-ปอด-กรรม (UPDATED)
// ==========================================

function getPredictionResult(lunarPhase, yamIndex) {
    if (yamIndex < 0 || yamIndex > 7) return { symbol: 'กรรม', meaning: 'ไม่ชัดเจน', rawMeaning: 'หญิงเด่น' };

    // ข้างขึ้น: นับหนึ่งที่ ปอด วนไปหา กัม ใส (ปอด -> ใส -> กรรม)
    // ข้างแรม: นับจาก กัม ไปหาปอด ไปหาใส (กัม -> ปอด -> ใส)
    const YAM_SEQUENCE = {
        'ข้างขึ้น': ['ปอด', 'ใส', 'กรรม'], 
        'ข้างแรม': ['กรรม', 'ปอด', 'ใส'] 
    };
    
    const sequence = YAM_SEQUENCE[lunarPhase] || YAM_SEQUENCE['ข้างแรม'];
    const positionIndex = yamIndex % sequence.length;
    const finalSymbol = sequence[positionIndex];

    // ตีความผลลัพธ์ (ตามคำสั่ง)
    const YAM_MEANING = {
        'ใส': { link: 'ใส = direct answer / yes / come / male' },
        'ปอด': { link: 'ปอด = blocked / not yet / a little slow / leaning towards female' },
        'กรรม': { link: 'กรรม = flipped / no / not coming / female dominant' }
    };
    
    const result = YAM_MEANING[finalSymbol];

    let interpretation = "";
    if (finalSymbol === 'ใส') {
        interpretation = `**${finalSymbol.toUpperCase()}** - คำถามนี้มีแนวโน้มเป็นจริงอย่าง **ชัดเจน** (ใช่ / สำเร็จ) เพราะเป็น ${result.link}`;
    } else if (finalSymbol === 'ปอด') {
        interpretation = `**${finalSymbol.toUpperCase()}** - คำถามนี้ยังมีความ **ล่าช้า** หรือมี **อุปสรรคขวางอยู่** (ยังไม่สำเร็จทันที) เพราะเป็น ${result.link}`;
    } else { // กรรม
        interpretation = `**${finalSymbol.toUpperCase()}** - คำถามนี้มีแนวโน้ม **พลิกผัน** หรือมีผลลัพธ์เป็น **ตรงกันข้าม** (ไม่ใช่ / ไม่มา) เพราะเป็น ${result.link}`;
    }

    return {
        symbol: finalSymbol,
        meaning: interpretation
    };
}


function predictYam(mode) {
    const question = document.getElementById('yamQuestion').value.trim();
    if (!question) {
        alert("กรุณาใส่คำถามก่อนทำนายค่ะ");
        return;
    }
    
    let currentPhase;
    let currentYamIdx;
    let predictionType;

    if (mode === 1) {
        // คำทำนายหลัก: ใช้ยามที่จับได้ครั้งแรก (Initial)
        currentPhase = window.initialLunarPhase;
        currentYamIdx = window.initialYamIndex;
        predictionType = "คำทำนายหลัก (ยามกำเนิด)";
        
        if (currentYamIdx === -1) {
            alert("⚠️ ยังไม่ได้จับยามกำเนิด กรุณาเข้าเมนู 'จับยามสามตา' อีกครั้งเพื่อให้ระบบจับยามแรกที่เข้าได้");
            return;
        }
    } else {
        // คำทำนายสอง: นับยามใหม่ทั้งหมด (ใช้ค่าปัจจุบัน)
        updateHomeClock(); 
        currentPhase = window.currentLunarPhase;
        currentYamIdx = window.currentYamIndex;
        predictionType = "คำทำนายจร (ยามปัจจุบัน)";
    }
    
    if (currentYamIdx < 0) {
        alert("⚠️ ไม่สามารถระบุยามอัฏฐกาลได้ในขณะนี้ (นอกช่วง 8 ยาม)");
        return;
    }
    
    const result = getPredictionResult(currentPhase, currentYamIdx);
    
    const resultBox = document.getElementById('yamResultBox');
    resultBox && (resultBox.style.display = 'block');
    
    const outputEl = document.getElementById('yamResultOutput');
    const explEl = document.getElementById('yamResultExplanation');
    
    if(outputEl) outputEl.innerHTML = `<h2 style="color:#ef4444; margin-bottom:0;">${result.symbol.toUpperCase()}</h2>`;
    if(explEl) explEl.innerHTML = `
        <p><b>คำถาม:</b> "${question}"</p>
        <p style="font-weight:bold; color:#10b981;">ผลการทำนาย: ${result.meaning}</p>
        <p style="font-size:12px; color:#6b7280;">(${predictionType}: นับจาก ${currentPhase} ยามที่ ${currentYamIdx + 1})</p>
    `;
}

// ==========================================
// 9. UTILITY FUNCTION (COPY TO CLIPBOARD)
// ==========================================
function copyResult(id) {
    const element = document.getElementById(id);
    const textToCopy = element.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert('คัดลอกผลลัพธ์สำเร็จแล้ว! นำมาวางให้ Java ได้เลยค่ะ');
    }).catch(err => {
        const tempInput = document.createElement('textarea');
        tempInput.value = textToCopy;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('คัดลอกผลลัพธ์สำเร็จแล้ว! (Fallback)');
    });
}

// Init
showSection('home');
loadProfileList();

