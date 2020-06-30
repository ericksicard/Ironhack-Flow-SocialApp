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