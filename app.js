const weeklyData = [
  { companiesReached: 18, leads: 10, avgResponseHours: 20, avgCompletionHours: 46 },
  { companiesReached: 21, leads: 14, avgResponseHours: 17, avgCompletionHours: 41 },
  { companiesReached: 26, leads: 16, avgResponseHours: 14, avgCompletionHours: 38 },
  { companiesReached: 29, leads: 19, avgResponseHours: 12, avgCompletionHours: 33 }
];

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildMetrics(data) {
  const totalUniqueCompaniesReached = data[data.length - 1].companiesReached;
  const totalLeads = data.reduce((sum, week) => sum + week.leads, 0);
  const avgResponse = average(data.map((week) => week.avgResponseHours));
  const avgCompletion = average(data.map((week) => week.avgCompletionHours));

  return [
    {
      label: "Overall placecom performance",
      value: `${Math.round((totalLeads / (totalUniqueCompaniesReached || 1)) * 100)}%` 
    },
    { label: "Unique companies reached", value: totalUniqueCompaniesReached },
    { label: "Leads generated", value: totalLeads },
    { label: "Average response time", value: `${avgResponse.toFixed(1)} hrs` },
    { label: "Average completion time", value: `${avgCompletion.toFixed(1)} hrs` }
  ];
}

function renderMetrics() {
  const container = document.querySelector("#metrics");
  if (!container) return;

  const metrics = buildMetrics(weeklyData);

  container.innerHTML = metrics
    .map(
      (metric) => `
        <article class="metric">
          <div class="label">${metric.label}</div>
          <div class="value">${metric.value}</div>
        </article>
      `
    )
    .join("");
}

renderMetrics();
