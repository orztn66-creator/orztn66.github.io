function initializePage(){const allSections=document.querySelectorAll('.section');allSections.forEach(section=>{section.style.display='none';});const heroSection=document.getElementById('hero-section');if(heroSection){heroSection.style.display='flex';}goHome();const promoBanner=document.getElementById('promo-banner-section');if(promoBanner){promoBanner.style.display='block';}const extraPromoBanner=document.getElementById('extra-promo-banner-section');if(extraPromoBanner){extraPromoBanner.style.display='block';}}
        
        function toggleMenu(){const nav=document.getElementById('main-nav');nav.classList.toggle('active');}function toggleSubMenu(event,submenuId){event.preventDefault();const submenu=document.getElementById(submenuId);document.querySelectorAll('.dropdown-content').forEach(menu=>{if(menu.id!==submenuId){menu.style.display='none';}});if(submenu.style.display==='block'){submenu.style.display='none';}else{submenu.style.display='block';}}
        
        // *แก้ไข: ให้ footer แสดงผลทุกครั้งที่กลับหน้าหลัก*
       function goHome(){
            const allSections=document.querySelectorAll('.section');
            allSections.forEach(section=>{section.style.display='none';});
            document.getElementById('hero-section').style.display='flex';
            document.getElementById('new-brand-section').style.display='flex';
            document.getElementById('promo-banner-section').style.display='block';
            document.getElementById('extra-promo-banner-section').style.display='block';
            const _mf = document.getElementById('main-footer'); if(_mf){ _mf.style.display = 'block'; } // *ตรวจสอบให้ footer แสดง*
            document.querySelectorAll('.dropdown-content').forEach(menu=>{menu.style.display='none';});
            window.scrollTo(0,0);
        }
        
        // * === [โค้ดแก้ไข] ฟังก์ชัน showSection ที่อัปเดตแล้ว === *
        function showSection(targetId){
            // ต้องหยุดวิดีโอทั้งหมดก่อนเปลี่ยน Section
            stopAllVideos(); 
            
            document.getElementById('hero-section').style.display='none';
            document.getElementById('new-brand-section').style.display='none';
            document.getElementById('promo-banner-section').style.display='none';
            document.getElementById('extra-promo-banner-section').style.display='none';
            
            const allSections=document.querySelectorAll('.section');
            allSections.forEach(section=>{section.style.display='none';});
            
            const targetElement=document.getElementById(targetId);
            if(targetElement){targetElement.style.display='block';}

            
            // === [เพิ่มใหม่] ถ้าเป็นการเปิดหน้า 'sheet-data' ให้เริ่มดึงข้อมูล ===
            if (targetId === 'sheet-data') {
                fetchGoogleSheetData();
            }
            // === [จบ] ===


            const _mf = document.getElementById('main-footer'); if(_mf){ _mf.style.display = 'block'; } // *ตรวจสอบให้ footer แสดง*
            
            const nav=document.getElementById('main-nav');
            if(nav.classList.contains('active')){nav.classList.remove('active');}
            document.querySelectorAll('.dropdown-content').forEach(menu=>{menu.style.display='none';});
            window.scrollTo(0,0);
        }

        /* ************************************************* */
        /* ******** START OF NEW/UPDATED JAVASCRIPT ******** */
        /* ************************************************* */
        function stopAllVideos() {
            // 1. หยุดวิดีโอในส่วน #about (Embedded Iframes)
            const aboutVideos = document.querySelectorAll('#about .video-box');
            aboutVideos.forEach(videoBox => {
                if (videoBox.getAttribute('data-video-played') === 'true') {
                    const iframe = videoBox.querySelector('iframe');
                    if (iframe) {
                        // ดึง src เดิม (ไม่มี autoplay) แล้วใช้รีเซ็ต
                        const originalSrc = iframe.getAttribute('src').split('?')[0] + '?rel=0';
                        iframe.setAttribute('src', ''); // หยุดการเล่น
                        iframe.setAttribute('src', originalSrc); // รีเซ็ต src ไปสถานะเดิม (ไม่เล่น)
                        iframe.classList.remove('active-video');
                        iframe.style.display = 'none'; // ซ่อน iframe
                    }
                    // การตั้ง data-video-played="false" จะทำให้ CSS แสดง Thumbnail และ Play Overlay เอง
                    videoBox.setAttribute('data-video-played', 'false');
                }
            });

            // 2. หยุดวิดีโอในส่วน #media และ #legendary-reviews (Card structure: YouTube/Facebook)
            const videoContainers = document.querySelectorAll('.video-card, .facebook-video-card');
            videoContainers.forEach(container => {
                const thumbnailContainer = container.querySelector('.video-thumbnail-container');
                const targetContainer = container.querySelector('[id^="youtube-media-"], [id^="facebook-video-"], [id^="legend-youtube-"]');
                
                // ตรวจสอบว่าวิดีโอถูกโหลด/กำลังเล่นหรือไม่ (ดูจาก thumbnail ที่ถูกซ่อน)
                if (thumbnailContainer && thumbnailContainer.style.display === 'none') {
                    // ลบ iframe ออกจาก container (เป็นการหยุดการเล่น)
                    targetContainer.innerHTML = '';
                    
                    // แสดง thumbnail และรีเซ็ตสถานะ
                    thumbnailContainer.style.display = 'block';
                    thumbnailContainer.removeAttribute('data-loaded');
                }
            });
        }
        
        /* *UPDATED: ฟังก์ชันสำหรับเล่นวิดีโอตัวที่ 1 ในส่วน #about */
        function playEmbeddedVideo(){
            stopAllVideos(); 
            const videoBox = document.querySelector('#about .video-box:nth-of-type(1)');
            if(videoBox.getAttribute('data-video-played') === 'true') return;

            const iframe = document.getElementById('pvdVideo');
            if(iframe) {
                iframe.setAttribute('loading','lazy');
                // ต้องเพิ่ม ?autoplay=1 เพื่อให้เริ่มเล่นทันที
                let newSrc = iframe.getAttribute('src');
                if (!newSrc.includes('autoplay')) {
                    newSrc += newSrc.includes('?') ? '&autoplay=1' : '?autoplay=1';
                }
                iframe.setAttribute('src', newSrc);
                
                iframe.classList.add('active-video');
                iframe.style.display = 'block';
            }
            
            // การซ่อน Thumbnail และ Play Overlay จะถูกจัดการโดย CSS [data-video-played="true"]
            videoBox.setAttribute('data-video-played', 'true');
        }
        
        /* *UPDATED: ฟังก์ชันสำหรับเล่นวิดีโอตัวที่ 2 ในส่วน #about */
        function playEmbeddedVideo2(){
            stopAllVideos(); 
            const videoBoxes = document.querySelectorAll('#about .video-box');
            const videoBox = videoBoxes[1];
            
            if(!videoBox || videoBox.getAttribute('data-video-played') === 'true') return;

            const iframe = document.getElementById('pvdVideo2');
            if(iframe) {
                iframe.setAttribute('loading','lazy');
                 // ต้องเพิ่ม ?autoplay=1 เพื่อให้เริ่มเล่นทันที
                let newSrc = iframe.getAttribute('src');
                if (!newSrc.includes('autoplay')) {
                    newSrc += newSrc.includes('?') ? '&autoplay=1' : '?autoplay=1';
                }
                iframe.setAttribute('src', newSrc);
                
                iframe.classList.add('active-video');
                iframe.style.display = 'block';
            }
            
            // การซ่อน Thumbnail และ Play Overlay จะถูกจัดการโดย CSS [data-video-played="true"]
            videoBox.setAttribute('data-video-played', 'true');
        }

        /* *แก้ไข: ปรับโค้ด loadFacebookVideo (เรียก stopAllVideos)* */
        function loadFacebookVideo(thumbnailElement,targetId){
            stopAllVideos(); // [NEW] Stop all other videos
            if(thumbnailElement.hasAttribute('data-loaded')){return;}
            const videoSrc=thumbnailElement.getAttribute('data-src');
            const targetContainer=document.getElementById(targetId);
            const iframe=document.createElement('iframe');
            iframe.setAttribute('width','100%');
            iframe.setAttribute('height','300');
            iframe.setAttribute('src',videoSrc);
            iframe.setAttribute('loading','lazy');
            iframe.setAttribute('style','border:none;overflow:hidden; display:block; height: 300px;');
            iframe.setAttribute('scrolling','no');
            iframe.setAttribute('frameborder','0');
            iframe.setAttribute('allowfullscreen','true');
            iframe.setAttribute('allow','autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
            targetContainer.appendChild(iframe);
            thumbnailElement.style.display='none';
            thumbnailElement.setAttribute('data-loaded','true');
        }
        
        /* *แก้ไข: ปรับโค้ด loadYouTubeVideo (เรียก stopAllVideos และเพิ่ม autoplay=1)* */
        function loadYouTubeVideo(thumbnailElement,targetId){
            stopAllVideos(); // [NEW] Stop all other videos
            if(thumbnailElement.hasAttribute('data-loaded')){return;}
            const videoSrc=thumbnailElement.getAttribute('data-src');
            const targetContainer=document.getElementById(targetId);
            const iframe=document.createElement('iframe');
            iframe.setAttribute('width','100%');
            iframe.setAttribute('height','300');
            // *แก้ไข: เพิ่ม ?autoplay=1*
            iframe.setAttribute('src',videoSrc + '?autoplay=1');
            iframe.setAttribute('loading','lazy'); 
            iframe.setAttribute('title','YouTube video player');
            iframe.setAttribute('frameborder','0');
            iframe.setAttribute('allow','accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
            iframe.setAttribute('allowfullscreen','true');
            iframe.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
            iframe.setAttribute('style','display:block; height: 300px;');
            targetContainer.appendChild(iframe);
            thumbnailElement.style.display='none';
            thumbnailElement.setAttribute('data-loaded','true');
        }

        /*
           (ลบฟังก์ชัน checkStatus() เก่า (บรรทัด 140) และ
            ลบฟังก์ชัน checkKey() 2 อัน (บรรทัด 163 และ 483) ออกไปแล้ว)
        */
        
        // *************************************************************
        // *** [สำคัญ: ลบส่วนที่จัดการปุ่ม 'อ่านเพิ่มเติม' ที่หน้าหลัก] ***
        // *************************************************************
        // document.addEventListener('DOMContentLoaded',() => { 
        //     const buttons=document.querySelectorAll('.video-details .read-more-btn'); 
        //     buttons.forEach(button=>{ 
        //         const box=button.closest('.video-details');
        //         // ... (โค้ดควบคุมปุ่ม 'อ่านเพิ่มเติม' ที่หน้าหลักถูกลบออกแล้ว) ...
        //     });
        // });
        
        // Data structure for the 9 service categories (Slider)
        const nineServicesData = [
            // <<< Java ใช้ชื่อไฟล์ตามที่พี่นัทส่งมา 9 ชื่อแล้วค่ะ >>>
            { img: 'service-1-chassis.jpg', title: 'ช่วงล่าง (Suspension & Chassis)', desc: 'บริการซ่อมและบำรุงรักษาระบบช่วงล่าง, โช้คอัพ, ถุงลม, และระบบควบคุมการทรงตัว เพื่อความนุ่มนวลและปลอดภัยในการขับขี่.' },
            { img: 'service-7-body.jpg', title: 'ตัวถัง (Body & Paint)', desc: 'งานซ่อมตัวถัง, ทำสีมาตรฐานโรงงาน, เคาะพ่นสี, และแก้ไขปัญหาตัวถังที่เกิดจากอุบัติเหตุหรือรอยขีดข่วนทั่วไป.' },
            { img: 'service-9-wheel.jpg', title: 'พวงมาลัย (Steering System)', desc: 'ซ่อมระบบพวงมาลัยไฟฟ้า (EPS), ระบบพวงมาลัยเพาเวอร์, และแก้ไขปัญหาการสั่น/เสียงดังของระบบบังคับเลี้ยว.' },
            { img: 'service-6-interior.jpg', title: 'ภายใน (Interior & Upholstery)', desc: 'งานซ่อมและฟื้นฟูภายในรถยนต์, เบาะหนัง, แผงประตู, ระบบไฟฟ้าภายใน, และหลังคามูนรูฟ/ซันรูฟ.' },
            { img: 'service-3-transmission.jpg', title: 'เกียร์ (Transmission System)', desc: 'เชี่ยวชาญซ่อมเกียร์อัตโนมัติ (Automatic Transmission) และเปลี่ยนถ่ายน้ำมันเกียร์ตามสเปคโรงงาน พร้อมรับประกันงานซ่อม.' },
            { img: 'service-2-engine.jpg', title: 'เครื่องยนต์ (Engine System)', desc: 'งานโอเวอร์ฮอลเครื่องยนต์, แก้ไขปัญหาเครื่องสั่น/ดับ, ตรวจเช็กระบบหัวฉีด, และซ่อมบำรุงตามระยะ เพื่อประสิทธิภาพสูงสุด.' },
            { img: 'service-8-options.jpg', title: 'เบรค (Brake System)', desc: 'ตรวจเช็กและซ่อมบำรุงระบบเบรก, เปลี่ยนผ้าเบรก, จานเบรก, ปั๊มเบรก, และระบบ ABS/ESP เพื่อความปลอดภัยสูงสุด.' },
            { img: 'service-4-electric.jpg', 'title': 'ระบบไฟฟ้า (Electrical System)', desc: 'แก้ไขปัญหาระบบไฟฟ้าที่ซับซ้อน, กล่องควบคุม (ECU), สายไฟ, และแบตเตอรี่ไฮบริดด้วยเครื่องมือเฉพาะทาง.' },
            { img: 'service-5-ac.jpg', 'title': 'ระบบแอร์ (Air Conditioning System)', desc: 'ซ่อมระบบปรับอากาศ, เปลี่ยนคอมเพรสเซอร์, เติมน้ำยาแอร์, และล้างตู้แอร์ เพื่อให้ได้ความเย็นที่สดชื่นและทำงานได้เต็มประสิทธิภาพ.' }
        ];
        
        // --- Modal for Services 2 & 3 (Original Modal) ---
        var serviceModal=document.getElementById("serviceModal");
        function openServiceModal(title,imgFileName,content){
            document.getElementById("modalTitle").innerHTML=title;
            document.getElementById("modalImage").src=imgFileName;
            
            // === [แก้ไขใหม่] เพิ่มปุ่ม "อ่านต่อตรงนี้" เข้าไปใน content ===
            const readMoreButtonHTML = '<div style="margin-top: 20px; text-align: right;"><a href="#" class="modal-read-more-link" onclick="tryAgainPopup(); return false;">อ่านต่อตรงนี้</a></div>';
            document.getElementById("modalContent").innerHTML = content + readMoreButtonHTML;
            // =========================================================
            
            serviceModal.style.display="block";
        }
        function closeServiceModal(){serviceModal.style.display="none";}
        function tryAgainPopup(){alert("การนำทาง: แสดงป็อปอัพลองใหม่ (Placeholder)");}
        
        // --- Slider Logic for Service 1 (9 หมวดหลัก) ---
        let currentSlideIndex = 1;

        // Function to dynamically render slides and dots
        function renderSlider() {
            const slideshowContainer = document.querySelector('#nineServicesSliderModal .slideshow-container');
            const indicatorContainer = document.getElementById('slide-indicators');
            
            if (!slideshowContainer || !indicatorContainer) return; // Safety check

            slideshowContainer.innerHTML = '';
            indicatorContainer.innerHTML = '';

            nineServicesData.forEach((item, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.className = 'mySlides';
                slideDiv.innerHTML = `
                    <img src="${item.img}" alt="${item.title}" style="width:100%">
                    <div class="slide-content-box">
                        <h3>${item.title}</h3>
                        <p>${item.desc}</p>
                    </div>
                `;
                slideshowContainer.appendChild(slideDiv);

                const dotSpan = document.createElement('span');
                dotSpan.className = 'dot';
                dotSpan.onclick = function() { currentSlide(index + 1); };
                indicatorContainer.appendChild(dotSpan);
            });
        }
        
        // Function to open the slider modal
        function openNineServicesSlider() {
            // ป้องกันการเล่นวิดีโอซ้ำซ้อน
            stopAllVideos(); 
            
            const sliderModal = document.getElementById('nineServicesSliderModal');
            if (!sliderModal) return; // Safety check
            renderSlider(); // Render fresh slides/dots every time
            sliderModal.style.display = 'block';
            currentSlideIndex = 1; // Reset to the first slide
            showSlides(currentSlideIndex);
            
            // Close old modal if somehow open (safety check)
            closeServiceModal(); 
        }

        // Function to close the slider modal
        function closeNineServicesSlider() {
            document.getElementById('nineServicesSliderModal').style.display = 'none';
        }

        // Next/previous controls
        function plusSlides(n) {
            showSlides(currentSlideIndex += n);
        }

        // Thumbnail image controls
        function currentSlide(n) {
            showSlides(currentSlideIndex = n);
        }

        // Main function to display the current slide
        function showSlides(n) {
            let i;
            const slides = document.getElementsByClassName('mySlides');
            const dots = document.getElementsByClassName('dot');
            const totalSlides = nineServicesData.length;

            if (slides.length === 0) return; // Handle empty data

            if (n > totalSlides) { currentSlideIndex = 1 }
            if (n < 1) { currentSlideIndex = totalSlides }
            
            // Hide all slides
            for (i = 0; i < slides.length; i++) {
                slides[i].style.display = 'none';
            }
            
            // Remove active class from all dots
            for (i = 0; i < dots.length; i++) {
                dots[i].className = dots[i].className.replace(' active-dot', '');
            }
            
            // Display the current slide and highlight the current dot
            slides[currentSlideIndex - 1].style.display = 'block';
            dots[currentSlideIndex - 1].className += ' active-dot';

            // Update position text
            document.getElementById('slide-position-text').innerHTML = 
                `${currentSlideIndex} / ${totalSlides}`;
        }
        
        // ⭐️ [แก้ไข] อัปเดต window.onclick ให้ปิด Social Modal ได้ด้วย ⭐️
        window.onclick=function(event){
            if(event.target==serviceModal){
                closeServiceModal();
            }
            if(event.target==document.getElementById('nineServicesSliderModal')){
                closeNineServicesSlider();
            }
            
            // [ใหม่] เพิ่มเงื่อนไขนี้
            if (event.target == document.getElementById('socialModal')) { 
                closeSocialModal();
            }
        };

        // Initialize slider on load if it's visible (though it starts hidden)
        document.addEventListener('DOMContentLoaded', () => {
            renderSlider();
            // The rest of the page initialization logic remains...
        });



/* =================================================== */
/* === [ใหม่] โค้ดสำหรับ *อ่าน* ข้อมูล Google Sheet === */
/* =================================================== */

// (อ่าน) URL .csv จาก Google Sheet ของคุณ
const googleSheetCSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTtvF2qFTMriibojzK5OdL83KZ9JgSiogmrjqp19iEN1CTN_9kDYnmAg7OqnkrWCkRx64zllusnk1as/pub?output=csv';

// (ป้องกันการโหลดซ้ำ)
let isSheetDataLoaded = false; 

async function fetchGoogleSheetData() {
    // ถ้าโหลดแล้ว ไม่ต้องโหลดซ้ำ
    if (isSheetDataLoaded) {
        return;
    }
    
    const container = document.getElementById('google-sheet-data-container');
    container.innerHTML = '<p>กำลังโหลดข้อมูล...</p>';

    try {
        // เพิ่ม "Cache Busting" เพื่อให้ได้ข้อมูลล่าสุดเสมอ
        const urlToFetch = `${googleSheetCSV_URL}&t=${new Date().getTime()}`;
        
        const response = await fetch(urlToFetch);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const csvText = await response.text();
        
        const data = parseGoogleSheetCSV(csvText); 
        displayGoogleSheetData(data);
        isSheetDataLoaded = true; // ตั้งค่าว่าโหลดเสร็จแล้ว

    } catch (error) {
        console.error('Error fetching or parsing data:', error);
        container.innerHTML = '<p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
    }
}

function parseGoogleSheetCSV(csvText) {
    // แยกแต่ละบรรทัด (ตัดช่องว่างหน้า-หลัง และกรองบรรทัดว่าง)
    const lines = csvText.trim().split('\n').filter(line => line.trim() !== '');
    
    // บรรทัดแรกคือ Header (ชื่อคอลัมน์)
    const headers = lines[0].split(',').map(header => header.trim());
    
    const result = [];
    
    // วนลูปตั้งแต่บรรทัดที่ 2 (ข้อมูลจริง)
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(value => value.trim());
        
        if (values.length !== headers.length) {
            continue; // ข้ามบรรทัดที่ข้อมูลไม่ครบ
        }
        
        const obj = {};
        for (let j = 0; j < headers.length; j++) {
            // ลบเครื่องหมายคำพูด (") ที่อาจติดมา
            obj[headers[j]] = values[j].replace(/^"|"$/g, '');
        }
        result.push(obj);
    }
    
    return result;
}

function displayGoogleSheetData(data) {
    const container = document.getElementById('google-sheet-data-container');
    
    if (!data || data.length === 0) {
        container.innerHTML = '<p>ไม่พบข้อมูล</p>';
        return;
    }

    // --- สร้างตาราง HTML ---
    const table = document.createElement('table');
    
    // สร้างส่วนหัวของตาราง (thead)
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = Object.keys(data[0]);
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // สร้างส่วนข้อมูล (tbody)
    const tbody = document.createElement('tbody');
    data.forEach(rowData => {
        const tr = document.createElement('tr');
        
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = rowData[header];
            tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    
    // เคลียร์ "กำลังโหลด..." แล้วใส่ตารางลงไป
    container.innerHTML = '';
    container.appendChild(table);
}
/* === [จบ] โค้ดสำหรับ *อ่าน* ข้อมูล === */



/* =================================================== */
/* === [ใหม่] โค้ดสำหรับ *ส่ง* ข้อมูลไป Google Sheet === */
/* =================================================== */

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !! (แก้ไข) วาง "Web app URL" ที่คุณคัดลอกมาจาก Google Apps Script ตรงนี้ !!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvCYDJI_5fpjlfRAjX19AaBHzilCjaV7EviHFxNaX5zpbT-U0rmmbVPWPWDcOHr';


// รอให้หน้าเว็บโหลดเสร็จก่อน แล้วค่อยเชื่อมฟอร์ม
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-data-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
});

async function handleFormSubmit(event) {
  event.preventDefault(); // ป้องกันหน้าเว็บโหลดใหม่
  
  const coad = document.getElementById('coadInput').value;
  const url = document.getElementById('urlInput').value;
  const messageEl = document.getElementById('formMessage');
  const button = event.target.querySelector('button');
  
  if (GOOGLE_APPS_SCRIPT_URL === 'YOUR_DEPLOYED_WEB_APP_URL_HERE') {
      messageEl.style.color = 'red';
      messageEl.textContent = '❌ ข้อผิดพลาด: ยังไม่ได้ตั้งค่า GOOGLE_APPS_SCRIPT_URL ใน script.js';
      return;
  }
  
  if (!coad || !url) {
    messageEl.style.color = 'red';
    messageEl.textContent = 'กรุณากรอกข้อมูลให้ครบทั้ง 2 ช่อง';
    return;
  }
  
  // ล็อกปุ่ม
  button.disabled = true;
  button.textContent = 'กำลังส่ง...';
  messageEl.textContent = '';
  
  const data = {
    coad: coad,
    url: url
  };
  
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'POST',
      // หมายเหตุ: เราส่งเป็น text/plain เพื่อเลี่ยงปัญหา CORS Preflight
      // ตัว Apps Script (doPost) ของเราถูกตั้งค่าให้รับ e.postData.contents อยู่แล้ว
      headers: { 'Content-Type': 'text/plain' }, 
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    // เราสามารถอ่าน JSON ที่ Apps Script ส่งกลับมาได้
    const result = await response.json();

    if (result.status === 'success') {
      messageEl.style.color = 'green';
      messageEl.textContent = '✅ ส่งข้อมูลสำเร็จ!';
      
      // เคลียร์ฟอร์ม
      document.getElementById('coadInput').value = '';
      document.getElementById('urlInput').value = '';
      
      // สำคัญมาก: ถ้าข้อมูลอัปเดตแล้ว เราต้องรีเซ็ตสถานะการโหลด
      // เพื่อให้ครั้งต่อไปที่คลิกเมนู "ข้อมูลชีต" มันโหลดข้อมูลใหม่
      isSheetDataLoaded = false; 
      
    } else {
      // ถ้า Apps Script ส่ง error กลับมา
      throw new Error(result.message);
    }

  } catch (error) {
    console.error('Error submitting data:', error);
    messageEl.style.color = 'red';
    messageEl.textContent = '❌ เกิดข้อผิดพลาด: ' + error.message;
  } finally {
    // ปลดล็อกปุ่ม
    button.disabled = false;
    button.textContent = 'เพิ่มข้อมูล';
  }
}
/* === [จบ] โค้ดสำหรับ *ส่ง* ข้อมูล === */

