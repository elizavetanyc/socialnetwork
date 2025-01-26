//global variable to set the author id from django of current logged in user
const author_id = JSON.parse(document.getElementById('author_id').textContent);
const author_username = JSON.parse(document.getElementById('author_username').textContent);

document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#profile').addEventListener('click', () => load_profile(author_id));
    document.querySelector('#home').addEventListener('click', () => load_posts('all', 1));
    document.querySelector('#following').addEventListener('click', () =>  load_posts('following', 1));
  
    // By default, load the home page
    console.log('dom loaded');
    load_posts('all', 1);
  });


//function to load profile of logged in user
  function load_profile(user_id) {
    console.log('function load profile');
    console.log(user_id);
    //clear profile
    document.querySelector('#profile-view').innerHTML = "";

    /// fetch follow username and data
    fetch(`/followers/${user_id}`, { 
    })
    .then(response => response.json())
    .then(result => {
      console.log(result.username);
      console.log(result.following)
      console.log(result.following.length)
      console.log(result.followers)
      console.log(result.followers.length)
    
    //Display the number of followers the user has, as well as the number of people that the user follows.
    const bio_followers = document.createElement('div');
    const bio_following = document.createElement('div');

    const nameb = document.createElement('div');
    const followb = document.createElement('div');
    // set div id tag so we can pull out posts
    bio_followers.setAttribute('id', 'bio_followers');
    bio_followers.setAttribute('class', 'bio_followers');

    bio_following.setAttribute('id', 'bio_following');
    bio_following.setAttribute('class', 'bio_following');

    nameb.setAttribute('id', 'nameb');
    nameb.setAttribute('class', 'bio');

    followb.setAttribute('id', 'followb');
    followb.setAttribute('class', 'bio');

    var followers_ct = result.followers.length
    var following_ct = result.following.length
    var username = result.username
    
    console.log((author_username));
    console.log(result.followers);
    
    //follow button logic
    if(author_id == user_id) {
      var follow_button = ''
    } else if (result.followers.includes(author_username)) {
      console.log('in follower list')
      var follow_button = '<button class="btn btn-secondary" id="follow">Unfollow</button>'
    } else {
      console.log('not in follower list')
      var follow_button = '<button class="btn btn-primary" id="follow">Follow</button>'
    }

    bio_following.innerHTML = following_ct + ' Following'
    bio_followers.innerHTML = followers_ct + ' Followers'
    
    nameb.innerHTML = username
    followb.innerHTML = follow_button

    document.querySelector('#profile-view').append(nameb);
    document.querySelector('#profile-view').append(bio_following);
    document.querySelector('#profile-view').append(bio_followers);
    document.querySelector('#profile-view').append(followb);
  

    //Display all of the posts for that user, in reverse chronological order. Using same function as load posts w/ user adj on backend
    load_posts(user_id, 1);
    //set up page views
    document.querySelector('#post-view').style.display = 'none';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'block';
    document.querySelector('#edit-view').style.display = 'none';

    followb.addEventListener('click', () => {
      follow(user_id);
    })
  })//end fetch 
}

//function to load posts, either all or only those following for logged in user
//should include make posts view in both cases
  function load_posts(posts, page) {
    console.log('function load posts');
    //set up page views
    document.querySelector('#post-view').style.display = 'block';
    document.querySelector('#posts-view').style.display = 'block';
    document.querySelector('#profile-view').style.display = 'none';
    document.querySelector('#edit-view').style.display = 'none';

    //clear out all posts
    document.querySelector('#posts-view').innerHTML = "";
    
    //posting function
    document.querySelector('#post-form').onsubmit = post;
    
    //api to get posts
    fetch(`/posts/${posts}/${page}`, {
        })
    .then(response => response.json())
    .then(posts => {
        // Print posts
        console.log('fetched posts');   
        //console.log(response);
        // list the posts by adding api content into a div
        posts.forEach(function(item) {
            const body = item.body;
            const user = item.username;
            const timestamp = item.timestamp;
         
          const post = document.createElement('div');
          // set div id tag so we can pull out posts
          post.setAttribute('id', item.id);
          post.setAttribute('class', 'post');

          const userdata = document.createElement('div');
          userdata.setAttribute('id', item.user);
          userdata.setAttribute('class', 'userdata');
          userdata.addEventListener('click', () => load_profile(item.user));

          const timedata = document.createElement('div');
          timedata.setAttribute('id', item.id);
          timedata.setAttribute('class', 'timedata');

          const likedata = document.createElement('div');
          likedata.setAttribute('id', 'like'+item.id);
          likedata.setAttribute('class', 'likedata');

          const editdata = document.createElement('div');
          editdata.setAttribute('id', 'edit'+item.id);
          editdata.setAttribute('class', 'editdata');
          editdata.addEventListener('click', () => editpost(item.user, item));

          // set class tag for read or unread so CSS can style it
          post.innerHTML = body + '</br>'
          userdata.innerHTML = '<i>' + user + '</i>' 
          timedata.innerHTML = timestamp
          editdata.innerHTML = editbutton(user) + '<hr>';
          console.log(user);
          likeheart(item.likes);

          likedata.innerHTML = 
          heart
          + item.likes.length;
          
          document.querySelector('#posts-view').append(post);
          document.querySelector('#posts-view').append(userdata);
          document.querySelector('#posts-view').append(likedata);
          document.querySelector('#posts-view').append(timedata);
          document.querySelector('#posts-view').append(editdata);


          //like function changes heart and adds a like to server 
          likedata.addEventListener('click', () => {
            like(item);
          })
        })  // ends for each entry loop
      }) // ends the execution post fetch
}

