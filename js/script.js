document.addEventListener('DOMContentLoaded', function () {
    const MAX_WIDTH = 1920;
    const MAX_HEIGHT = 1080;
    const MIME_TYPE = "image/jpeg";

    const dropZone = document.getElementById("dropZone");
    const input = document.getElementById("imageInput");
    const qualityInput = document.getElementById("qualityInput");
    const compressButton = document.getElementById("compressButton");
    const resultBox = document.getElementById("resultBox");
    const resultBody = document.getElementById("resultBody");
    const backButton = document.getElementById("backButton");
    const fileInfoContainer = document.getElementById("fileInfoContainer");
    const previewContainer = document.getElementById('previewContainer');

    dropZone.addEventListener('click', () => input.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('bg-primary', 'text-white');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-primary', 'text-white');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-primary', 'text-white');
        input.files = e.dataTransfer.files;
        displayFileInfo(input.files);
    });

    input.addEventListener('change', () => {
        displayFileInfo(input.files);
    });

    compressButton.addEventListener('click', () => {
        // Reset data sebelumnya
        resultBody.innerHTML = ''; // Clear previous results
        fileInfoContainer.innerHTML = '<h3>File yang Anda masukkan:</h3>'; // Reset file info container
        previewContainer.innerHTML = ''; // Clear preview container

        const files = input.files;
        if (!files.length) {
            alert("Please upload images first.");
            return;
        }

        Array.from(files).forEach((file, index) => {
            const blobURL = URL.createObjectURL(file);
            const img = new Image();
            img.src = blobURL;

            img.onerror = function () {
                URL.revokeObjectURL(this.src);
                console.log("Cannot load image");
            };

            img.onload = function () {
                URL.revokeObjectURL(this.src);
                const [newWidth, newHeight] = calculateSize(img, MAX_WIDTH, MAX_HEIGHT);
                const canvas = document.createElement("canvas");
                canvas.width = newWidth;
                canvas.height = newHeight;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, newWidth, newHeight);

                let selectedQuality = parseFloat(qualityInput.value);
                if (isNaN(selectedQuality) || selectedQuality < 0.1 || selectedQuality > 1.0) {
                    selectedQuality = 0.7;  // Default value if the input is invalid
                }
                console.log(`Selected quality: ${selectedQuality}`);

                canvas.toBlob(
                    (blob) => {
                        console.log(`Compressed file size: ${blob.size}`);
                        const originalSize = readableBytes(file.size);
                        const compressedSize = readableBytes(blob.size);

                        const downloadLink = document.createElement('a');
                        downloadLink.href = URL.createObjectURL(blob);
                        downloadLink.download = `compressed_image_${index + 1}.jpg`;
                        downloadLink.innerText = `Download hasil kompres`;

                        const compressedImage = document.createElement('img');
                        compressedImage.src = URL.createObjectURL(blob);
                        compressedImage.classList.add('img-thumbnail');
                        compressedImage.style.maxWidth = '150px';
                        compressedImage.style.maxHeight = '150px';

                        const tr = document.createElement('tr');

                        const originalTd = document.createElement('td');
                        originalTd.innerText = `Original file ${index + 1} - ${originalSize}`;
                        tr.appendChild(originalTd);

                        const compressedTd = document.createElement('td');
                        compressedTd.innerText = `Compressed file ${index + 1} - ${compressedSize}`;
                        tr.appendChild(compressedTd);

                        const previewTd = document.createElement('td');
                        previewTd.appendChild(compressedImage);
                        tr.appendChild(previewTd);

                        const downloadTd = document.createElement('td');
                        downloadTd.appendChild(downloadLink);
                        tr.appendChild(downloadTd);

                        resultBody.appendChild(tr);

                    },
                    MIME_TYPE,
                    selectedQuality
                );
            };
        });
        resultBox.style.display = 'block';
        compressButton.style.display = 'none';
    });

    

    backButton.onclick = function () {
        resultBody.innerHTML = '';
        resultBox.style.display = 'none';
        compressButton.style.display = 'block';
        previewContainer.innerHTML = ''; // Clear preview container
        fileInfoContainer.innerHTML = '<h3>File yang Anda masukkan:</h3>'; // Reset file info container
        input.value = ''; // Reset file input
        qualityInput.value = ''; // Reset quality input
    };
    
    function calculateSize(img, maxWidth, maxHeight) {
        let width = img.width;
        let height = img.height;

        if (width > height) {
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }
        } else {
            if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
            }
        }
        return [width, height];
    }

    function displayFileInfo(files) {
        const sortedFiles = Array.from(files).sort((a, b) => a.name.localeCompare(b.name));
        fileInfoContainer.innerHTML = ''; // Clear previous info
        previewContainer.innerHTML = ''; // Clear previous previews
        sortedFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function (event) {
                const info = document.createElement('p');
                info.innerText = `File ${index + 1}: ${file.name} - ${readableBytes(file.size)}`;
                const imgElement = document.createElement('img');
                imgElement.src = event.target.result;
                imgElement.classList.add('img-thumbnail', 'm-2');
                fileInfoContainer.append(info);
                fileInfoContainer.append(imgElement);
            };
            reader.readAsDataURL(file);
        });
    }

    function readableBytes(bytes) {
        const i = Math.floor(Math.log(bytes) / Math.log(1024)),
            sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
    
    
});
