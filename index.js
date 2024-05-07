(function initialize() {
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  const currentYear = new Date().getFullYear();
  const startYear = new Date().getFullYear() - 5;

  startDateInput.value = startYear;
  endDateInput.value = currentYear;

  document
    .getElementById("calculate")
    .addEventListener("click", () =>
      calculatePrice({ startDate: startDateInput, endDate: endDateInput })
    );
})();

async function calculatePrice({ startDate, endDate }) {
  const startDateValue = Number(startDate.value);
  const endDateValue = Number(endDate.value);
  let price = document.getElementById("price").value;
  const additionalDiscount =
    document.getElementById("additional-discount").value || 0;

  for (let year = startDateValue; year <= endDateValue; year++) {
    const inflation = await getInflationForYear(year);
    const discount = 15 - inflation;
    price -= price * (discount / 100);
  }

  price -= price * (additionalDiscount / 100);

  document.getElementById("result").innerText = price.toFixed(2);

  return price;
}

let inflationData = null;

async function fetchInflationData() {
  const response = await fetch(
    "https://stats.oecd.org/sdmx-json/data/DP_LIVE/POL.CPI.TOT.AGRWTH.A/OECD?json-lang=en&dimensionAtObservation=allDimensions"
  );
  const data = await response.json();

  const timePeriod = data.structure.dimensions.observation.filter(
    ({ id }) => id === "TIME_PERIOD"
  )[0];
  const timePeriodValues = timePeriod.values;

  inflationData = Object.values(
    data.dataSets[data.dataSets.length - 1].observations
  ).map((value, index) => ({
    year: Number(timePeriodValues[index].id),
    inflation: value[0],
  }));
}

async function getInflationForYear(year) {
  if (!inflationData) {
    await fetchInflationData();
  }

  const dataForYear = inflationData.find((data) => data.year === year);

  return dataForYear ? dataForYear.inflation : 0;
}
