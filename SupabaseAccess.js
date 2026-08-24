import { createClient } from "https://esm.sh/@supabase/supabase-js";

export class SupabaseAccess {
    constructor(url, key, category_table="tblMatchingCategory", items_table="tblHistoricalItem", images_table="tblItemImage", bucket_name="Images") {
        this.connection = createClient(url, key)
        this.items_table = items_table;
        this.images_table = images_table;
        this.category_table = category_table;
        this.bucket_name = bucket_name;
        this.categories = null;
        this.subcategories = null;
    }
    async initialise(){
        this.categories = await this.selectCategories()
        this.subcategories_dict = await this.getSubcategoryDict()
    }
    async selectEntries(name=null, category=null, subcategory=null, description_keyword=null, start_date=null, end_date=null) {
        let query = this.connection.from(this.items_table).select("*");
        if (name != null) {
            query = query.ilike("Name", "%"+name+"%");
        }
        if (category != null) {
            query = query.eq("Category", category);
        }
        if (subcategory != null) {
            query = query.eq("Subcategory", subcategory);
        }
        if (description_keyword != null) {
            query = query.ilike("Description", "%"+description_keyword.replace(/ /g, "%")+"%") //
        }
        if (start_date != null) {
            query = query.gte("Year", start_date);
        }
        if (end_date != null) {
            query = query.lte("Year", end_date);
        }
        const { data, error } = await query;
        console.log(error);
        return data;
    }
    async selectCategories() {
        const {data, error} = await this.connection.from(this.category_table).select("Category");
        console.log(error);
        return new Set(data.map(row => row.Category));
    }
    async getCategories() {
        return this.categories;
    }
    async getSubcategoryDict() {
        const {data, error} = await this.connection.from(this.category_table).select("Category, Subcategory");
        console.log(error);
        const dict = {};
        for (const row of data) {
            const key = row.Category;
            const value = row.Subcategory;
            if (!dict[key]) {
                dict[key] = [];
            }
            dict[key].push(value);
        }
        return dict;
    }
    async getSubcategoriesForCategory(category=null) {
        // console.log(this.subcategories_dict)
        // console.log(this.subcategories_dict[category])
        return this.subcategories_dict[category];
    }
    async getImagePaths(item_id) {
        console.log(item_id);
        console.log(this.images_table);
        const {data, error} = await this.connection.from(this.images_table).select("IDNumber, ImagePath").eq("IDNumber", item_id);
        // console.log(error);
        console.log("Data", data);
        return new Set(data.map(row => row.ImagePath));
    }
    async checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    async loadImage(name) {
        const cached = sessionStorage.getItem(name);
        if (cached) {
            const img = new Image();
            img.src = cached;
            return img;
        }
        // todo make so checks if image is stored in github repo before loading from supabase?
        const fs = require('node:fs');
        console.log('here')
        var url = './Images/'.concat(name);
        if (await this.checkImageExists(url)){
            sessionStorage.setItem(name, url);
            const img = new Image();
            img.src = url;
            console.log("using local storage");
            return img;
        } else {
            console.log('using supabase access');
            // console.log("error", err);
            const url = this.connection.storage
                .from(this.bucket_name)
                .getPublicUrl(name).data.publicUrl;
            sessionStorage.setItem(name, url);
            const img = new Image();
            img.src = url;
            return img;
        }
    }

}
const database = new SupabaseAccess("https://ynrxfhpltaivjwbfsufa.supabase.co", "sb_publishable_Z-TIgzIUXW7La2XHy5upVg_DvLV0sKG");

// window.database = database;
console.log(await database.selectCategories());