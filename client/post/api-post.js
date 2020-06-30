
/*This is the fetch method that will load the posts that are rendered in PostList, which
is added as a child component to the Newsfeed component. So, this fetch needs to be
called in the useEffect hook in the Newsfeed component.*/
const listNewsFeed = async (params, credentials, signal) => {
    try{
        let response = await fetch('/api/posts/feed/' + params.userId, {
            method: 'GET',
            signal: signal,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + credentials.t
            }
        })
        return await response.json()
    }
    catch(err) { console.log(err) }
}

/*This fetch method will load the required posts for PostList, which is added to the
Profile view*/
const listByUser = async (params, credentials) => {
    try{
        let response = await fetch('/api/posts/by/' + params.userId, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + credentials.t
            }
        })
        return await response.json()
    }
    catch(err) { console.log(err) }
}

/*This method will send a multipart form submission using a FormData object that will
contain the text field and the image file.*/
const create = async (params, credentials, post) => {
    try{
        let response = await fetch('/api/posts/new/' + params.userId, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + credentials.t
            },
            body: post
        })
        return await response.json()
    }
    catch(err) { console.log(err) }
}

const remove = async (params, credentials) => {
    try{
        let response = await fetch('/api/posts/' + params.postId, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + credentials.t
            }
        })
        return await response.json()
    }
    catch(err) { console.log(err) }
}

const like = async (params, credentials, postId) => {
    try{
        let response = await fetch('api/posts/like/', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + credentials.t
            },
            body: JSON.stringify({
                postId: postId,
                userId: params.userId
            })
        })
        return await response.json()
    }
    catch(err) { console.log(err) }
}

const unlike = async (params, credentials, postId) => {
    try{
        let response = await fetch('api/posts/unlike/', {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + credentials.t
            },
            body: JSON.stringify({
                postId: postId,
                userId: params.userId
            })
        })
        return await response.json()
    }
    catch(err) { console.log(err) }
}