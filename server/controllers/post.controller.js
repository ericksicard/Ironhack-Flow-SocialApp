import formidable from 'formidable'
import cloudinary from '../../config/cloudinary-config'

import errorHandler from '../helpers/dbErrorHandler';
import Post from '../models/post.model'


/*The listNewsFeed controller method will query the Post collection in the database
to get the matching posts.
In the query to the Post collection, we find all the posts that have postedBy user
references that match the current user's followings and the current user. The posts
that are returned will be sorted by the created timestamp, with the most recent post
listed first. Each post will also contain the id and name of the user who created the
post and of the users who left comments on the post.
*/
const listNewsFeed = async (req, res) => {
    let following = req.profile.following;
    following.push(req.profile._id) //this will include the posts of the signed-in user
    try{
        let posts = await Post.find({ postedBy: { $in: req.profile.following }})
                                .populate('comments.postedBy', '_id name')
                                .sort('-created')
                                .exec()
        res.json(posts)
    }
    catch(err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

/*The listByUser controller method will query the Post collection to find posts that have
a matching reference in the postedBy field to the user specified in the userId param in
the route*/
const listByUser = async (req, res) => {
    try{
        let posts = await Post.find({ postedBy: req.profile._id })
                                .populate('comments.postedBy', '_id, name')
                                .populate('postedBy', '_id name')
                                .sort('-created')
                                .exec()
        res.json()
    }
    catch(err) {
        return res.status(400).json({
            error: errorHandler.getErrorMessage(err)
        })
    }
}

/* This method will use the formidable module to access the fields and the image file, if any.*/
const create = async (req, res, next) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Image could not be uploaded'
            })
        }
        let post = new Post(fields);
        post.createdBy = req.profile;
        
        if (files.photo) {
            await cloudinary.uploader.upload(files.photo.path,
                {use_filename: true,
                folder: 'MERN_SocialApp/posts'},
                function(err, result) {
                    post.photo = result.url
                })
        }

        try {
            let result = await post.save();
            res.json(result)
        }
        catch (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
    })

}

export default { listNewsFeed, listByUser, create }