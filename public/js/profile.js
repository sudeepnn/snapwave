var username = document.getElementById("username").textContent;
console.log(username);

const loaderContainer = document.getElementById('loader-container');
loaderContainer.classList.add('hid');



fetch(`/user-details/${username}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
    //     document.getElementById('age').innerText = 'Age: ' + data.user.age;
    //     document.getElementById('dob').innerText = 'Date of Birth: ' + data.user.dateOfBirth;
        document.getElementById('bio').innerText =  data.user.bio;

        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = '';

        data.posts.forEach(post => {
            if (Array.isArray(post.post_url)) {
                post.post_url.forEach(videoData => {


                    const videoContainer = document.createElement('div'); // Video container
                    videoContainer.classList.add('video-container'); // Add video container class

                    const videoElement = document.createElement('video');
                    videoElement.src = videoData.url;
                    videoElement.controls = false;
                    videoElement.style.marginBottom = '10px';
                    videoElement.addEventListener('click', () => {
                        if (videoElement.paused) {
                            videoElement.play();
                        } else {
                            videoElement.pause();
                        }
                    });

                    // Create delete button if the post belongs to the logged-in user
                    
                        const deleteButton = document.createElement('button');

                        deleteButton.classList.add('delete-button');

                        deleteButton.addEventListener('click', () => deletePost(videoData.url));
                        deleteButton.setAttribute('data-video-url', videoData.url);
                        const deleteImg = document.createElement('img');
                        deleteButton.classList.add('delete_img');
                        deleteImg.src = 'images/trash.png'; // Provide the path to your delete icon image
                        deleteImg.alt = 'Delete'; // Optional: Provide alt text for accessibility
                        deleteButton.appendChild(deleteImg);
                        videoContainer.appendChild(deleteButton); // Append delete button to video container
                    
                    const captionElement = document.createElement('p');
                    captionElement.innerText = videoData.caption; // Fill caption

                    // Create a like button
                    const likeButton = document.createElement('button');
                    likeButton.innerText = videoData.likes;
                    likeButton.classList.add('likebtn');
                    likeButton.addEventListener('click', () => updateLikes(videoData.url)); // Add like functionality
                    const likeimg = document.createElement('img');
                    likeimg.classList.add('like_img');
                    likeimg.src = 'images/heart.png'; // Provide the path to your delete icon image
                    likeimg.alt = 'likes'; // Optional: Provide alt text for accessibility
                    likeButton.appendChild(likeimg);
                    videoContainer.appendChild(likeButton);


                    videoContainer.appendChild(captionElement);
                    videoContainer.appendChild(likeButton);


                    videoContainer.appendChild(videoElement); // Append video to video container
                    // Append video container to post element
                    postsContainer.appendChild(videoContainer); // Append post element to posts container

                });
            }
        });
    })
    .catch(error => {
        // Handle errors
        console.error('There was a problem with the fetch operation:', error);
    });

    function deletePost(videoUrl) {
        loaderContainer.classList.remove('hid');
        const confirmDelete = window.confirm("Are you sure you want to delete this video?");
        if (!confirmDelete) {
            return; // If user cancels, do nothing
        }
        fetch('/delete_post', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ videoUrl: videoUrl })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data.message); // Log the success message
                // Handle UI updates or other actions based on the response
                window.location.reload();
            })
            .catch(error => {
                console.error('There was a problem with the delete operation:', error);
            })
            .finally(() => {
                // Hide loader container
                element.classList.add('hid');
            });
    }


function updateLikes(videoUrl) {
    fetch('/update_likes', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ videoUrl: videoUrl })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            
            const videoElement = getVideoContainerBySrc(videoUrl);
            if (videoElement) {
                const likesCounter = videoElement.querySelector('.likebtn');
                if (likesCounter) {
                    likesCounter.textContent = `${data.updatedLikes}`;

                    const likeimg = document.createElement('img');
                    likeimg.classList.add('like_img');
                    likeimg.src = 'images/heart.png'; 
                    likeimg.alt = 'likes'; 
                    likesCounter.appendChild(likeimg);
                   
                } else {
                    console.error('Likes counter element not found.');
                }
            } else {
                console.error('Video element not found.');
            }

        })
        .catch(error => {
            console.error('There was a problem with the update operation:', error);
        });
}

function getVideoContainerBySrc(videoSrc) {
    const videoContainers = document.querySelectorAll('.video-container'); // Assuming all video containers have a class 'video-container'

    for (let i = 0; i < videoContainers.length; i++) {
        const videoElement = videoContainers[i].querySelector('video');
        if (videoElement && videoElement.src === videoSrc) {
            return videoContainers[i]; // Return the container if the video src matches
        }
    }

    return null; // Return null if no matching container is found
}
