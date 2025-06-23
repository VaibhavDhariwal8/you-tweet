import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // Logic for registering a user
    // take user data from frontend
    // validate the data
    // check if user already exists,  using username or email
    // check for images, avatar, etc.
    // upload them to cloudinary
    // create the user object,  create entry in db
    // remove sensitive data like password from the response
    // check for user creation success
    // return success response

    const {fullName, username, email, password} = req.body;
    if(
      [fullName, username, email, password].some(field => field?.trim() === "")
    ){
      throw new ApiError(400, 'All fields are required');
    }

    const existingUser = await User.findOne({
      $or: [{username}, {email}]
    });

    if (existingUser) {
      throw new ApiError(400, 'Username or email already exists');
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if(req.files?.coverImage && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
      throw new ApiError(400, 'Avatar is required');
    }

    const avatarResponse = await uploadOnCloudinary(avatarLocalPath);
    const coverImageResponse = coverImageLocalPath
      ? await uploadOnCloudinary(coverImageLocalPath)
      : null;

    if(!avatarResponse) {
      throw new ApiError(500, 'Failed to upload avatar');
    }

    const user = await User.create({
      fullName,
      username : username.toLowerCase(),
      email,
      password, // Note: Password should be hashed before saving in production
      avatar: avatarResponse.url,
      coverImage: coverImageResponse?.url || ""
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      throw new ApiError(500, 'Failed to create user');
    }

    res.status(201).json(
      new ApiResponse(201, 'User registered successfully', createdUser)
    );

});

export {registerUser};