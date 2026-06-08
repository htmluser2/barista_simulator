const recipes = [
  {
    name: "Еспресо",
    price: 4,
    ingredients: ["espresso"]
  },
  {
    name: "Лате",
    price: 7,
    ingredients: ["espresso", "milk", "foam"]
  },
  {
    name: "Капучино",
    price: 7,
    ingredients: ["espresso", "milk", "foam", "chocolate"]
  },
  {
    name: "Айс-лате",
    price: 8,
    ingredients: ["ice", "espresso", "milk"]
  },
  {
    name: "Карамельний лате",
    price: 9,
    ingredients: ["espresso", "milk", "foam", "caramel"]
  },
  {
    name: "Мокачино",
    price: 9,
    ingredients: ["espresso", "milk", "chocolate", "foam"]
  }
];

const ingredientNames = {
  espresso: "Еспресо",
  milk: "Молоко",
  foam: "Пінка",
  chocolate: "Шоколад",
  ice: "Лід",
  caramel: "Карамель"
};

const customerPhrases = [
  "Доброго дня! Хочу швиденько:",
  "Мені, будь ласка:",
  "Я поспішаю, зробіть:",
  "Сьогодні важкий день. Дайте:",
  "Хочу щось смачне. Мені:",
  "О, у вас затишно! Замовляю:"
];

let money = 0 || +localStorage.getItem("money") 
let served = 0 || +localStorage.getItem("served")
let mistakes = 0 || +localStorage.getItem("mistakes")
let currentOrder = null;
let madeDrink = [];
let timeLeft = 0;
let maxTime = 25;
let timerId = null;

const moneyEl = document.getElementById("money");
const servedEl = document.getElementById("served");
const mistakesEl = document.getElementById("mistakes");
const customerTextEl = document.getElementById("customerText");
const orderNameEl = document.getElementById("orderName");
const recipesEl = document.getElementById("recipes");
const madeListEl = document.getElementById("madeList");
const currentDrinkEl = document.getElementById("currentDrink");
const cupFillEl = document.getElementById("cupFill");
const foamEl = document.getElementById("foam");
const timerBarEl = document.getElementById("timerBar");
const timeTextEl = document.getElementById("timeText");
const logEl = document.getElementById("log");

const newCustomerBtn = document.getElementById("newCustomerBtn");
const serveBtn = document.getElementById("serveBtn");
const clearBtn = document.getElementById("clearBtn");
const ingredientButtons = document.querySelectorAll("[data-ingredient]");

const customerMouthEl = document.getElementById("mouth2");
const customerEyesEl = document.querySelector(".eyes");
const customerFaceEl = document.querySelector(".face");

function customerFeel(state = "none") {
  customerMouthEl.classList.remove("sad");
  customerEyesEl.classList.remove("sad", "cry");
  customerFaceEl.classList.remove("sad", "cry");

  if (state === "sad") {
    customerMouthEl.classList.add("sad");
    customerEyesEl.classList.add("sad");
    customerFaceEl.classList.add("sad");
  }

  if (state === "cry") {
    customerMouthEl.classList.add("sad");
    customerEyesEl.classList.add("cry");
    customerFaceEl.classList.add("cry");
  }
}

function renderRecipes() {
  recipesEl.innerHTML = "";

  recipes.forEach(recipe => {
    const div = document.createElement("div");
    div.className = "recipe";

    div.innerHTML = `
      <h3>${recipe.name} — $${recipe.price}</h3>
      <p>${recipe.ingredients.map(item => ingredientNames[item]).join(" → ")}</p>
    `;

    recipesEl.appendChild(div);
  });
}

function updateStats() {
  moneyEl.textContent = `$${money}`;
  servedEl.textContent = served;
  mistakesEl.textContent = mistakes;
}

function addLog(text, type = "neutral") {
  const item = document.createElement("div");
  item.className = `log-item ${type}`;
  item.textContent = text;

  logEl.prepend(item);

  while (logEl.children.length > 8) {
    logEl.removeChild(logEl.lastChild);
  }
}

function startNewCustomer() {
  customerFeel('none');
  clearDrink();

  currentOrder = recipes[Math.floor(Math.random() * recipes.length)];
  const phrase = customerPhrases[Math.floor(Math.random() * customerPhrases.length)];

  customerTextEl.textContent = phrase;
  orderNameEl.textContent = currentOrder.name;

  maxTime = 8 + Math.floor(Math.random() * 5);
  timeLeft = maxTime;

  if (timerId) clearInterval(timerId);

  timerId = setInterval(() => {
    timeLeft--;
    updateTimer();

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      customerLeaves();
    }
  }, 1000);

  updateTimer();
  addLog(`Новий покупець замовив: ${currentOrder.name}`, "neutral");
}

