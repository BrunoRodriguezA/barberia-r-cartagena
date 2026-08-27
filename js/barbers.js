(function(){
  const { $ } = window.BarberiaDom;
  const { fallbackBarbers } = window.BarberiaData;
  const supabase = window.BarberiaSupabase.client;

  let barbers = [];

  function renderBarbers(){
    const list = $("barbersList");
    const select = $("barber");

    select.innerHTML = '<option value="">Selecciona tu barbero</option>';
    list.innerHTML = "";

    barbers.forEach(barber => {
      const opt = document.createElement("option");
      opt.value = barber.nombre;
      opt.textContent = barber.nombre;
      select.appendChild(opt);

      const card = document.createElement("div");
      card.className = "barber";

      const icon = document.createElement("div");
      icon.className = "barber-icon";
      icon.textContent = barber.nombre.charAt(0).toUpperCase();

      const title = document.createElement("h3");
      title.textContent = barber.nombre;

      const desc = document.createElement("p");
      desc.textContent = "Barbero de Barbería R.";

      const button = document.createElement("button");
      button.className = "choose";
      button.type = "button";
      button.textContent = "ELEGIR";
      button.addEventListener("click", () => {
        select.value = barber.nombre;
        $("reservar").scrollIntoView({ behavior: "smooth" });
        window.BarberiaBooking.renderSlots();
      });

      card.append(icon, title, desc, button);
      list.appendChild(card);
    });
  }

  async function loadBarbers(){
    barbers = fallbackBarbers;
    renderBarbers();

    if(!supabase){
      console.warn("Supabase no está disponible; usando barberos locales.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("barberos")
        .select("id,nombre,activo")
        .eq("activo", true)
        .order("id");

      if(!error && data && data.length){
        barbers = data;
        renderBarbers();
      } else if(error){
        console.warn("No se pudieron sincronizar los barberos desde Supabase:", error);
      }
    } catch (error) {
      console.warn("No se pudieron sincronizar los barberos desde Supabase:", error);
    }
  }

  window.BarberiaBarbers = { loadBarbers };
})();
