const express = require('express')
const bodyparser = require('body-parser')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer');
require('dotenv').config();
const cloudinary = require('cloudinary').v2
const fileUpload = require('express-fileupload')
const session = require('express-session');
const cors = require('cors');
const ejs = require('ejs');
const path = require('path');

const port = process.env.PORT

const app = express()
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/user_searched', express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(bodyparser.json())
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.use(session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: true
}));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}))

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_SECRET_KEY,
});

mongoose.connect(process.env.MONGODB_URI)
//user schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    resetToken: String,
    resetTokenExpiration: Date,
    dateOfBirth: String,
    age: Number,
    profilePhoto: String,
    bio: String,
    following: Number,
    followinguser: [String],
    followersuser: [String],
    follower: Number,
});

//user model
const User = mongoose.model('User', UserSchema)

const VideoSchema = new mongoose.Schema({
    username: String,
    profilePhoto: String,
    post_url: [{
        url: String,
        caption: String,
        likes: Number,
        liked_users: [String],
        createdAt: { type: Date }
    }]
});

const Video = mongoose.model('Video', VideoSchema);





//sign up route
const emailValidator = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
app.get('/', (req, res) => {
    res.render('index');
});
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body


        if (!emailValidator(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const existingUser = await User.findOne({ $or: [{ username }, { email }] }).exec();
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }
        const following = 0
        const follower = 0
        const newuser = new User({ username, email, password, following, follower })
        await newuser.save()

        req.session.user = { username: newuser.email }
        // res.json({ message: 'Signup successful' });
        res.redirect('/details');
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})
//user details
app.post('/details', async (req, res) => {
    try {

        const { email, dateOfBirth, age, bio } = req.body;
        const user = await User.findOne({ email }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Handle profile photo upload to Cloudinary
        const profilePhotoFile = req.files && req.files.profilePhoto; // Assuming 'profilePhoto' is the field name in the form
        if (!profilePhotoFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (profilePhotoFile.size > 2 * 1024 * 1024) {
            return res.status(400).json({ error: 'File size exceeds the limit of 2MB' });
        }
        const uploadOptions = {
            folder: `tiktik/user_profile`,
        };
        const cloudinaryUploadResult = await cloudinary.uploader.upload(profilePhotoFile.tempFilePath, uploadOptions);

        user.dateOfBirth = dateOfBirth;
        user.age = age;
        user.profilePhoto = cloudinaryUploadResult.secure_url;
        user.bio = bio;
        await user.save();
        // res.json({ message: 'User details updated successfully' });
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/details', async (req, res) => {
    const user = req.session.user;
    if (user) {

        email = req.session.user.username
        const user = await User.findOne({ email }).exec()
        res.render('details', { user: user });
    } else {
        res.redirect('/');
    }
})


//signin route
app.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email, password }).exec()
        if (user) {
            req.session.user = { username: user.email }
            res.redirect('/dashboard');
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    }
    catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
});
app.get('/dashboard', async (req, res) => {
    const user = req.session.user;

    if (user) {
        email = req.session.user.username
        const user = await User.findOne({ email }).exec()
        res.render('dashboard', { user: user });
    } else {
        res.redirect('/'); // Redirect to login if session variable is not present
    }
});
app.get('/logout', (req, res) => {
    try {
        if (req.session.user) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Error destroying session:', err);
                    res.status(500).json({ error: 'Internal Server Error' });
                } else {
                    res.redirect('/');
                }
            });
        } else {
            res.status(401).json({ error: 'No active session to logout' });
        }
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/profile', async (req, res) => {
    const user = req.session.user;

    if (user) {
        email = req.session.user.username
        const user = await User.findOne({ email }).exec()
        res.render('profile', { user: user });
    } else {
        res.redirect('/'); // Redirect to login if session variable is not present
    }
});
app.get('/newpost', async (req, res) => {
    const user = req.session.user;

    if (user) {
        email = req.session.user.username
        const user = await User.findOne({ email }).exec()
        res.render('newpost', { user: user });
    } else {
        res.redirect('/'); // Redirect to login if session variable is not present
    }
});
app.get('/searchbar', async (req, res) => {
    const user = req.session.user;

    if (user) {
        email = req.session.user.username
        const user = await User.findOne({ email }).exec()
        res.render('search', { user: user });
    } else {
        res.redirect('/'); // Redirect to login if session variable is not present
    }
});

