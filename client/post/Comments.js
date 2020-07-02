  
import React, { useState } from 'react'
import {Link} from 'react-router-dom'
import PropTypes from 'prop-types'

import { makeStyles } from '@material-ui/core/styles'
import CardHeader from '@material-ui/core/CardHeader'
import TextField from '@material-ui/core/TextField'
import Avatar from '@material-ui/core/Avatar'
import Icon from '@material-ui/core/Icon'

import auth from './../auth/auth-helper'
import { comment, uncomment } from './api-post.js'

const useStyles = makeStyles(theme => ({
    cardHeader: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1)
    },
    smallAvatar: {
        width: 25,
        height: 25
    },
    commentField: {
        width: '96%'
    },
    commentText: {
        backgroundColor: 'white',
        padding: theme.spacing(1),
        margin: `2px ${theme.spacing(2)}px 2px 2px`
    },
    commentDate: {
        display: 'block',
        color: 'gray',
        fontSize: '0.8em'
    },
    commentDelete: {
        fontSize: '1.6em',
        verticalAlign: 'middle',
        cursor: 'pointer'
   }
}))

/*This component will contain an avatar showing the user's photo and a text field, which will add
the comment when the user presses the Enter key.*/

export default function Comments(props) {
    const classes = useStyles()
    const jwt = auth.isAuthenticated()
    const [ text, setText ] = useState('')

    /*The text will be stored in the state when the value changes, and on the onKeyDown
    event, the addComment method will call the "comment" fetch method if the Enter key is
    pressed.
    The Comments component receives the updateComments method as a prop from the Post component.
    This will be executed when the new comment is added in order to update the comments list and
    the comment count in the Post view.
    */
    const addComment = event => {
        if (event.code == 13 && event.target.value) {
            event.preventDefault()
            comment(
                { userId: jwt.user._id },
                { t: jwt.token },
                props.postId,
                { text: text }
            )
            .then( data => {
                if (data.error) { console.log(data.error) }
                else {
                    setText('')
                    props.updateComments(data.comments)
                }
            })
        }
    }

    /*commentBody renders the content, including the name of the commenter linked to their profile,
    the comment text, and the date of comment creation.
    It will also render a delete option for the comment if the postedBy reference of the comment matches
    the currently signed-in user. 
    */
    const commentBody = comment => {
        return (
            <p className={classes.commentText}>
                <Link to={'/user/' + comment.postedBy._id}>
                    {comment.postedBy.name}
                </Link> <br/>
                {comment.text}
                <span className={classes.commentDate}>
                    { (new Date(comment.created)).toDateString() } |
                    { auth.isAuthenticated().user._id == comment.postedBy._id && 
                        <Icon onClick={deleteComment(comment)} className={classes.commentDelete}>delete</Icon>
                    }
                </span>
            </p>
        )
    }

    return (
        <div>
            <CardHeader 
                avatar = { <Avatar 
                            src={'/api/users/photo/' + auth.isAuthenticated().user._id}
                            className={classes.smallAvatar}
                            />                            
                        }
                title = { <TextField
                            onKeyDown={addComment}
                            multiline
                            value={text}
                            onChange={handleChange}
                            placeholder='Write something...'
                            className={classes.commentField}
                            margin='normal'
                            />
                        }
                className = {classes.cardHeader}
            />

            {{/*The Comments component receives the list of comments for the specific post as props
            from the Post component. Then, it iterates over the individual comments to render the
            details of the commenter and the comment content*/}}
            {props.comments.map( (comment, i) => {
                return <CardHeader
                        avatar = { <Avatar 
                            src={'/api/users/photo/' + comment.postedBy._id}
                            className={classes.smallAvatar}
                            />                            
                        }
                        title = { commentBody(comment) }
                        className = {classes.cardHeader}
                        key = {i}
                    />
                })
            }
        </div>
    )
}