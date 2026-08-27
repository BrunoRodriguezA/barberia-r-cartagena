(function(){
  const { $ } = window.BarberiaDom;
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const monthNames = [
    "enero","febrero","marzo","abril","mayo","junio",
    "julio","agosto","septiembre","octubre","noviembre","diciembre"
  ];
  const weekdayNames = ["L","M","X","J","V","S","D"];

  let calendarView = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
  let onDateSelected = function(){};

  function formatDateValue(date){
    const year = date.getFullYear();
    const month = String(date.getMonth()+1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDisplayDate(value){
    const parts = value.split("-");
    if(parts.length !== 3) return "";
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  function getDateValue(){
    return $("date").value;
  }

  function setDateValue(value){
    $("date").value = value;
    $("dateDisplay").textContent = value ? formatDisplayDate(value) : "dd/mm/aaaa";
    $("dateDisplay").classList.toggle("is-empty", !value);
  }

  function syncCalendarToDate(){
    const value = getDateValue();
    if(!value) return;

    const parts = value.split("-").map(Number);
    if(parts.length === 3 && parts.every(Boolean)){
      calendarView = new Date(parts[0], parts[1]-1, 1);
    }
  }

  function closeCalendar(){
    $("calendarPopover").hidden = true;
    $("dateDisplay").setAttribute("aria-expanded", "false");
  }

  function openCalendar(){
    syncCalendarToDate();
    $("calendarPopover").hidden = false;
    $("dateDisplay").setAttribute("aria-expanded", "true");
    renderCalendar();
  }

  function toggleCalendar(){
    if($("calendarPopover").hidden) openCalendar();
    else closeCalendar();
  }

  function renderWeekdays(){
    $("calendarWeekdays").innerHTML = "";
    weekdayNames.forEach(day => {
      const item = document.createElement("div");
      item.className = "calendar-weekday";
      item.textContent = day;
      $("calendarWeekdays").appendChild(item);
    });
  }

  function renderCalendar(){
    const year = calendarView.getFullYear();
    const month = calendarView.getMonth();
    const selected = getDateValue();
    const currentMonthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

    $("calendarMonth").textContent = `${monthNames[month]} ${year}`;
    $("prevMonth").disabled = calendarView <= currentMonthStart;
    renderWeekdays();
    $("calendarDays").innerHTML = "";

    const firstDay = new Date(year, month, 1);
    const leadingDays = (firstDay.getDay()+6)%7;
    const daysInMonth = new Date(year, month+1, 0).getDate();

    for(let i=0; i<leadingDays; i++){
      const empty = document.createElement("button");
      empty.type = "button";
      empty.className = "calendar-day empty";
      empty.tabIndex = -1;
      $("calendarDays").appendChild(empty);
    }

    for(let day=1; day<=daysInMonth; day++){
      const date = new Date(year, month, day);
      const value = formatDateValue(date);
      const button = document.createElement("button");

      button.type = "button";
      button.className = "calendar-day";
      button.textContent = day;
      button.disabled = date < todayStart;

      if(value === formatDateValue(todayStart)) button.classList.add("today");
      if(value === selected) button.classList.add("selected");

      button.addEventListener("click", () => {
        setDateValue(value);
        closeCalendar();
        renderCalendar();
        onDateSelected(value);
      });

      $("calendarDays").appendChild(button);
    }
  }

  function initCalendar(options){
    onDateSelected = options?.onDateSelected || function(){};

    $("dateDisplay").addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      toggleCalendar();
    });

    $("dateDisplay").addEventListener("keydown", event => {
      if(event.key === "Enter" || event.key === " "){
        event.preventDefault();
        openCalendar();
      }
    });

    $("prevMonth").addEventListener("click", () => {
      calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth()-1, 1);
      renderCalendar();
    });

    $("nextMonth").addEventListener("click", () => {
      calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth()+1, 1);
      renderCalendar();
    });

    document.addEventListener("click", event => {
      const clickedCalendar = $("calendarPopover").contains(event.target);
      const clickedDate = $("dateDisplay").contains(event.target);
      if(!clickedCalendar && !clickedDate) closeCalendar();
    });

    document.addEventListener("keydown", event => {
      if(event.key === "Escape") closeCalendar();
    });

    setDateValue("");
    renderCalendar();
  }

  window.BarberiaCalendar = {
    initCalendar,
    getDateValue,
    closeCalendar,
    openCalendar
  };
})();
