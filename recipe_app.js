const mealsEl = document.getElementById("meals");
const favoriteMealsContainer = document.getElementById("fav-meals");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

const mealPopup = document.getElementById("meal-popup");
const mealInfoEl = document.getElementById("meal-info");
const closePopupBtn = document.getElementById("close-popup");

getRandomMeal();
fetchFavMeals();

// get random meal
async function getRandomMeal() {
    const resp =  await fetch("http://www.themealdb.com/api/json/v1/1/random.php");
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    console.log(randomMeal);
    addMeal(randomMeal, true);
}

// get meal by its id
async function getMealById(id) {
    const resp = await fetch("http://www.themealdb.com/api/json/v1/1/lookup.php?i=" +id);
    const respData = await resp.json();
    const meal = respData.meals[0];

    return meal;
} 

// get meal by its name
async function getMealsBySearch(term) {  
    const resp = await fetch("http://www.themealdb.com/api/json/v1/1/search.php?s=" +term);
    const respData = await resp.json();
    const meals = respData.meals;

    return meals;
}

// adds meal to the meals 
function addMeal(mealData, random = false) {
    const meal = document.createElement("div");
    meal.classList.add("meal");
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random">
            Random Recipe
            </span>` : ""}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
            <i class="fas fa-heart"></i>
            </button>
        </div>
    `;
    const btn = meal.querySelector(".meal-body .fav-btn");

   btn.addEventListener("click", () => {
        if(btn.classList.contains("active")) {
            removeMealLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });
    const showInfo = meal.querySelector(".meal-header");

    showInfo.addEventListener("click", () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}

// adds the given meal's id to the localStorage
function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

// removes the meal from the localStorage
function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem("mealIds", JSON.stringify(mealIds.filter(id => id !== mealId)));
}

// gets all meals array from the localStorage
function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));

    return mealIds === null ? [] : mealIds;
}

// adds all liked meals to Favorite Meals
async function fetchFavMeals() {
    // clean the favorite container
    favoriteMealsContainer.innerHTML = "";
    const mealIds = getMealsLS();

    for(let i = 0; i < mealIds.length; i++) {
        
        const mealId = mealIds[i];
        let meal = await getMealById(mealId);

        addMealToFav(meal);
    }
}

// shows information about a specified meal
function showMealInfo(mealData) {
    let mealEl = document.createElement("div");

    const ingredients = [];

    for(let i = 1; i <= 20; i++) {
        if(mealData["strIngredient"+i]) {
            ingredients.push(`${mealData["strIngredient"+i]} - ${mealData["strMeasure"+i]}`);
        } else {
            break;
        }
    }
    console.log(ingredients);
    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="">
        <p>${mealData.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
        </ul>
    `;

    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove("hidden");
}

// adds meal to favorites
function addMealToFav(mealData) {
    const favMeal = document.createElement("li");
    const favButton = mealsEl.querySelector(".meal .meal-body .fav-btn");

    favMeal.innerHTML = `
        <img class="fav-info" src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <span>${mealData.strMeal}</span>
        <button class="clear"><i class = "fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");
    btn.addEventListener("click", () => {
        removeMealLS(mealData.idMeal);
        if(favButton.classList.contains("active")) {
            favButton.classList.remove("active");
        }
        fetchFavMeals();
    });

    const favInfo = favMeal.querySelector(".fav-info");
    favInfo.addEventListener("click", (item) => {
        showMealInfo(mealData);
    });

    favoriteMealsContainer.appendChild(favMeal);
}

searchBtn.addEventListener("click", async () => {
    mealsEl.innerHTML = "";
    const search = searchTerm.value;
    const meals = await getMealsBySearch(search);

    if(meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});


closePopupBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
    mealInfoEl.innerHTML = "";
});

// added Event handler when "Enter" keyword is pressed on search input
searchTerm.addEventListener("keyup", (e) => {
    if(e.keyCode === 13) {
        searchBtn.click();
    }
});