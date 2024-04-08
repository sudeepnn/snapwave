// function openpopupModal() {
//   document.getElementById('loginSuccessModal').style.display = 'block';
// }

// function closepopupModal() {
//   document.getElementById('loginSuccessModal').style.display = 'none';
// }
// document.addEventListener('DOMContentLoaded', () => {
//   openpopupModal();
//   setTimeout(() => {
//     closepopupModal();
//   }, 2000);
// });


document.addEventListener("DOMContentLoaded", function () {

  const searchInput = document.getElementById('searchInput');
  const userListContainer = document.getElementById('userListContainer');
  

  
document.addEventListener('click', function(event) {

  // Check if the click target is outside the searchbarcon div
  if (!searchInput.contains(event.target)) {
      // Clicked outside, so hide the userListContainer
      userListContainer.classList.add('hid');
  }
});
  // Event listener for search input changes
  searchInput.addEventListener('input', () => {
      const searchQuery = searchInput.value.trim(); // Get the search query
      if(searchQuery==''){
        
        userListContainer.classList.add('hid')
        return
      }
      userListContainer.classList.remove('hid')
      // Fetch user list based on the search query
      fetch(`/search/${searchQuery}`)
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(users => {
              // Clear previous search results
              userListContainer.innerHTML = '';

              // Display user list
              users.forEach(user => {
                  const userElement = document.createElement('div');
                  userElement.classList.add('search_each_user')
                  const username = document.createElement('p');
                  username.innerText = user.username;
                  userElement.addEventListener('click',()=>showuser(user.username))
                  // Add profile photo image tag if available
                  if (user.profilePhoto) {
                      const profilePhoto = document.createElement('img');
                      profilePhoto.classList.add('profile_img')
                      profilePhoto.src = user.profilePhoto;
                      profilePhoto.alt = 'Profile Photo';
                      userElement.appendChild(profilePhoto);
                      userElement.appendChild(username);
                  }
                 
                  userListContainer.appendChild(userElement);
              });
          })
          .catch(error => {
              console.error('There was a problem with the fetch operation:', error);
          });
  });



  //go to profile 
  const profilePic = document.querySelector('.profile_con');
  profilePic.addEventListener('click', function (e) {
    console.log('asdsad')
    window.location.href = '/profile';
  });
  const profilePic1 = document.querySelector('.profile_con1');
  profilePic1.addEventListener('click', function (e) {
    console.log('asdsad')
    window.location.href = '/profile';
  });


  //feth vdeos
 fetchNextPage(page)

  //new post
  document.getElementById('openModalBtn').addEventListener('click', function () {
    console.log('clicked')
    window.location.href = '/newpost';
  });

});


let page=1

function fetchNextPage(page) {
  
  const nextPage = page ; 
  fetch(`/videos?page=${nextPage}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      
      displayVideos(data.videos);
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
}

// Add an event listener to the scroll event of the window


const videoContainer = document.getElementById('videoContainer');
videoContainer.addEventListener('scroll', () => {
  console.log(videoContainer.scrollHeight)
  console.log(videoContainer.scrollTop)
  console.log(videoContainer.clientHeight)
  if (videoContainer.scrollHeight - videoContainer.scrollTop == videoContainer.clientHeight||videoContainer.scrollHeight - Math.ceil(videoContainer.scrollTop) == videoContainer.clientHeight||videoContainer.scrollHeight - Math.floor(videoContainer.scrollTop) == videoContainer.clientHeight) {
    page++
    fetchNextPage(page); // Assuming the initial page is 1
  }
});



// Function to display videos on the page
function displayVideos(videos) {
  // Select the container element
  const container = document.getElementById('videoContainer');

  // Options for the Intersection Observer
  const options = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5 // Trigger when at least 50% of the video is visible
  };

  // Create the Intersection Observer
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // If video is visible on the screen, play it
        const video = entry.target.querySelector('video');
        if (!video.paused) return; // If video is already playing, do nothing
        video.play();
      } else {
        // If video is not visible, pause it
        const video = entry.target.querySelector('video');
        video.pause();
      }
    });
  }, options);

  // Iterate over the videos array
  videos.forEach(video => {
    // Create a video container
    const videoContainer = document.createElement('div');
    videoContainer.classList.add('video-container');

    // Create a video element
    const videoElement = document.createElement('video');
    videoElement.src = video._id.url;
    videoElement.controls = false;
    videoElement.autoplay = true;
    videoElement.loop = true;

    // Create a profile details container
    const profileContainer = document.createElement('div');
    profileContainer.classList.add('profile_details');
    profileContainer.addEventListener('click', () => showuser(video.username));

    // Create a profile image
    const profileImage = document.createElement('img');
    profileImage.classList.add('profile_img');
    profileImage.src = video.profilePhoto;

    // Create a caption element
    const captionElement = document.createElement('p');
    captionElement.classList.add('caption');
    captionElement.textContent = `${video.username}: ${video._id.caption}`;

    // Create a like button
    const likeButton = document.createElement('button');
    likeButton.innerText = video._id.likes;
    likeButton.classList.add('likebtn');
    likeButton.addEventListener('click', () => updateLikes(video._id.url));
    videoElement.addEventListener('dblclick',()=>updateLikes(video._id.url))
    const likeImage = document.createElement('img');
    likeImage.classList.add('like_img');
    likeImage.src = 'images/heart.png'; // Provide the path to your delete icon image
    likeImage.alt = 'likes'; // Optional: Provide alt text for accessibility
    likeButton.appendChild(likeImage);

    // Append elements to the profile container
    profileContainer.appendChild(profileImage);
    profileContainer.appendChild(captionElement);

    // Append elements to the video container
    videoContainer.appendChild(videoElement);
    videoContainer.appendChild(likeButton);
    videoContainer.appendChild(profileContainer);

    // Append the video container to the main container
    container.appendChild(videoContainer);

    // Observe each video container
    observer.observe(videoContainer);
  });
}


// Function to load more videos when the user scrolls to the bottom


async function showuser(user){
  
  window.location.href = `/${user}`;
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






