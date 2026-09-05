(function () {
  const DIAS = [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado"
  ];
  const MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  const elWeekday = document.getElementById("weekday");
  const elDate = document.getElementById("date");
  const elTime = document.getElementById("time");
  const elYear = document.getElementById("year");

  function pad(n) { return n.toString().padStart(2, "0"); }

  function tick() {
    const now = new Date();
    if (elWeekday) elWeekday.textContent = DIAS[now.getDay()];
    if (elDate) elDate.textContent =
      now.getDate() + " de " + MESES[now.getMonth()] + " de " + now.getFullYear();
    if (elTime) elTime.textContent =
      pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  }

  if (elYear) elYear.textContent = new Date().getFullYear();
  tick();
  setInterval(tick, 1000);
})();
