import { CronJob } from "cron";
import axios from "axios";

export function initScheduler() {
  // Run every hour
  const job = new CronJob("0 * * * *", async () => {
    try {
      await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL}/api/update-article`);
      console.log("Successfully updated article");
    } catch (error) {
      console.error("Failed to update article:", error);
    }
  });

  job.start();
}