//password reset request
function sendResetEmail(email, resetToken) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER_MAIL,
            pass: process.env.USER_APP_PASS,
        },
    });

    const mailOptions = {
        from: 'Tiktik Support <support@tiktik.com>',
        to: email,
        subject: 'Password Reset',
        html: `
            <p>Click the following button to reset your password:</p>
            <a href="http://localhost:3000/reset-password?token=${resetToken}">
                <button style="padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px;">Reset Password</button>
            </a>
        `,
    };


    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
function generateUniqueToken() {

    const randomString = Math.random().toString(36).slice(2);
    return randomString;
}

app.post('/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email }).exec();
        if (!user) {
            return res.status(404).json({ error: 'Email not found' });
        }

        const resetToken = generateUniqueToken();
        const resetTokenExpiration = new Date(Date.now() + 60 * 60 * 1000);
        user.resetToken = resetToken;
        user.resetTokenExpiration = resetTokenExpiration;
        await user.save();

        sendResetEmail(user.email, resetToken);
        res.json({ message: 'Password reset email sent successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//password reset

app.get('/reset-password', async (req, res) => {
    res.sendFile(__dirname + "\\reset\\index.html")
})

app.post('/reset-password', async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        const user = await User.findOne({
            resetToken,
            resetTokenExpiration: { $gt: new Date() },
        }).exec();

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



//upload video
app.post('/upload', async (req, res) => {
    try {
        const { username, caption } = req.body;
        const user = await User.findOne({ username }).exec(); //inside user collection
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const post = req.files && req.files.video;
        const result = await cloudinary.uploader.upload(post.tempFilePath, { resource_type: 'video', folder: 'tiktik/posts' });

        // Check if the user has any existing posts
        let userpost = await Video.findOne({ username }).exec();

        if (userpost) {
            // Push new object containing video URL, caption, and likes to the post_url array
            userpost.post_url.push({ url: result.secure_url, caption: caption, likes: 0, createdAt: new Date() });
            await userpost.save();
        } else {
            // If no existing post, create a new one with an array containing the new object
            userpost = new Video({
                username,
                profilePhoto: user.profilePhoto, // Include the ProfilePhoto
                post_url: [{ url: result.secure_url, caption: caption, likes: 0, createdAt: new Date() }]
            });
            await userpost.save();
        }

        res.json({ message: 'Video uploaded successfully', videoUrl: result.secure_url });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//delete video
app.delete('/delete_post', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        const publicId = extractPublicId(videoUrl);
        await cloudinary.uploader.destroy(publicId);

        // Delete the post from the database
        await Video.updateOne(
            { "post_url.url": videoUrl },
            { $pull: { "post_url": { url: videoUrl } } }
        );

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Function to extract public ID from Cloudinary URL
function extractPublicId(videoUrl) {
    // Example Cloudinary URL: https://res.cloudinary.com/demo/video/upload/v1572293179/sample.mp4
    console.log(videoUrl)
    const parts = videoUrl.split('/');
    const filename = parts.pop(); // Get the filename part
    const publicId = filename.split('.')[0]; // Remove the file extension to get the public ID
    return publicId;
}

//get all videos
app.get('/videos', async (req, res) => {
    try {
        const { page = 1, limit = 3 } = req.query;

        // Calculate the number of documents to skip based on the current page and limit
        const skip = (page - 1) * limit;

        // Fetch videos with pagination, sorted by the most recent posts
        const videos = await Video.aggregate([
            // Unwind the post_url array to flatten it
            { $unwind: "$post_url" },

            // Group by post_url, username, and profilePhoto
            {
                $group: {
                    _id: "$post_url",
                    username: { $first: "$username" },
                    profilePhoto: { $first: "$profilePhoto" }
                }
            },

            // Sort by createdAt in descending order
            { $sort: { "_id.createdAt": -1 } },

            // Optionally, you can skip and limit the results here if needed
            { $skip: skip },
            { $limit: parseInt(limit) } // Parse limit to ensure it's a number
        ]);


        // Check if there are more videos available for the next page
        const totalVideos = await Video.countDocuments(); // Count total videos
        const remainingVideos = totalVideos - skip - parseInt(limit); // Calculate remaining videos
        const nextPageLimit = remainingVideos > 0 ? parseInt(limit) : remainingVideos + parseInt(limit);


        const totalPages = Math.ceil(totalVideos / parseInt(limit));

        res.json({ videos, page, limit: nextPageLimit, totalPages }); // Send adjusted limit for the next page
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//update_like
app.post('/update_like', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        const username = req.session.user.username

        // Retrieve the video document from the database
        const video = await Video.findOne({ post_url: videoUrl });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Check if the user has already liked the video
        const userLikeIndex = video.userLike.indexOf(username);
        if (userLikeIndex === -1) {
            // User has not liked the video, increment like count
            video.likes++;
            video.userLike.push(username);
        } else {
            // User has already liked the video, decrement like count
            video.likes--;
            video.userLike.splice(userLikeIndex, 1); // Remove username from userLike array
        }

        // Save the updated video document back to the database
        await video.save();

        res.json({ message: 'Like updated successfully', likes: video.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

//get the post
// Assuming you have already defined your Video model using the VideoSchema

app.put('/update_likes', async (req, res) => {
    try {
        const { videoUrl } = req.body;
        username = req.session.user.username
        console.log(username)
        // Find the video with the given URL
        const video = await Video.findOne({ 'post_url.url': videoUrl });

        if (!video) {
            return res.status(404).json({ error: 'Video not found' });
        }


        // Find the index of the video in the post_url array
        const videoIndex = video.post_url.findIndex(post => post.url === videoUrl);

        if (videoIndex === -1) {
            return res.status(404).json({ error: 'Video not found' });
        }

        // Check if the user has already liked the video
        const likedIndex = video.post_url[videoIndex].liked_users.indexOf(username);

        if (likedIndex === -1) {
            // If user hasn't liked the video, add username to liked_users and increment likes
            video.post_url[videoIndex].liked_users.push(username);
            video.post_url[videoIndex].likes++;
        } else {
            // If user has already liked the video, remove username from liked_users and decrement likes
            video.post_url[videoIndex].liked_users.splice(likedIndex, 1);
            video.post_url[videoIndex].likes--;
        }

        // Save the updated video
        await video.save();

        res.json({ message: 'Likes updated successfully', updatedLikes: video.post_url[videoIndex].likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//each user details
app.get('/user-details/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Fetch user details from User collection
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch all posts from Video collection for the given username
        const posts = await Video.aggregate([
            { $match: { username } }, // Filter documents by username
            { $unwind: "$post_url" }, // Unwind the post_url array to flatten it
            { $sort: { "post_url.createdAt": -1 } }, // Sort the flattened array by createdAt
            { $group: { _id: "$_id", post_url: { $push: "$post_url" } } } // Group the documents back and reconstruct the post_url array
        ]);

        const email = req.session.user ? req.session.user.username : null;

        if (email) {
            const currentUser = await User.findOne({ email }).exec();

            // Check if the current user follows the specified user
            let followsUser = false;
            if (currentUser) {
                followsUser = currentUser.followinguser.includes(username);
            }
            return res.json({ user, posts, followsUser });
        }
        return res.json({ user, posts });



    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('/:username', async (req, res) => {
    try {

        const { username } = req.params;
        // console.log(username)

        const loginuser = req.session.user
        if (loginuser) {
            const loginemail = loginuser.username
            // console.log(loginemail)
            let loginuserdata = await User.findOne({email: loginemail }).exec()
            // console.log(loginuserdata)
            if (username == loginuserdata.username) {
                res.render('profile', { user: loginuserdata });
                return
            }
        }

        // Fetch user details from User collection
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch all posts from Video collection for the given username
        const posts = await Video.aggregate([
            { $match: { username } }, // Filter documents by username
            { $unwind: "$post_url" }, // Unwind the post_url array to flatten it
            { $sort: { "post_url.createdAt": -1 } }, // Sort the flattened array by createdAt
            { $group: { _id: "$_id", post_url: { $push: "$post_url" } } } // Group the documents back and reconstruct the post_url array
        ]);
        res.render('user_searched', { user, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.get('user_searched/:username', async (req, res) => {
    try {
        const { username } = req.params;
        

        // Fetch user details from User collection
        const user = await User.findOne({ username }).exec();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch all posts from Video collection for the given username
        const posts = await Video.aggregate([
            { $match: { username } }, // Filter documents by username
            { $unwind: "$post_url" }, // Unwind the post_url array to flatten it
            { $sort: { "post_url.createdAt": -1 } }, // Sort the flattened array by createdAt
            { $group: { _id: "$_id", post_url: { $push: "$post_url" } } } // Group the documents back and reconstruct the post_url array
        ]);

        res.json({ user, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// app.get('/newpost', async (req, res) => {
//     const user = req.session.user;
//     if (user) {
//         email = req.session.user.username
//         const user = await User.findOne({email: email }).exec()
//         console.log(user)
//         res.render('newpost', { user: user });
//     } else {
//         res.redirect('/');
//     }
// })

//search userss
app.get('/search/:searchQuery', async (req, res) => {
    try {
        const searchQuery = req.params.searchQuery; // Get the search query from the URL parameter
        // Construct a regular expression to match usernames starting with the search query (case-insensitive)
        const regex = new RegExp(`^${searchQuery}`, 'i');

        // Perform a search query on the User collection
        const searchResults = await User.find({ username: regex })
            .select('username profilePhoto'); // Select only the username field

        res.json(searchResults); // Send the search results as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/follow', async (req, res) => {
    try {
        // Check if user is logged in (assuming session is used for authentication)
        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const currentUser = req.session.user.username; // Get the current logged-in user
        const { usernameToFollow } = req.body; // Get the username of the user to follow
        console.log(currentUser)
        console.log(usernameToFollow)
        // Find the current user in the database await User.findOne({ email }).exec()
        // const user = await User.findOne({ currentUser }).exec();
        email = req.session.user.username
        const user = await User.findOne({ email }).exec()
        console.log(user)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user to follow in the database
        const userToFollow = await User.findOne({ username: usernameToFollow });

        if (!userToFollow) {
            return res.status(404).json({ message: 'User to follow not found' });
        }

        // Update the following count and followingUserList for the current user
        user.following += 1;
        user.followinguser.push(usernameToFollow);

        // Update the following count and followingUserList for the user to follow
        userToFollow.follower += 1;
        userToFollow.followersuser.push(user.username);

        // Save the changes to the database
        await user.save();
        await userToFollow.save();

        res.status(200).json({ message: 'User followed successfully', following: user.following });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
app.post('/unfollow', async (req, res) => {
    try {
        // Check if user is logged in (assuming session is used for authentication)
        if (!req.session || !req.session.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const currentUser = req.session.user.username; // Get the current logged-in user
        const { usernameToUnfollow } = req.body; // Get the username of the user to unfollow

        // Find the current user in the database
        // const user = await User.findOne({  currentUser });
        email = req.session.user.username
        const user = await User.findOne({ email }).exec()
        console.log(email)
        console.log(usernameToUnfollow)

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user to unfollow in the database
        const userToUnfollow = await User.findOne({ username: usernameToUnfollow });

        if (!userToUnfollow) {
            return res.status(404).json({ message: 'User to unfollow not found' });
        }

        // Update the following count and followingUserList for the current user
        user.following -= 1;
        user.followinguser = user.followinguser.filter(user => user !== usernameToUnfollow);

        // Update the followers count and followersUserList for the user to unfollow
        userToUnfollow.follower -= 1;
        userToUnfollow.followersuser = userToUnfollow.followersuser.filter(userToUnfollow => userToUnfollow !== user.username);

        // Save the changes to the database
        await user.save();
        await userToUnfollow.save();

        res.status(200).json({ message: 'User unfollowed successfully', following: user.following });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




app.listen(port, () => {
    console.log(`server started at port ${port}`)
})