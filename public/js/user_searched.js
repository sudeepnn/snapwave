var username = document.getElementById("username").textContent;
username=username.trim()
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
        if(data.followsUser){
            document.getElementById('followButton').innerText='Following'
            
        }

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

    const followbtn=document.getElementById('followButton')
    followbtn.addEventListener('click', ()=>{
        if(followbtn.innerText=='Following'){
            unfollowUser()
        }
        else{
            followUser()
        }
    });

    async function followUser() {
        // Get the username of the user to follow (you can fetch this from wherever it's available in your frontend)
        const usernameToFollow = username; // Replace 'username' with the actual username
        
        try {
            // Send a POST request to the follow route
            const response = await fetch('/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usernameToFollow })
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                
                document.getElementById('followButton').innerText = 'Following';
                document.getElementById('following').innerText = data.following;
    
            })
        } catch (error) {
            console.error('Error following user:', error);
        }
    }
    async function unfollowUser() {
        // Get the username of the user to follow (you can fetch this from wherever it's available in your frontend)
        const usernameToUnfollow = username; // Replace 'username' with the actual username
        
        try {
            // Send a POST request to the follow route
            const response = await fetch('/unfollow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ usernameToUnfollow })
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                
                document.getElementById('followButton').innerText = 'Follow';
                document.getElementById('following').innerText = data.following;
    
            })
        } catch (error) {
            console.error('Error following user:', error);
        }
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
