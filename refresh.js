import { SupabaseAccess }
    from "./SupabaseAccess.js";

const database = new SupabaseAccess("https://ynrxfhpltaivjwbfsufa.supabase.co", "sb_publishable_Z-TIgzIUXW7La2XHy5upVg_DvLV0sKG");
await database.initialise()

async function getCategories(){
    const categories = await database.selectCategories()
   }

await getCategories();
