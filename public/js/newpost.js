const profilePic = document.querySelector('.profile_con');
const loaderContainer = document.getElementById('loader-container');
  profilePic.addEventListener('click', function (e) {
    console.log('asdsad')
    window.location.href = '/profile';
  });

document.getElementById('fileInput').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const videoPreview = document.getElementById('videoPreview');
    const leftSection = document.getElementById('leftside');
    leftSection.classList.remove('hid');
    // Set video source to the selected file
    videoPreview.src = URL.createObjectURL(file);
    videoPreview.controls = false;
    videoPreview.addEventListener('click', () => {
        if (videoPreview.paused) {
            videoPreview.play();
        } else {
            videoPreview.pause();
        }
    });
});


const profilePic1 = document.querySelector('.profile_con1');
  profilePic1.addEventListener('click', function (e) {
    console.log('asdsad')
    window.location.href = '/profile';
  });

  
document.getElementById('uploadBtn').addEventListener('click', function () {
    var username = document.getElementById("username").textContent;
    const file = document.getElementById('fileInput').files[0];
    const caption = document.getElementById('captionInput').value;
    if (!file) {
        alert('Please select a file.');
        return;
    }
    
    // Check the file size (in bytes)
    const fileSizeInBytes = file.size;
    // Convert bytes to megabytes
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

    // Check if the file size exceeds 10MB
    if (fileSizeInMB > 10) {
        alert('File size exceeds 10MB. Please select a smaller file.');
        return;
    }
    // Assuming you have the username, caption, and video file already collected

    loaderContainer.classList.remove('hid');
    // FormData object to send data including the file
    const formData = new FormData();
    formData.append('username', username.trim());
    formData.append('caption', caption);
    formData.append('video', file); // Assuming videoFile is the file object

    // Make a fetch request
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return response.json(); // Parse JSON response
            } else {
                // Handle HTML response (successful sign-in, redirect to dashboard or update UI)
                console.log('HTML response:', response);
            }
        } else {
            // Handle non-OK response (error handling)
            throw new Error('Network response was not ok');
        }
    })
    .then(data => {
        console.log('Data:', data); // Log response data
        loaderContainer.classList.add('hid');
        window.location.href = '/dashboard';
    })
    .catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });



});