/*
  =============================================================
  ==    👇 นี่คือฟังก์ชันที่ "ถูกต้อง" สำหรับระบบรหัสลับ 👇    ==
  =============================================================
*/
function checkStatus() {
    // 
    // VVVV --- ตั้งรหัสผ่าน Admin ของคุณตรงนี้ --- VVVV
    //
    const ADMIN_PASSWORD = "admin"; // (รหัสเดียวกันกับใน Apps Script)
    //
    // ^^^^ ----------------------------------- ^^^^
    //

    const inputEl = document.getElementById('repairCode');
    const resultEl = document.getElementById('result');
    const code = inputEl.value;

    if (code === ADMIN_PASSWORD) {
        
        // --- 1. ถ้ารหัสคือ "admin" (รหัสลับถูก) ---
        
        // 1.1 แสดงเมนู "แผงควบคุม (Admin) ▾" ที่ซ่อนอยู่
        document.getElementById('admin-menu-group').style.display = 'inline-block';
        
        // 1.2 แจ้งเตือนแอดมิน
        resultEl.innerHTML = '<span style="color: #00aaff;">✅ ปลดล็อกเมนู Admin สำเร็จ!</span>';
        
        // 1.3 (สำคัญ) พาไปหน้า Admin Panel ทันที
        showSection('admin-panel'); 
        
        // 1.4 ล้างค่าในช่องกรอก
        inputEl.value = '';

    } else {
        
        // --- 2. ถ้ารหัสเป็นอย่างอื่น (เช่น PVD123 ของลูกค้า) ---
        
        resultEl.style.color = '#eee'; // (ตั้งสีข้อความกลับเป็นปกติ)
        resultEl.innerHTML = `กำลังค้นหาสถานะสำหรับรหัส: ${code}...`;
        
        // 
        // (*** หมายเหตุ ***)
        // (นี่คือส่วนที่คุณต้องไปเขียนโค้ดต่อ... 
        //  เพื่อดึงข้อมูลสถานะของลูกค้าจาก Google Sheet โดยใช้รหัส 'code')
        //
        
        // (ตัวอย่างผลลัพธ์สมมติ)
        // const mockData = {
        //     "PVD1234": "กำลังซ่อมเครื่องยนต์ - คาดว่าจะเสร็จภายใน 2 วัน",
        //     "PVD5678": "ซ่อมเสร็จแล้ว - รอการตรวจสอบขั้นสุดท้าย"
        // };
        // resultEl.innerHTML = mockData[code] ? `<p style='color:#00aaff;'>${mockData[code]}</p>` : "<p style='color:orange;'>ไม่พบข้อมูล</p>";
    }
}
function goBack() {
    // คำสั่งมาตรฐานของ JavaScript เพื่อให้เบราว์เซอร์ย้อนกลับไปหน้าก่อนหน้า
    window.history.back(); 
}

