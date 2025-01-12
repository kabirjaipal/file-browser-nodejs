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
      this.authToken = response.data.token || response.data; // Adjust if token is in a different field
    } catch (error) {
      this.handleError(error, "Authentication failed");
    }
  }

  // Helper function to create headers with authToken
  getHeaders() {
    if (!this.authToken) {
      throw new Error(
        "Authentication token is missing. Please authenticate first."
      );
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
        `${this.apiBaseUrl}/api/resources/${encodeURIComponent(
          folderPath
        )}/?override=false`,
        {},
        { headers: this.getHeaders() }
      );

      const { data } = await axios.get(
        `${this.apiBaseUrl}/api/resources/${encodeURIComponent(folderPath)}/`,
        { headers: this.getHeaders() }
      );

      return data;
    } catch (error) {
      this.handleError(error, `Error creating folder: ${folderPath}`);
    }
  }

  // Delete a folder
  async deleteFolder(folderPath) {
    try {
      await axios.delete(
        `${this.apiBaseUrl}/api/resources/${encodeURIComponent(folderPath)}/`,
        { headers: this.getHeaders() }
      );
      return true;
    } catch (error) {
      this.handleError(error, `Error deleting folder: ${folderPath}`);
    }
  }

  // Upload a file
  async uploadFile(filePath, folderPath) {
    try {
      const fileName = filePath.split("/").pop() + "_" + Date.now();

      const uploadUrl = `${
        this.apiBaseUrl
      }/api/tus/${folderPath}/${encodeURIComponent(fileName)}?override=false`;

      const initResponse = await axios.post(uploadUrl, null, {
        headers: {
          ...this.getHeaders(),
          Referer: `${this.apiBaseUrl}/files/${folderPath}`,
        },
      });

      const headResponse = await axios.head(uploadUrl, {
        headers: {
          ...this.getHeaders(),
          Referer: `${this.apiBaseUrl}/files/${folderPath}`,
        },
      });

      const uploadOffset = 0;
      const fileBuffer = fs.readFileSync(filePath); // Read the entire file into a buffer

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
        const fileDetails = await this.getFileDetails(
          `${folderPath}/${fileName}`
        );
        const sharableLink = await this.getSharableLink(fileDetails.path);

        return {
          name: fileDetails.name,
          folder: folderPath,
          path: fileDetails.path,
          fullPath: `${this.apiBaseUrl}/files${fileDetails.path}`,
          size: fileDetails.size,
          type: fileDetails.type,
          modified: fileDetails.modified,
          downloadLink: sharableLink.downloadLink,
          url: sharableLink.url,
        };
      } else {
        throw new Error("Upload incomplete or failed");
      }
    } catch (error) {
      this.handleError(error, `Error uploading file: ${filePath}`);
    }
  }

  // Get sharable link for a file
  async getSharableLink(filePath) {
    try {
      await axios.get(
        `${this.apiBaseUrl}/api/share${encodeURIComponent(filePath)}`,
        { headers: this.getHeaders() }
      );

      const { data } = await axios.post(
        `${this.apiBaseUrl}/api/share${encodeURIComponent(filePath)}`,
        {},
        { headers: this.getHeaders() }
      );

      if (!data) return null;

      return {
        url: `${this.apiBaseUrl}/share/${data.hash}`,
        downloadLink: `${this.apiBaseUrl}/api/public/dl/${data.hash}${data.path}`,
      };
    } catch (error) {
      this.handleError(error, `Error getting sharable link for: ${filePath}`);
    }
  }

  // Rename a file
  async renameFile(folderPath, fileName, newName) {
    try {
      const filePath = `${folderPath}/${fileName}`.replace(/\/+/g, "/");
      const encodedFilePath = encodeURIComponent(filePath);
      const encodedNewName = encodeURIComponent(newName);

      const response = await axios.patch(
        `${this.apiBaseUrl}/api/resources/${encodedFilePath}?action=rename&destination=${encodedNewName}`,
        null,
        { headers: this.getHeaders() }
      );

      return response.data;
    } catch (error) {
      this.handleError(error, `Error renaming file: ${folderPath}/${fileName}`);
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
      this.handleError(error, `Error fetching file details: ${filePath}`);
    }
  }

  // Get a list of files or folders in a folder
  async getFilesInFolder(folderPath) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/api/resources/${encodeURIComponent(folderPath)}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      this.handleError(error, `Error fetching files in folder: ${folderPath}`);
    }
  }

  // Handle errors and provide more readable error messages
  handleError(error, contextMessage) {
    if (error.response) {
      // Avoid exposing sensitive data
      console.error(`${contextMessage} - Status: ${error.response.status}`);
      console.error(
        `${contextMessage} - Error Message: ${
          error.response.data?.message || "Unknown error"
        }`
      );
    } else if (error.request) {
      // In case the request is made but no response is received
      console.error(`${contextMessage} - No response received from server.`);
    } else {
      // General error message for unexpected issues
      console.error(`${contextMessage} - ${error.message}`);
    }

    throw new Error(`${contextMessage} - ${error.message || "Unknown error"}`);
  }
}

module.exports = FileBrowserSDK;
