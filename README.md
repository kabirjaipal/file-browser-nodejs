# File Browser SDK

A simple Node.js SDK for building a file browser interface with authentication and file upload functionality.

> **Note**: This SDK is currently under development and **should not be used in production**. It may have bugs and incomplete features.

## Features

- Log in using a username and password to get an authentication token
- Upload files to the server with name and folder support
- Easy integration with your Node.js projects

## Installation

You can install this SDK via npm:

```bash
npm install file-browser-sdk
```

## Usage

### Authentication

To authenticate and get an auth token:

```javascript
const FileBrowserSDK = require('file-browser-sdk');

const sdk = new FileBrowserSDK('username', 'password');
sdk.authenticate()
  .then(token => {
    console.log('Authenticated successfully with token:', token);
  })
  .catch(err => {
    console.error('Authentication failed:', err);
  });
```

### Uploading a File

To upload a file:

```javascript
const file = 'path/to/your/file';
const folder = 'folder_name';

sdk.uploadFile(file, folder)
  .then(response => {
    console.log('File uploaded successfully:', response);
  })
  .catch(err => {
    console.error('Upload failed:', err);
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