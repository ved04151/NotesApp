import cron from "node-cron";
import Note from "../models/note.model.js";

export const startAutoDeleteJob = () =>{
    cron.schedule("0 0 * * *", async () =>{
        console.log("Running Auto Delete job...");

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // thirtyDaysAgo.setMinutes(thirtyDaysAgo.getMinutes() - 1); too test in 1 min


        try{
            const result = await Note.deleteMany({
                isDeleted : true,
                deletedAt : {$lte : thirtyDaysAgo}
            })

            console.log(`${result.deletedCount} notes permanently deleted`);
        }
        catch(error){
            console.error("Auto Delete error : ", error.message);
        }
    })
}