//function to submit a post into the feed
function post() {
    event.preventDefault();
    const body = document.querySelector('#post-body').value;
    console.log(body);
    //only submit if body has text in it
    if(body.length > 0){
    //api to submit post
    fetch('/post', { //submit to post url path
        method: 'POST',
        body: JSON.stringify({
            body: body,
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
         //clear out text box again
          document.querySelector('#post-body').value = '';
         //clear out the timeline
          console.log(document.querySelector('#posts-view').value);          
          document.querySelector('#posts-view').innerHTML = ''
          console.log(document.querySelector('#posts-view').value);
          //reload posts
          load_posts('all', 1);
    });
  }
}

function like(item) {
    console.log('like function');
    const likesCount = document.getElementById('like'+item.id)
    //console.log(likesCount);

    // fetch to activate like function server
    fetch(`/like/${item.id}`, { 
      })
      .then(response => response.json())
      .then(result => {
        post_likes = result.likes.length;
        console.log(post_likes);
        likeheart(result.likes);
        likesCount.innerHTML = 
        heart +
        post_likes;
      }) 
}

//function for the likeheart; checks author in list of likes
function likeheart(likes) {
    //console.log(author_username);
    //console.log(likes);
    if(likes.includes(author_username)) {
        heart = '<i class="bi bi-heart-fill"> &nbsp </i>'
    } else {
        heart = '<i class="bi bi-heart"> &nbsp </i>'
    } return heart
}


function follow(user) {
  console.log('follow function user ' + user)

  fetch(`/follow/${user}`, { 
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    //first change follower count
    console.log(result.followers.length)

    //update follow count
    var followers_ct = result.followers.length
    const followers = document.querySelector('#bio_followers.bio_followers')
    followers.innerHTML = followers_ct + ' Followers'

    //update button
    const followb = document.querySelector('#followb.bio')

    if(result.followers.includes(author_username)) {
      console.log('in follower list')
      var follow_button = '<button class="btn btn-secondary" id="follow">Unfollow</button>'
    } else {
      console.log('not in follower list')
      var follow_button = '<button class="btn btn-primary" id="follow">Follow</button>'
    }

    followb.innerHTML = follow_button
  }) 
}


//function for the edit message based on who is logged in
function editbutton(edit_user) {
  //console.log(edit_user);
  //console.log(author_username);
  if(edit_user == (author_username)) {
      edit = 'Edit'
  } else {
      edit = ''
  } return edit
}


function editpost(user, item) {
  console.log(user);
  console.log(item.id);
  console.log(item);
  const post = document.getElementById(item.id)
  post.innerHTML = `<form id="edit-form"><textarea class="form-control" id="post-edit">${item.body}</textarea><input id="submit" type="submit" class="btn btn-primary"></form><br>`
  // fetch function to edit post functionality
  console.log(post);
  document.querySelector('#edit-form').addEventListener('submit', event => {
    event.preventDefault();
    // alternate way to not submit because the prior way doesn't work
    console.log('Form submission cancelled.');
    edit_post(item);
  });

}


function edit_post(item) {
  console.log('edit function');
  const body = document.querySelector('#post-edit').value;
  console.log(body);

  if(body.length > 0){
    //api to submit post
    fetch(`/edit/${item.id}`, { //submit to edit url path
        method: 'POST',
        body: JSON.stringify({
            body: body,
        })
      })
      .then(response => response.json())
      .then(result => {
          // Print result
          console.log(result);
         //clear out text box again
          document.querySelector('#post-edit').value = '';
         //clear out the timeline
          console.log(document.querySelector('#posts-view').value);          
          document.querySelector('#posts-view').innerHTML = ''
          console.log(document.querySelector('#posts-view').value);
          //reload posts
          load_posts('all', 1);
    });
  }
}
