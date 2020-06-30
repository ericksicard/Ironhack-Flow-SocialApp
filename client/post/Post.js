  
import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import Typography from '@material-ui/core/Typography'
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import FavoriteIcon from '@material-ui/icons/Favorite'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import CommentIcon from '@material-ui/icons/Comment'
import Divider from '@material-ui/core/Divider'

import auth from './../auth/auth-helper'
import { remove, like, unlike } from './api-post.js'
import Comments from './Comments'

const useStyles = makeStyles(theme => ({
    card: {
        maxWidth:600,
        margin: 'auto',
        marginBottom: theme.spacing(3),
        backgroundColor: 'rgba(0, 0, 0, 0.06)'
    },
    cardContent: {
        backgroundColor: 'white',
        padding: `${theme.spacing(2)}px 0px`
    },
    cardHeader: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1)
    },
    text: {
        margin: theme.spacing(2)
    },
    photo: {
        textAlign: 'center',
        backgroundColor: '#f2f5f4',
        padding:theme.spacing(1)
    },
    media: {
        height: 200
    },
    button: {
        margin: theme.spacing(1),
    }
}))

export default function Post(props) {
    const classes = useStyles()
    const jwt = auth.isAuthenticated()

    const checkLike = (like) => {
        const match = like.indexOf(jwt.user._id) !== -1
        return match;
    }
    const [ values, setValues ] = useState({
        like: checkLike(props.post.likes),
        likes: props.post.likes.length,
        comments: props.post.comments
    })

    /*This method makes a fetch call to the delete post API and on success, updates the list
    of posts in the state by executing the onRemove method, which is received as a prop
    from the parent component.*/
    const deletePost = () => {
        remove(
            { postId: props.post._id },
            { t: jwt.token }
        )
        .then( data => {
            if (data.error) { console.log(data.error) } 
            else {
                props.onRemove(props.post)
            }
        })
    }


    return (
        <Card className={classes.card}>
            {{/*The header will contain information such as the name, avatar, and link to the profile
                of the user who posted, as well as the date the post was created.
                It will also conditionally show a delete button if the signed-in user is viewing their
                own post.*/}}
            <CardHeader
                avatar={<Avatar src={'/api/users/photo/' + props.post.postedBy._id}/>}
                action={ props.post.postedBy._id === auth.isAuthenticated().user._id && 
                    <IconButton onClick={deletePost}>
                        <DeleteIcon />
                    </IconButton>
                }
                title={
                    <Link to={'/user/' + props.post.postedBy._id}>
                        {props.post.postedBy.name}
                    </Link>
                }
                subheader={ (new Date(props.post.created)).toDateString() }
                className={classes.cardHeader}
            />

            {{/*The content section will show the text of the post and the image if the post contains a
                photo.*/}}
            <CardContent className={classes.cardContent}>
                <Typography component='p' className={classes.text}>
                    {props.post.text}
                </Typography>
                {props.post.photo && 
                    (<div className={classes.photo}>
                        <img
                            className={classes.media}
                            src={'/api/posts/photo/' + props.post._id}
                        />
                    </div>)
                }
            </CardContent>

            {{/*The actions section will contain an interactive "like" option with a display of the
                total number of likes on the post and a comment icon with the total number of
                comments on the post.*/}}
             <CardActions>
                 {  values.like
                    ? <IconButton onClick={clickLike} className={classes.button} aria-label="Like" color="secondary">
                        <FavoriteIcon />
                    </IconButton>
                    : <IconButton onClick={clickLike} className={classes.button} aria-label="Unlike" color="secondary">
                        <FavoriteBorderIcon />
                    </IconButton>
                 }
                 <span>{values.likes}</span>
                 <IconButton className={classes.button} aria-label='Comment' color='secondary'>
                     <CommentIcon />
                 </IconButton>
                 <span>{values.comments.length}</span>
             </CardActions>
             <Divider />
             <Comments postId={props.post._id} comments={values.comments} updateComments={updateComments}/>
        </Card>
    )
}