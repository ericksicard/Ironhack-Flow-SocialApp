import express from 'express';
const router = express.Router();

import authCtrl from '../controllers/auth.controller';
import userCtrl from '../controllers/user.controller';

/*This route path that will receive the request for retrieving Newsfeed posts for a specific user.
We are using the :userID parameter in this route to specify the currently signed-in user. We will
utilize the userByID controller method in user.controller to fetch the user details and append
these to the request object that is accessed in the listNewsFeed post controller method.
*/
router.route('/api/posts/feed/:userId')
    .get(authCtrl.requireSignin, postCtrl.listNewsFeed)


router.param('userId', userCtrl.userByID)