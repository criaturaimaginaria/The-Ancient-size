export function getTooltipContent(info, areaText) {
  if (!info) return "<i>No data found</i>";

  return `
      <b>${info.name}</b><br>
      ${info.flag ? `<div class="flagContainer"><img src="${info.flag}"></div>` : ""}
      ${info.capital ? `<p><text>Capital:</text> ${info.capital}</p><br>` : ""}
      ${info.fundationFall ? `<p><text>Foundation–Fall:</text> ${info.fundationFall}</p><br>` : ""}
      ${info.GovernmentType ? `<p><text>Government type:</text> ${info.GovernmentType}</p><br>` : ""}
      ${info.currency ? `<p><text>Currency:</text> ${info.currency}</p><br>` : ""}
      ${info.religion ? `<p><text>Religion:</text> ${info.religion}</p><br>` : ""}
      ${info.lenguages ? `<p><text>Lenguages:</text> ${info.lenguages}</p><br>` : ""}
      ${areaText}
      ${info.population ? `<p><text>Population ≈</text> ${info.population}</p><br>` : ""}
      <p><text>Description:</text> ${info.description || ""}</p>
  `;
}