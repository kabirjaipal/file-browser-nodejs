# File Browser SDK

A simple Node.js SDK for interacting with the File Browser API. This SDK supports authentication, folder management, file uploading, and other file management functionalities.

> **Note**: This SDK is **unofficial** and is not officially maintained by the [File Browser](https://github.com/filebrowser/filebrowser) project. Additionally, this SDK is currently under development and **should not be used in production**. It may have bugs and incomplete features.

## Features

- Log in using a username and password to get an authentication token.
- Create and delete folders.
- Upload files to specific folders with name support.
- Rename files.
- Get sharable links for files.
- Easy integration with your Node.js projects.

## Installation

You can install this SDK via npm:

```bash
npm install file-browser-nodejs
```

## Usage

### 1. Initialize the SDK

First, import and initialize the `FileBrowserSDK` class. You will need to provide the base API URL for your File Browser instance.

```javascript
const FileBrowserSDK = require("file-browser-nodejs");

const sdk = new FileBrowserSDK("http://your-file-browser-instance.com"); // Replace with your File Browser URL
```

### 2. Authentication

To authenticate and get an authentication token, use the `authenticate` method. This method requires a username and password.

```javascript
const username = "your_username"; // Replace with your username
const password = "your_password"; // Replace with your password

sdk
  .authenticate(username, password)
  .then(() => {
    console.log("Authenticated successfully");
  })
  .catch((err) => {
    console.error("Authentication failed:", err);
  });
```

### 3. Create a Folder

To create a folder, use the `createFolder` method. You need to provide the folder path where the folder should be created.

```javascript
const folderPath = "path/to/folder";

sdk
  .createFolder(folderPath)
  .then((data) => {
    console.log("Folder created:", data);
  })
  .catch((err) => {
    console.error("Error creating folder:", err);
  });
```

### 4. Delete a Folder

To delete a folder, use the `deleteFolder` method. Provide the path of the folder to be deleted.

```javascript
const folderPath = "path/to/folder";

sdk
  .deleteFolder(folderPath)
  .then(() => {
    console.log("Folder deleted successfully");
  })
  .catch((err) => {
    console.error("Error deleting folder:", err);
  });
```

### 5. Uploading a File

To upload a file, you need to provide the file's path and the destination folder path. The SDK handles file uploads by chunking and performing all necessary HTTP requests.

```javascript
const filePath = "path/to/your/file"; // Path to the file you want to upload
const folderPath = "destination/folder"; // Destination folder path

sdk
  .uploadFile(filePath, folderPath)
  .then((response) => {
    console.log("File uploaded successfully:", response);
  })
  .catch((err) => {
    console.error("Upload failed:", err);
  });
```

### 6. Rename a File

To rename a file, use the `renameFile` method. Provide the current file name and the new file name, along with the folder path.

```javascript
const folderPath = "path/to/folder";
const currentFileName = "old_file.txt";
const newFileName = "new_file.txt";

sdk
  .renameFile(folderPath, currentFileName, newFileName)
  .then((response) => {
    console.log("File renamed successfully:", response);
  })
  .catch((err) => {
    console.error("Error renaming file:", err);
  });
```

### 7. Get Sharable Link for a File

To generate a sharable link for a file, use the `getSharableLink` method. Provide the file path for which you want to generate the link.

```javascript
const filePath = "path/to/your/file";

sdk
  .getSharableLink(filePath)
  .then((linkData) => {
    if (linkData) {
      console.log("Sharable link generated:", linkData.url);
      console.log("Download link:", linkData.downloadLink);
    } else {
      console.log("No sharable link available.");
    }
  })
  .catch((err) => {
    console.error("Error generating sharable link:", err);
  });
```

### 8. Get File Details

To fetch details of a specific file or folder, use the `getFileDetails` method. Provide the file or folder path.

```javascript
const filePath = "path/to/your/file";

sdk
  .getFileDetails(filePath)
  .then((details) => {
    console.log("File details:", details);
  })
  .catch((err) => {
    console.error("Error fetching file details:", err);
  });
```

### 9. Get Files in a Folder

To list the files or folders in a specific folder, use the `getFilesInFolder` method. Provide the folder path.

```javascript
const folderPath = "path/to/folder";

sdk
  .getFilesInFolder(folderPath)
  .then((files) => {
    console.log("Files in folder:", files);
  })
  .catch((err) => {
    console.error("Error fetching files:", err);
  });
```

## Contributing

We welcome contributions to this project. If you want to help, please fork the repository and submit a pull request.

1. Fork the repo.
2. Create a new branch for your feature or bug fix.
3. Make changes and commit them.
4. Push your branch and create a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For any questions or issues, please open an issue on GitHub.
