const fileBrowser = new FileBrowserSDK("http://localhost:8080");

// Authenticate using username and password
const authenticateAndUpload = async () => {
  try {
    await fileBrowser.authenticate("admin", "admin"); // Replace with actual username and password

    // Now you can upload a file or perform other actions
    const result = await fileBrowser.uploadFile("FILE_PATH", "FOLDER_NAME");
    console.log("File uploaded:", result);
  } catch (error) {
    console.error("Error:", error.message); // Improved error message output
  }
};

authenticateAndUpload();
