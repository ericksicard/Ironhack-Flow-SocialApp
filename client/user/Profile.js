/*The Profile component shows a single user's information in the view at the '/user/:userId' path,
where the "userId" parameter represents the ID of the specific user. The completed Profile will
display user details, and also conditionally show edit/delete options.
The profile information can be fetched from the server if the user is signed in. To verify this,
the component has to provide the JWT credential to the read fetch call; otherwise, the user should
be redirected to the Sign In view.*/

import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Edit from '@material-ui/icons/Edit'
import Person from '@material-ui/icons/Person'
import Divider from '@material-ui/core/Divider'
import DeleteUser from './DeleteUser'

import auth from '../auth/auth-helper';
import { read, follow } from './api-user.js';
import FollowProfileButton from './FollowProfileButton'
import ProfileTabs from './../user/ProfileTabs'

const useStyles = makeStyles(theme => ({
    root: theme.mixins.gutters({
        maxWidth: 600,
        margin: 'auto',
        padding: theme.spacing(3),
        marginTop: theme.spacing(5)
    }),
    title: {
        marginTop: theme.spacing(3),
        color: theme.palette.protectedTitle
    }
}))

/*In the "Profile" component definition, we need to initialize the state with an empty user and set
"redirectToSignin" to false.
We also need access to the "match" props passed by the Route component, which will contain a ":userId"
parameter value. This can be accessed as match.params.userId.
*/
export default function Profile({ match }) {
    const classes = useStyles();
    const [ values, setValues ] = useState({
        user: {
            following:[],
            followers:[]
        },
        redirectToSignin: false,
        following: false
    });
    const jwt = auth.isAuthenticated();
    
    /*The Profile component should fetch user information and render the view with these details.
    The "useEffect" hook uses the "match.params.userId" value and calls the "read" user fetch method.
    Since this method also requires credentials to authorize the signed-in user, the JWT is retrieved
    from "sessionStorage" using the "isAuthenticated" method from "auth-helper.js", and passed in the
    call to read.
    Once the server responds, either the state is updated with the user information or the view is
    redirected to the "Sign In" view if the current user is not authenticated. We also add a "cleanup"
    function in this effect hook to abort the fetch signal when the component unmounts.
    This effect only needs to rerun when the "userId" parameter changes in the route, for example, when the
    app goes from one profile view to the other. To ensure this effect reruns when the userId value updates,
    we will add [match.params.userId] in the second argument to useEffect.
    */
    useEffect( () => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        read(
            { userId: match.params.userId },
            { t: jwt.token },
            signal
        )
        .then( data => {
            if (data && data.error) {
                setValues({ ...values, redirectToSignin: true })
            }
            else {
                /*checking whether the signed-in user is already following the user in the profile or not and set
                the "following" value to the respective state*/
                let following = checkFollow(data)
                setValues({ ...values, user: data, following: following })
            }
        })

        return function cleanup() {
            abortController.abort()
        }
    }, [match.params.userId])

    /*With the photo URL routes set up to retrieve the photo, we use these in the img element's src attribute
    to load the photo in the view.
    To ensure the img element reloads in the Profile view after the photo is updated, we have to add a time value
    to the photo URL to bypass the browser's default image caching behavior.
    
    const photoUrl = user._id
    ? `/api/users/photo/${user._id}?${new Date().getTime()}`
    : '/api/users/defaultphoto'
   */

    /*To determine the value to set in following, the "checkFollow" method will check if the signed-in user exists
    in the fetched user's followers list, then return match if found; otherwise, it will return undefined if a
    match is not found.*/
    const checkFollow = (user) => {
        const match = user.followers.some( follower => {
            return follower._id == jwt.user._id
        })
        return match;
    }

    /*Defining the click handler for FollowProfileButton so that the state of the Profile can be updated when the
    follow or unfollow action completes*/
    const clickFollowButton = (callApi) => {
        callApi(
            { userId: jwt.user._id },
            { t: jwt.token },
            values.user._id
        )
        .then( data => {
            if (data.error) {
                setValues({ ...values, error: data.error })
            }
            else {
                setValues({ ...values, user: data, following: !values.following })
            }
        })
    }

    /*If the current user is not authenticated, he's gonna be redirected to the Sign In view.*/
    if ( values.redirectToSignin ) {
        return <Redirect to={'/signin'}/>
    }

    /*The function will return the Profile view with the following elements if the user who's currently
    signed in is viewing another user's profile.
    However, if the user that's currently signed in is viewing their own profile, they will be able to see,
    edit and delete options in the Profile component. To implement this feature, in the first "ListItem"
    component in the Profile, a "ListItemSecondaryAction" component containing the "Edit" button and a
    "DeleteUser" component is added, which will render conditionally based on whether the current user is
    viewing their own profile.
    The "Edit" button will route to the "EditProfile" component, while the custom "DeleteUser" component
    will handle the delete operation with the userId passed to it as a prop.
    To add the Profile component to the app, add the Route to MainRouter in the Switch component.
    */
    return (
        <Paper className={classes.root} elevation={4}>
            <Typography variant='h6' className={classes.title}>
                Profile
            </Typography>
            <List dense>
                <ListItem>
                    <ListItemAvatar>
                        <Avatar src={values.user.photo} />
                    </ListItemAvatar>
                    <ListItemText 
                        primary={values.user.name}
                        secondary={values.user.email}
                    />
                    { 
                        auth.isAuthenticated().user && auth.isAuthenticated().user._id == values.user._id
                        ? (<ListItemSecondaryAction>
                            <Link to={'/user/edit/' + values.user._id}>
                                <IconButton arial-label='Edit' color='primary'>
                                    <Edit />
                                </IconButton>
                            </Link>
                            <DeleteUser userId={values.user._id} />
                        </ListItemSecondaryAction>)                            
                        :(<FollowProfileButton following={values.following} onButtonClick={clickFollowButton}/>)
                    }
                </ListItem>
                <Divider />
                <ListItem>
                    <ListItemText
                        primary={values.user.about} 
                        secondary={'Joined: ' + ( new Date(values.user.created) ).toDateString()}
                    />
                </ListItem>
            </List>
            <ProfileTabs user={values.user}/>
        </Paper>
    )    
}