function updateTimer() {
  if (!currentOrder) {
    timerBarEl.style.width = "0%";
    timeTextEl.textContent = "—";
    return;
  }

  const percent = Math.max(0, (timeLeft / maxTime) * 100);
  timerBarEl.style.width = `${percent}%`;
  timeTextEl.textContent = `${timeLeft} с`;
}

function customerLeaves() {
  mistakes++;
  updateStats();

  customerTextEl.textContent = "Я вже передумав. Занадто довго!";
  orderNameEl.textContent = "Клієнт пішов";

  currentOrder = null;
  clearDrink();
  updateTimer();

  customerFeel("cry");
  addLog("Клієнт не дочекався, розплакався і пішов. Оплата втрачена.", "bad");
}

function addIngredient(ingredient) {
  if (!currentOrder) {
    addLog("Спочатку прийми замовлення від клієнта.", "bad");
    return;
  }

  madeDrink.push(ingredient);
  renderMadeDrink();
  updateCup();
}

function renderMadeDrink() {
  madeListEl.innerHTML = "";

  if (madeDrink.length === 0) {
    currentDrinkEl.textContent = "Порожня чашка";
    return;
  }

  madeDrink.forEach(item => {
    const li = document.createElement("li");
    li.textContent = ingredientNames[item];
    madeListEl.appendChild(li);
  });

  currentDrinkEl.textContent = madeDrink.map(item => ingredientNames[item]).join(" + ");
}

function updateCup() {
  const fillPercent = Math.min(100, madeDrink.length * 22);
  cupFillEl.style.height = `${fillPercent}%`;

  if (madeDrink.includes("foam")) {
    foamEl.style.height = "28px";
    foamEl.style.bottom = `${Math.max(10, fillPercent - 14)}%`;
    foamEl.style.opacity = "1";
  } else {
    foamEl.style.height = "0";
    foamEl.style.opacity = "0";
  }

  if (madeDrink.includes("chocolate")) {
    cupFillEl.style.background = "linear-gradient(#b66a35, #35170d)";
  } else if (madeDrink.includes("milk")) {
    cupFillEl.style.background = "linear-gradient(#e9c99a, #6b351c)";
  } else {
    cupFillEl.style.background = "linear-gradient(#d28a45, #3b180d)";
  }
}

function clearDrink() {
  madeDrink = [];
  renderMadeDrink();
  cupFillEl.style.height = "0%";
  foamEl.style.height = "0";
  foamEl.style.opacity = "0";
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
}


function serveDrink() {
  if (!currentOrder) {
    addLog("Немає активного замовлення.", "bad");
    return;
  }



  const isCorrect = arraysEqual(madeDrink, currentOrder.ingredients);

  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }



  if (isCorrect) {
    const tipChance = Math.random();
    let tip = 0;

    if (tipChance > 0.68) {
      tip = 1 + Math.floor(Math.random() * 5);
    }

    const earned = currentOrder.price + tip;

    money += earned;
    localStorage.setItem("money", money);
    served++;
    localStorage.setItem("served", served)

    customerTextEl.textContent = tip > 0
      ? `Ідеально! Тримайте $${tip} чайовихf.`
      : "Супер, саме те, що треба!";
    orderNameEl.textContent = `+ $${earned}`;

    addLog(`Правильний напій: ${currentOrder.name}. Зароблено $${earned}.`, "good");
  } else {
    mistakes++;
    localStorage.setItem("mistakes", mistakes)
    customerTextEl.textContent = "Це не те, що я замовляв. Я не платитиму.";
    orderNameEl.textContent = "$0";
    addLog(`Помилка. Треба було: ${currentOrder.ingredients.map(i => ingredientNames[i]).join(" → ")}.`, "bad");
    customerFeel('sad');
  }

  currentOrder = null;
  updateStats();
  updateTimer();
  clearDrink();
}

newCustomerBtn.addEventListener("click", startNewCustomer);
serveBtn.addEventListener("click", serveDrink);
clearBtn.addEventListener("click", clearDrink);

ingredientButtons.forEach(button => {
  button.addEventListener("click", () => {
    addIngredient(button.dataset.ingredient);
  });
});

renderRecipes();
updateStats();
updateTimer();
addLog("Гра готова. Натисни “Новий клієнт”.", "neutral");
