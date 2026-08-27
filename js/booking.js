(function(){
  const { $, escapeHtml } = window.BarberiaDom;
  const { slotsByDay } = window.BarberiaData;
  const { whatsapp } = window.BarberiaConfig;
  const supabase = window.BarberiaSupabase.client;

  function showMessage(text, ok=false){
    $("bookingMessage").hidden = false;
    $("bookingMessage").innerHTML = text;
    $("bookingMessage").style.border = ok ? "1px solid #3d7d50" : "1px solid #6b4f20";
  }

  function showWhatsappFallback(name, phone, service, barber, date, time){
    const msg = `Hola Barbería R, quiero confirmar una cita.%0A%0ANombre: ${encodeURIComponent(name)}%0ATeléfono: ${encodeURIComponent(phone)}%0AServicio: ${encodeURIComponent(service)}%0ABarbero: ${encodeURIComponent(barber)}%0ADía: ${encodeURIComponent(date)}%0AHora: ${encodeURIComponent(time)}`;
    showMessage(`Reserva pendiente de confirmar.<br>${escapeHtml(date)} a las ${escapeHtml(time)} con ${escapeHtml(barber)}.<br><br><a href="https://wa.me/${whatsapp}?text=${msg}" target="_blank" style="color:var(--gold);font-weight:800">Confirmar por WhatsApp</a>`, true);
  }

  async function getBusyTimes(date, barber){
    if(!supabase){
      showMessage("Mostrando horarios de referencia. Confirma la cita por WhatsApp.");
      return [];
    }

    try {
      const [blocked, booked] = await Promise.all([
        supabase.from("citas_disponibilidad").select("hora").eq("fecha", date),
        supabase.rpc("horas_ocupadas", { p_fecha: date, p_barbero: barber })
      ]);

      if(blocked.error){
        console.error(blocked.error);
        showMessage("No se pudieron cargar las horas ocupadas. Mostrando horarios de referencia.");
        return [];
      }

      if(booked.error){
        console.error(booked.error);
        showMessage("No se pudieron consultar las horas del barbero. Mostrando horarios de referencia.");
        return [];
      }

      $("bookingMessage").hidden = true;
      return [...(blocked.data || []), ...(booked.data || [])]
        .map(row => String(row.hora).slice(0, 5));
    } catch (error) {
      console.error(error);
      showMessage("No se pudieron consultar las horas. Mostrando horarios de referencia.");
      return [];
    }
  }

  async function renderSlots(){
    const date = window.BarberiaCalendar.getDateValue();
    const barber = $("barber").value;

    $("time").value = "";
    $("slots").innerHTML = "";

    if(!date || !barber){
      $("slots").innerHTML = '<span class="small">Selecciona primero barbero y día.</span>';
      return;
    }

    const used = await getBusyTimes(date, barber);

    slotsByDay.forEach(time => {
      const button = document.createElement("button");
      const busy = used.includes(time);

      button.type = "button";
      button.className = `slot${busy ? " busy" : ""}`;
      button.textContent = time;
      button.disabled = busy;
      button.addEventListener("click", () => {
        document.querySelectorAll(".slot").forEach(slot => slot.classList.remove("selected"));
        button.classList.add("selected");
        $("time").value = time;
      });

      $("slots").appendChild(button);
    });
  }

  async function submitBooking(event){
    event.preventDefault();

    const name = $("clientName").value.trim();
    const phone = $("clientPhone").value.trim();
    const serviceRaw = $("service").value;
    const barber = $("barber").value;
    const date = window.BarberiaCalendar.getDateValue();
    const time = $("time").value;

    if(!date){
      showMessage("Elige un día.");
      return;
    }

    if(!time){
      showMessage("Elige una hora disponible.");
      return;
    }

    const service = serviceRaw.split(" — ")[0];
    if(!supabase){
      showWhatsappFallback(name, phone, service, barber, date, time);
      return;
    }

    const { error } = await supabase
      .from("citas")
      .insert([{ nombre: name, telefono: phone, servicio: service, fecha: date, hora: time, barbero: barber }]);

    if(error){
      console.error(error);
      if(error.code === "23505"){
        showMessage("❌ Esa hora acaba de ser reservada por otra persona.");
        await renderSlots();
        return;
      }
      showWhatsappFallback(name, phone, service, barber, date, time);
      return;
    }

    const msg = `Hola Barbería R, quiero confirmar una cita.%0A%0ANombre: ${encodeURIComponent(name)}%0ATeléfono: ${encodeURIComponent(phone)}%0AServicio: ${encodeURIComponent(service)}%0ABarbero: ${encodeURIComponent(barber)}%0ADía: ${encodeURIComponent(date)}%0AHora: ${encodeURIComponent(time)}`;
    showMessage(`✅ <strong>Reserva realizada correctamente.</strong><br>${escapeHtml(date)} a las ${escapeHtml(time)} con ${escapeHtml(barber)}.<br><br><a href="https://wa.me/${whatsapp}?text=${msg}" target="_blank" style="color:var(--gold);font-weight:800">Enviar confirmación por WhatsApp</a>`, true);

    $("bookingForm").reset();
    $("time").value = "";
    $("slots").innerHTML = '<span class="small">Selecciona primero barbero y día.</span>';
  }

  function initBooking(){
    $("barber").addEventListener("change", renderSlots);
    $("bookingForm").addEventListener("submit", submitBooking);
  }

  window.BarberiaBooking = { initBooking, renderSlots, showMessage };
})();