/* ===============================================
   === ⭐️ [ใหม่] โค้ดสำหรับ Social Popup (แก้ไข) ⭐️ ===
   ===============================================
*/

// 1. ฟังก์ชันเปิด (หา ID ตอนกด)
function openSocialModal() {
    var modal = document.getElementById("socialModal");
    if(modal) modal.style.display = "block";
}

// 2. ฟังก์ชันปิด (หา ID ตอนกด)
function closeSocialModal() {
    var modal = document.getElementById("socialModal");
    if(modal) modal.style.display = "none";
}

// 3. [ลบ] เราลบ addEventListener ทิ้ง เพราะเราใช้ onclick ใน HTML แล้ว
/* ================================================= */
/* ส่วนที่เพิ่มใหม่: Logic สำหรับหน้าคู่มือเช็คระยะ */
/* ================================================= */

function showCheckUpGuide() {
    // ซ่อนหน้ารายการบริการเดิม
    const serviceList = document.getElementById('service-content-list');
    if(serviceList) serviceList.style.display = 'none';

    // แสดง Container ของคู่มือ
    const guideContent = document.getElementById('check-up-guide-content');
    if(guideContent) guideContent.style.display = 'block';

    // รีเซ็ตให้แสดงหน้าสารบัญ (TOC) ก่อนเสมอ
    showStepContent(0);
}

