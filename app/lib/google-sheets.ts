// lib/google-sheets.ts
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function getGoogleSheets() {
  try {
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error("Private key is missing");
    }

    // Clean up the private key string
    const cleanPrivateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
      .replace(/"/g, "")
      .trim();

    // Clean up the service account email
    const serviceAccountEmail =
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();

    const jwt = new JWT({
      email: serviceAccountEmail,
      key: cleanPrivateKey,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    const sheetId = process.env.GOOGLE_SHEET_ID?.trim();
    if (!sheetId) {
      throw new Error("Google Sheet ID is missing");
    }

    const doc = new GoogleSpreadsheet(sheetId, jwt);

    // Add error handling for loadInfo
    try {
      await doc.loadInfo();
    } catch (loadError) {
      console.error("Error loading sheet info:", loadError);
      throw loadError;
    }

    return doc;
  } catch (error) {
    console.error("Detailed error:", {
      serviceEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      sheetId: process.env.GOOGLE_SHEET_ID,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error;
  }
}
