// src/index.js

const { BlobServiceClient } = require("@azure/storage-blob");
// Now do something interesting with BlobServiceClient :)

const createContainerButton = document.getElementById("create-container-button");
const deleteContainerButton = document.getElementById("delete-container-button");
const selectButton = document.getElementById("select-button");
const fileInput = document.getElementById("file-input");
const listButton = document.getElementById("list-button");
const deleteButton = document.getElementById("delete-button");
const status = document.getElementById("status");
const fileList = document.getElementById("file-list");
const downloadButton = document.getElementById("download-button");


const reportStatus = message => {
    status.innerHTML += `${message}<br/>`;
    status.scrollTop = status.scrollHeight;
}

const accountname = "nowherestorage"
const sas = "?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupx&se=2022-04-03T01:20:09Z&st=2022-04-02T17:20:09Z&spr=https&sig=d2SFl%2FKxy74c%2ByIyEUhezLfkB82np6g48hKTBS5tf5E%3D"
const blobSasUrl =  "https://nowherestorage.blob.core.windows.net?sv=2020-08-04&ss=bfqt&srt=sco&sp=rwdlacupx&se=2022-04-03T01:39:38Z&st=2022-04-02T17:39:38Z&spr=https&sig=mBgwvEgK18TGPwBJx4VCYxBecyjIw%2FgLsc1RC0OsZQE%3D"

// Create a new BlobServiceClient
const blobServiceClient = new BlobServiceClient(blobSasUrl);

// Create a unique name for the container by 
// appending the current time to the file name
// const containerName = "container" + new Date().getTime();

const containerName = "sina"
// Get a container client from the BlobServiceClient
const containerClient = blobServiceClient.getContainerClient(containerName);


const createContainer = async () => {
    try {
        reportStatus(`Creating container "${containerName}"...`);
        await containerClient.create();
        reportStatus(`Done.`);
    } catch (error) {
        reportStatus(error.message);
    }
};

const deleteContainer = async () => {
    try {
        reportStatus(`Deleting container "${containerName}"...`);
        await containerClient.delete();
        reportStatus(`Done.`);
    } catch (error) {
        reportStatus(error.message);
    }
};

// createContainerButton.addEventListener("click", createContainer);
// deleteContainerButton.addEventListener("click", deleteContainer);


const listFiles = async () => {
    fileList.size = 0;
    fileList.innerHTML = "";
    try {
        reportStatus("Retrieving file list...");
        let iter = containerClient.listBlobsFlat();
        let blobItem = await iter.next();
        while (!blobItem.done) {
            fileList.size += 1;
            fileList.innerHTML += `<option>${blobItem.value.name}</option>`;
            blobItem = await iter.next();
        }
        if (fileList.size > 0) {
            reportStatus("Done.");
        } else {
            reportStatus("The container does not contain any files.");
        }
    } catch (error) {
        reportStatus(error.message);
    }
};

listButton.addEventListener("click", listFiles);

const uploadFiles = async () => {
    try {
        reportStatus("Uploading files...");
        const promises = [];
        for (const file of fileInput.files) {
            const blockBlobClient = containerClient.getBlockBlobClient(file.name);
            promises.push(blockBlobClient.uploadBrowserData(file));
        }
        await Promise.all(promises);
        reportStatus("Done.");
        listFiles();
    }
    catch (error) {
            reportStatus(error.message);
    }
}

selectButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", uploadFiles);

const deleteFiles = async () => {
    try {
        if (fileList.selectedOptions.length > 0) {
            reportStatus("Deleting files...");
            for (const option of fileList.selectedOptions) {
                await containerClient.deleteBlob(option.text);
            }
            reportStatus("Done.");
            listFiles();
        } else {
            reportStatus("No files selected.");
        }
    } catch (error) {
        reportStatus(error.message);
    }
};

deleteButton.addEventListener("click", deleteFiles);


var FileSaver = require('file-saver');

const downloadFiles = async() => {
    try {
        if (fileList.selectedOptions.length > 0) {
            reportStatus("Downloading files...");
            for await (const option of fileList.selectedOptions) {
                var blobName = option.text;
                // const account = '<account name>';
                // const sas = '<blob sas token>';
                // const containerName = '< container name>';
                // const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net${sas}`);
                // const containerClient = blobServiceClient.getContainerClient(containerName);
                const blobClient = containerClient.getBlobClient(blobName);
                const downloadBlockBlobResponse = await blobClient.download(blobName, 0, undefined);
                const data = await downloadBlockBlobResponse.blobBody;
                // Saves file to the user's downloads directory
                FileSaver.saveAs(data, blobName); // FileSaver.js
            }
            reportStatus("Done.");
            listFiles();
        } else {
            reportStatus("No files selected.");
        }
    } catch (error) {
        reportStatus(error.message);
    }
};

downloadButton.addEventListener("click", downloadFiles);