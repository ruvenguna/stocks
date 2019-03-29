import $ from "jquery";
import "babel-polyfill";

let portfolio = [
  { symbol: "AAPL", purchasePrice: 192.0, qty: 100 },
  { symbol: "FB", purchasePrice: 163.0, qty: 25 }
];

const fetchPrices = async symbols => {
  const symbolsLowerCase = symbols.map(t => t.toLocaleLowerCase()).join(",");

  const resp = await fetch(
    `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbolsLowerCase}&types=price`
  );

  const data = await resp.json();

  return data;
};

let prices = {};

const refreshPrices = async () => {
  let symbols = portfolio.map(t => t.symbol);
  prices = await fetchPrices(symbols);
};

let addToPortfolio = (symbol, purchasePrice, qty) => {
  portfolio.push({
    symbol: symbol,
    purchasePrice: purchasePrice,
    qty: qty
  });
};

let removeFromPortfolio = symbol => {
  // Keep only those stocks not matching the symbol
  portfolio = portfolio.filter(stock => stock.symbol !== symbol);
};

const toCardHtml = item => {
  let priceStr = "--";
  let plStr = "--";

  if (prices[item.symbol]) {
    let price = prices[item.symbol].price;
    let pl = (price - item.purchasePrice) * item.qty;

    priceStr = price.toString();

    plStr = pl.toFixed(2).toString();
  }

  return `
	<article class="col-6" id="${item.symbol}">
	  <div class="card border-dark mb-3">
	    <div class="card-body text-dark">
	      <h2 class="card-title">${item.symbol}</h2>
	      <p class="card-text">
          <p>
            Price: <span>$${priceStr}</span> |
            P/L: <span>$${plStr}</span>
          </p>
          <p class="removeButton text-info">
            Remove
          </p>
	      </p>
	    </div>
	  </div>
	</article>
	`;
};

const displayPortfolio = () => {
  const portfolioSection = $("#portfolio");

  const cards = portfolio.map(toCardHtml).join("");

  portfolioSection.html(cards);
};

const addBtnClicked = async () => {
  const symbol = $("#symbol").val();
  const purchasePrice = $("#purchasePrice").val();
  const qty = $("#qty").val();

  addToPortfolio(symbol, parseFloat(purchasePrice), parseInt(qty));

  await refreshPrices();

  displayPortfolio();
};

const removeBtnClicked = event => {
  const card = $(event.target)
    .parent()
    .parent()
    .parent();

  const symbol = card.attr("id");

  removeFromPortfolio(symbol);

  displayPortfolio();
};

const init = async () => {
  await refreshPrices();
  displayPortfolio();
};

init();

$("body").on("click", "#addButton", addBtnClicked);
$("body").on("click", ".removeButton", removeBtnClicked);