function showServiceList() {
    // แสดงหน้ารายการบริการเดิมกลับมา
    const serviceList = document.getElementById('service-content-list');
    if(serviceList) serviceList.style.display = 'block';

    // ซ่อนคู่มือ
    const guideContent = document.getElementById('check-up-guide-content');
    if(guideContent) guideContent.style.display = 'none';
    
    window.scrollTo(0, 0);
}

function showStepContent(step) {
    // ดึง Element ทั้งหมด
    const tocView = document.getElementById('toc-view');
    const step1 = document.getElementById('step1-view');
    const step2 = document.getElementById('step2-view');
    const step3 = document.getElementById('step3-view');

    // ซ่อนทั้งหมดก่อน (Safety check: ตรวจว่ามี element จริงไหมก่อนสั่ง style)
    if(tocView) tocView.style.display = 'none';
    if(step1) step1.style.display = 'none';
    if(step2) step2.style.display = 'none';
    if(step3) step3.style.display = 'none';

    // แสดงเฉพาะส่วนที่เลือก
    if (step === 1 && step1) {
        step1.style.display = 'block';
    } else if (step === 2 && step2) {
        step2.style.display = 'block';
    } else if (step === 3 && step3) {
        step3.style.display = 'block';
    } else {
        // ค่า Default หรือ 0 ให้กลับไปหน้าสารบัญ
        if(tocView) tocView.style.display = 'block';
    }
    
    // เลื่อนจอขึ้นบนสุด
    window.scrollTo(0, 0);
}

// ตรวจสอบเมื่อโหลดหน้า (กรณีใส่ใน HTML body onload)
// เพื่อซ่อนส่วนคู่มือไว้ก่อน
document.addEventListener("DOMContentLoaded", function() {
    const guideContent = document.getElementById('check-up-guide-content');
    if(guideContent) {
        guideContent.style.display = 'none';
    }
});
