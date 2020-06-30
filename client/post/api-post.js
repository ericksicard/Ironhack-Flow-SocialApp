
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