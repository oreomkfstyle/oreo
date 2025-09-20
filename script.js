document.addEventListener("DOMContentLoaded", () => {
  // ================================================================== //
  // ========== ⚙️ การตั้งค่าการทำงาน (Easy Settings) ⚙️ ========== //
  // ================================================================== //
  const config = {
    // --- 1. แหล่งข้อมูล (Data Source) ---
    sheetUrl:
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vSWhQaUXvJI7UjcNVNrpkNTjPOA_b2sQqCBWp1KT_Nw3cB6Ch5bwUw2lfKQPiokj1ZbliIOdRC0cYIR/pub?output=csv",
    
    // ★★★★★ เพิ่มลิงก์ Instagram ของคุณที่นี่ ★★★★★
    instagramUrl: "https://www.instagram.com/officialmkf_",

    // --- 2. การแสดงผลรายชื่อ (Member Display) ---
    columnsPerRow: 3,
    itemsPerPage: 15,

    // --- 3. การแสดงผลข้อความ (Text Display) ---
    leaderSectionTitle: "Oreo",
    memberSectionTitle: "Bxngbxng",
    leaderIcon: "👑",
    memberIcon: "👥",

    // --- 4. การตั้งค่าเสียง (Audio Settings) ---
    initialVolume: 0.1,

    // --- 5. การตั้งค่าลิงก์ (Link Settings) ---
    maxLinkLength: 30,
    
    // --- 6. อนิเมชั่น (Animation) ---
    transition_speed: 500,
  };
  // ================================================================== //
  
  // --- Global variables ---
  let allMembersData = [];
  let currentPage = 1;
  let currentDisplay = 'Oreo'; // เพิ่มตัวแปรสถานะการแสดงผล
  
  // --- DOM Elements ---
  const landingPage = document.getElementById("landing-page");
  const membersPage = document.getElementById("members-page");
  const enterBtn = document.getElementById("enter-btn");
  const leaderContainer = document.querySelector("#leader-section");
  const membersContainer = document.querySelector("#members-section");
  const loadingMessage = document.getElementById("loading-message");
  const searchInput = document.getElementById("searchInput");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const pageInfo = document.getElementById("pageInfo");
  const paginationControls = document.querySelector(".pagination-controls");
  const instagramLink = document.getElementById("instagram-link");
  const showOreoBtn = document.getElementById("showOreoBtn");
  const showBxngbxngBtn = document.getElementById("showBxngbxngBtn");
  const loadingScreen = document.getElementById("loading-screen");
  const homeBtn = document.getElementById("homeBtn"); // เพิ่มปุ่มกลับหน้าหลัก

  // --- Functions ---
  function setupExternalLinks() {
    if (instagramLink && config.instagramUrl) {
      instagramLink.href = config.instagramUrl;
    }
  }

  function createMemberCardHTML(member, isLeader = false) {
    const cardClass = isLeader ? "member-card leader-card" : "member-card";
    let name = member.name || "Unknown";
    const facebookLink = member.facebookLink || "#";
    const pictureLink = member.pictureLink || "https://via.placeholder.com/150";

    if (isLeader) {
      name = `${config.leaderIcon} ${name}`;
    } else {
      name = `${config.memberIcon} ${name}`;
    }

    let shortLink = "No Profile";
    if (facebookLink !== "#") {
      try {
        const url = new URL(facebookLink);
        const hostname = url.hostname.replace("www.", "");
        const path = url.pathname === "/" ? "" : url.pathname;
        const fullLinkText = hostname + path;
        const maxLength = config.maxLinkLength;
        shortLink = fullLinkText.length > maxLength ? fullLinkText.substring(0, maxLength) + "..." : fullLinkText;
      } catch (e) {
        let cleanLink = facebookLink.replace(/^https?:\/\//, "");
        const maxLength = config.maxLinkLength;
        shortLink = cleanLink.length > maxLength ? cleanLink.substring(0, maxLength) + "..." : cleanLink;
      }
    }

    return `
      <div class="${cardClass}" data-name="${member.name || 'Unknown'}">
        <img src="${pictureLink}" alt="Profile of ${name}" class="profile-pic">
        <div class="member-info">
          <h3 class="memberName">${name}</h3>
          <a href="${facebookLink}" target="_blank" rel="noopener noreferrer">${shortLink}</a>
        </div>
        <a href="${facebookLink}" target="_blank" rel="noopener noreferrer" class="profile-link"><i class="fab fa-facebook-f"></i></a>
      </div>
    `;
  }

  function updatePaginationControls(totalPages) {
    if (totalPages > 1) {
      paginationControls.style.display = "flex";
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = currentPage >= totalPages;
    } else {
      paginationControls.style.display = "none";
    }
  }

  function updateView() {
    const filterText = searchInput.value.toLowerCase();
    
    // ตรวจสอบว่ากำลังค้นหาอยู่หรือไม่
    if (filterText) {
      // โหมดค้นหา: แสดงผลการค้นหาทั้งหมดโดยแบ่งหน้า
      const filteredData = allMembersData.filter(member => member.name.toLowerCase().includes(filterText));
      
      leaderContainer.innerHTML = "";
      membersContainer.innerHTML = "";
      showOreoBtn.style.display = "none";
      showBxngbxngBtn.style.display = "none";

      const totalPages = Math.ceil(filteredData.length / config.itemsPerPage);
      const startIndex = (currentPage - 1) * config.itemsPerPage;
      const paginatedResults = filteredData.slice(startIndex, startIndex + config.itemsPerPage);

      if (paginatedResults.length > 0) {
        const resultsHTML = paginatedResults.map(member => 
          createMemberCardHTML(member, member.role.toLowerCase() === config.leaderSectionTitle.toLowerCase())
        ).join("");
        membersContainer.innerHTML = `<h2>Search Results</h2>` + resultsHTML;
      } else {
        membersContainer.innerHTML = `<h2>Search Results</h2><p>No members found matching your search.</p>`;
      }
      updatePaginationControls(totalPages);

    } else {
      // โหมดปกติ: แสดงกลุ่มตามปุ่มที่ถูกเลือก
      showOreoBtn.style.display = "inline-block";
      showBxngbxngBtn.style.display = "inline-block";

      leaderContainer.innerHTML = "";
      membersContainer.innerHTML = "";

      if (currentDisplay === 'Oreo') {
          const oreoMembers = allMembersData.filter(m => m.role.toLowerCase() === config.leaderSectionTitle.toLowerCase());
          leaderContainer.innerHTML = `<h2>${config.leaderIcon} ${config.leaderSectionTitle}</h2>` + oreoMembers.map(l => createMemberCardHTML(l, true)).join("");
          paginationControls.style.display = "none";
      } else if (currentDisplay === 'Bxngbxng') {
          const bxngbxngMembers = allMembersData.filter(m => m.role.toLowerCase() === config.memberSectionTitle.toLowerCase());
          const totalPages = Math.ceil(bxngbxngMembers.length / config.itemsPerPage);
          const startIndex = (currentPage - 1) * config.itemsPerPage;
          const paginatedMembers = bxngbxngMembers.slice(startIndex, startIndex + config.itemsPerPage);
          
          membersContainer.innerHTML = `<h2>${config.memberIcon} ${config.memberSectionTitle}</h2>` + paginatedMembers.map(m => createMemberCardHTML(m, false)).join("");
          updatePaginationControls(totalPages);
      }
    }
  }
  
  async function fetchAndDisplayMembers() {
    try {
      loadingMessage.style.display = "block";
      const response = await fetch(config.sheetUrl);
      if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
      const csvText = await response.text();
      const rows = csvText.trim().split(/\r?\n/).slice(1);

      allMembersData = rows.map(row => {
        const values = row.split(",");
        return {
          name: values[0]?.trim() || "",
          facebookLink: values[1]?.trim() || "",
          role: values[2]?.trim() || "",
          pictureLink: values[3]?.trim() || "",
        };
      }).filter(m => m.name);
      
      loadingMessage.style.display = "none";
      updateView();
      
    } catch (error) {
      console.error("Error fetching or parsing sheet data:", error);
      loadingMessage.style.display = "none";
      membersContainer.innerHTML = `<h2>Error</h2><p>Error loading data. Please check the Google Sheet link and publish settings.</p>`;
    }
  }

  function setupEventListeners() {
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      updateView();
    });

    nextBtn.addEventListener("click", () => {
      const filterText = searchInput.value.toLowerCase();
      // คำนวณจำนวนหน้าตามโหมดปัจจุบัน
      let dataSet;
      if (filterText) {
          dataSet = allMembersData.filter(m => m.name.toLowerCase().includes(filterText));
      } else if (currentDisplay === 'Bxngbxng') {
          dataSet = allMembersData.filter(m => m.role.toLowerCase() === config.memberSectionTitle.toLowerCase());
      }
      
      const totalPages = Math.ceil(dataSet.length / config.itemsPerPage);

      if (currentPage < totalPages) {
        currentPage++;
        updateView();
      }
    });

    prevBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        updateView();
      }
    });
    
    enterBtn.addEventListener("click", () => {
      // Fade out landing page
      landingPage.style.animation = `fadeOut ${config.transition_speed / 1000}s forwards`;
      
      // Show loading screen
      loadingScreen.style.display = "flex";
      loadingScreen.style.animation = "fadeIn 1s forwards";

      // Set a timeout to transition to the members page
      setTimeout(() => {
        landingPage.style.display = "none";
        membersPage.style.display = "block";
        membersPage.style.animation = "fadeIn 1s forwards";
        
        // Hide loading screen after the member page loads
        loadingScreen.style.animation = "fadeOut 1s forwards";
        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 1000);

        // Play audio
        const audio = document.getElementById("gang-music");
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => console.error("Autoplay was prevented:", error));
        }

        // Fetch and display data
        fetchAndDisplayMembers();
      }, config.transition_speed);
    });

    // Event Listener สำหรับปุ่มกลับหน้าหลัก
    homeBtn.addEventListener("click", () => {
      membersPage.style.animation = `fadeOut ${config.transition_speed / 1000}s forwards`;
      setTimeout(() => {
        membersPage.style.display = "none";
        landingPage.style.display = "flex";
        landingPage.style.animation = "fadeIn 1s forwards";
        
        // Stop audio
        const audio = document.getElementById("gang-music");
        audio.pause();
        audio.currentTime = 0;

        // Reset state
        searchInput.value = "";
        currentDisplay = 'Oreo';
        currentPage = 1;
        showOreoBtn.classList.add("active");
        showBxngbxngBtn.classList.remove("active");
        updateView();

      }, config.transition_speed);
    });
    
    // เพิ่ม Event Listener สำหรับปุ่มใหม่
    showOreoBtn.addEventListener("click", () => {
        currentDisplay = 'Oreo';
        currentPage = 1;
        updateView();
        showOreoBtn.classList.add("active");
        showBxngbxngBtn.classList.remove("active");
    });

    showBxngbxngBtn.addEventListener("click", () => {
        currentDisplay = 'Bxngbxng';
        currentPage = 1;
        updateView();
        showBxngbxngBtn.classList.add("active");
        showOreoBtn.classList.remove("active");
    });
  }

  function setupAudioPlayer() {
    const audio = document.getElementById("gang-music");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const playIcon = playPauseBtn.querySelector("i");
    const muteBtn = document.getElementById("mute-btn");
    const muteIcon = muteBtn.querySelector("i");
    const volumeSlider = document.getElementById("volume-slider");

    playPauseBtn.addEventListener("click", () => audio.paused ? audio.play() : audio.pause());
    audio.addEventListener("play", () => playIcon.classList.replace("fa-play", "fa-pause"));
    audio.addEventListener("pause", () => playIcon.classList.replace("fa-pause", "fa-play"));
    volumeSlider.addEventListener("input", (e) => {
      audio.volume = e.target.value;
      audio.muted = false;
    });
    audio.addEventListener("volumechange", () => {
      volumeSlider.value = audio.volume;
      if (audio.muted || audio.volume === 0) muteIcon.className = "fas fa-volume-xmark";
      else if (audio.volume < 0.5) muteIcon.className = "fas fa-volume-low";
      else muteIcon.className = "fas fa-volume-high";
    });
    muteBtn.addEventListener("click", () => audio.muted = !audio.muted);
    audio.volume = config.initialVolume;
  }
  
  // --- Initialize ---
  document.documentElement.style.setProperty('--columns-per-row', config.columnsPerRow);
  setupAudioPlayer();
  setupEventListeners();
  setupExternalLinks();
});