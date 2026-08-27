(function(){
  const { $ } = window.BarberiaDom;
  const { instagramUrl } = window.BarberiaConfig;

  function initNavigation(){
    $("instagramLink").href = instagramUrl;
    $("instagramContact").href = instagramUrl;
    $("menuBtn").addEventListener("click", () => $("navLinks").classList.toggle("open"));
  }

  function init(){
    initNavigation();
    window.BarberiaCalendar.initCalendar({
      onDateSelected: () => window.BarberiaBooking.renderSlots()
    });
    window.BarberiaBooking.initBooking();
    window.BarberiaBarbers.loadBarbers();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
