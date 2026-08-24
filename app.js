import { SupabaseAccess }
    from "./SupabaseAccess.js";

const database = new SupabaseAccess("https://ynrxfhpltaivjwbfsufa.supabase.co", "sb_publishable_Z-TIgzIUXW7La2XHy5upVg_DvLV0sKG");
await database.initialise()

async function showCategories(){
    const categories = await database.selectCategories()
    //console.log(categories)
    const dropdown_select = document.getElementById("category");
    //console.log("here");
    categories.forEach(category => {
        //console.log('here');
        const option =
            document.createElement(
                "option"
            );
        option.value = category;
        option.textContent = category;
        dropdown_select.appendChild(option);
    });
}

async function showSubcategories(){
    console.log("Updating subcategories");
    const category_select = document.getElementById("category");
    const subcategory_select = document.getElementById("subcategory");
    const category = category_select.options[category_select.selectedIndex].value
    let subcategories = ["All Subcategories"];
    if (category !== ""){
        subcategories = subcategories.concat(await database.getSubcategoriesForCategory(category));
        // console.log("here");
        // console.log(subcategories);
    }
    subcategory_select.options.length = 0;
    subcategories.forEach(subcategory => {
        //console.log('here');
        const option =
            document.createElement(
                "option"
            );
        option.value = subcategory;
        option.textContent = subcategory;
        subcategory_select.appendChild(option);
    });
}

async function showTable(){
    let name = document.getElementById("name").value || null;
    let description = document.getElementById("description").value || null;
    let category = document.getElementById("category").value || null;
    let subcategory = document.getElementById("subcategory").value || null;
    let start_date = document.getElementById("start_year").value || null;
    let end_date = document.getElementById("end_year").value || null;
    // console.log(name, description, category, start_date, end_date);
    if (category === "" || category === "All Categories"){
        category = null;
    } if (subcategory === "All Subcategories" || subcategory === ""){
        subcategory = null;
    }
    let entries = await database.selectEntries(name, category, subcategory, description, start_date, end_date);
    // console.log(entries)
    const table_body = document.getElementById("historical_data");
    table_body.innerHTML = "";
    for (const entry of entries){
        const row = document.createElement("tr");
        const name_cell = document.createElement("td");
        name_cell.textContent = entry.Name.toUpperCase();
        row.appendChild(name_cell);
        const description_cell = document.createElement("td");
        description_cell.textContent = entry.Description;
        row.appendChild(description_cell);
        const category_cell = document.createElement("td");
        category_cell.textContent = entry.Category;
        row.appendChild(category_cell);
        const subcategory_cell = document.createElement("td");
        subcategory_cell.textContent = entry.Subcategory;
        row.appendChild(subcategory_cell);
        const year_cell = document.createElement("td");
        console.log(entry.Confident);
        if (entry.Confident === false) {
            year_cell.textContent = "c.".concat(" ", entry.Year);
        } else{
            year_cell.textContent = entry.Year;
        }
        // year_cell.textContent = entry.Year;
        row.appendChild(year_cell);
        const images_cell = document.createElement("td");
        const images = await database.getImagePaths(entry.IDNumber);
        console.log(images);
        for (const path of images) {
            const img = await database.loadImage(path);
            img.classList.add("item-image");
            img.alt = entry.Name;
            // img.loading = "lazy";
            images_cell.appendChild(img);
        }
        row.appendChild(images_cell);
        table_body.appendChild(row);

    }

}

await showCategories();

// console.log((await database.getSubcategoryDict())["Stained Glass Windows"]);
// var a = await database.getSubcategoriesForCategory("Stalls");
// console.log(a);
document.getElementById("category").addEventListener("change", showSubcategories);
document.getElementById("search").addEventListener("click", showTable);
await showTable();