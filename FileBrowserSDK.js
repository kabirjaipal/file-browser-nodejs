const fs = require("fs");
const axios = require("axios");

class FileBrowserSDK {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.authToken = null;
  }

  // Authenticate using username and password
  async authenticate(username, password) {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/api/login`,
        {
          username,
          password,
          recaptcha: "", // Include the recaptcha if needed, else leave it empty
        },
        {
          headers: {
            accept: "*/*",
            "accept-language": "en-GB,en",
            "content-type": "application/json",
          },
        }
      );

      // Assuming the API returns a token in the response
      this.authToken = response.data; // Adjust this to match the actual response structure
    } catch (error) {
      this.handleError(error, "Error during authentication");
    }
  }

  // Helper function to create headers with authToken
  getHeaders() {
    if (!this.authToken) {
      throw new Error("No auth token found. Please authenticate first.");
    }

    return {
      accept: "*/*",
      "x-auth": this.authToken,
      "accept-language": "en-GB,en",
      "sec-gpc": "1",
      "tus-resumable": "1.0.0",
      "Content-Type": "application/json",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    };
  }

  // Create a new folder
  async createFolder(folderPath) {
    try {
      const response = await axios.post(
        `${this.apiBaseUrl}/api/resources/${encodeURIComponent(folderPath)}`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "Error creating folder");
    }
  }

  async uploadFile(filePath, folderPath) {
    try {
      const fileName = filePath.split("/").pop(); // Extract the file name from the path

      // Step 1: Initiate the Upload (POST Request to create a new upload session)
      const uploadUrl = `${
        this.apiBaseUrl
      }/api/tus/${folderPath}/${encodeURIComponent(fileName)}?override=false`;

      const initResponse = await axios.post(uploadUrl, null, {
        headers: {
          ...this.getHeaders(),
          Referer: `${this.apiBaseUrl}/files/${folderPath}`,
        },
      });

      // head request
      const headResponse = await axios.head(uploadUrl, {
        headers: {
          ...this.getHeaders(),
          Referer: `${this.apiBaseUrl}/files/${folderPath}`,
        },
      });

      const uploadOffset = 0;

      // Step 2: Read the entire file and send it in a single PATCH request
      const fileBuffer = fs.readFileSync(filePath); // Read the entire file into a buffer

      // Step 3: Send PATCH request with the entire file content
      const patchResponse = await axios.patch(uploadUrl, fileBuffer, {
        headers: {
          ...this.getHeaders(),
          Referer: `${this.apiBaseUrl}/files/${folderPath}`,
          "tus-resumable": "1.0.0",
          "upload-offset": uploadOffset.toString(),
          "content-type": "application/offset+octet-stream",
          "content-length": fileBuffer.length.toString(),
        },
      });

      if (patchResponse.status === 204) {
        // Upload complete!
        console.log("File uploaded successfully!");
        return patchResponse.data; // You may return the file metadata or confirmation response
      } else {
        throw new Error("Upload incomplete or failed");
      }
    } catch (error) {
      this.handleError(error, "Error uploading file");
    }
  }

  // Download a file
  async downloadFile(filePath, destination) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/api/public/dl/${filePath}`,
        { headers: this.getHeaders(), responseType: "stream" }
      );

      const writer = require("fs").createWriteStream(destination);
      response.data.pipe(writer);
      writer.on("finish", () => {
        console.log("File downloaded successfully");
      });
      return true;
    } catch (error) {
      this.handleError(error, "Error downloading file");
    }
  }

  // Get sharable link for a file
  async getSharableLink(filePath) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/api/share/${encodeURIComponent(filePath)}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "Error getting sharable link");
    }
  }

  // Get details of a file or folder
  async getFileDetails(filePath) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/api/resources/${encodeURIComponent(filePath)}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, "Error fetching file details");
    }
  }

  // Handle errors and provide more readable error messages
  handleError(error, contextMessage) {
    // Check if error is a response from the API
    if (error.response) {
      console.error(`${contextMessage}:`);
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
      console.error(
        `Headers: ${JSON.stringify(error.response.headers, null, 2)}`
      );
      throw new Error(
        `${contextMessage} - ${error.response.data?.message || "Unknown error"}`
      );
    }

    // If error is not a response, check for other types of errors
    if (error.request) {
      console.error(`${contextMessage}: No response received from server.`);
      throw new Error(`${contextMessage} - No response received from server.`);
    }

    // General error message for unexpected issues
    console.error(`${contextMessage}: ${error.message}`);
    throw new Error(`${contextMessage} - ${error.message}`);
  }
}

module.exports = FileBrowserSDK;
