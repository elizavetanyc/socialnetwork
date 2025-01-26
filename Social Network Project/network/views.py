import json
from django.contrib.auth import authenticate, login, logout

from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.serializers import serialize
from django.core import serializers
from django.core.paginator import Paginator

from .models import User, Post, Likes, Followers


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


# a way to get all the posts, for all users, paginated
# need to be paginated, 10 posts per page
#return page number and the posts in groups of ten
def posts(request, post_type, page_num):
    #change such that it can pull all, and for a specific user, and for specific users followed
    if request.method != "GET":
        return JsonResponse({"error": "GET request required."}, status=400) 
        
    print(page_num)

    if post_type == 'all':
        posts = Post.objects.all()
        

    elif post_type == 'following':
        following = [followers.user for followers in Followers.objects.filter(followers=request.user)]
        posts = Post.objects.filter(user__in=following)

    else: 
        posts = Post.objects.filter(
            user=post_type
        )

    posts = posts.order_by("-timestamp").all()
    print(posts)
    
    print(posts)
    posts = [post.serialize() for post in posts]
    posts = Paginator(posts, 10)
    posts = posts.get_page(page_num)
    posts = posts.object_list
    print(posts)
   
    return JsonResponse(posts, safe=False)




# new make a post push request for signed in
@csrf_exempt
@login_required
def post(request):
    # Check post is not empty
    data = json.loads(request.body)
    # Get contents of post
    user=request.user
    body = data.get("body", "")

    # Create and save the post
    post = Post(user=user, body=body)
    post.save()
    return JsonResponse({"message": "Post created successfully."}, status=201)


# a way to like and unlike a post
@csrf_exempt
@login_required
def like(request, post_id):
    # get the user
    user=request.user
     # get the post
    post=Post.objects.get(pk=post_id)
    # get the likes
    likes=Likes.objects.filter(post=post_id)
    likes=[like.user for like in likes]

    print(likes)
    if user in likes:
        # print('found it')
        like=Likes.objects.filter(post=post_id, user=user)
        like.delete()
    else:
        like=Likes(user=user, post=post)
        like.save()

    post=Post.objects.get(pk=post_id)
    post=post.serialize()
    return JsonResponse(post, safe=False)


# a way to edit a post
@csrf_exempt
@login_required
def edit(request, post_id):
    # Get the post
    post = Post.objects.get(pk=post_id)
    data = json.loads(request.body)
    #update the post body and edited
    post.body = data.get("body", "")
    print(post.body)
    print(post.edited)
    post.edited = True
    print(post.edited)
    #save the post
    post.save()
    #check to see if post changed
    print(post.body)
    print(post.edited)

    
    return JsonResponse({"message": "Post edited successfully."}, status=201)



# a way to follow and unfollow a user 
@login_required
def followers(request, user_id):
    user = User.objects.get(pk=user_id)
    username = user.username
    followers = [followers.followers for followers in Followers.objects.filter(user=user_id)]
    followers = list(followers)
    following = [followers.user for followers in Followers.objects.filter(followers=user_id)]
    following = list(following)
    print(following)
    context = {
        "username": username,
        "followers": followers,
        "following": following
    }

    data = json.dumps(context, indent=4, sort_keys=True, default=str)
    return HttpResponse(data, content_type='application/json')




# a way to follow and unfollow a user 
@login_required
def follow(request, user_id):
    user = User.objects.get(pk=user_id)
    follower = User.objects.get(pk=request.user.id)
    followers = Followers.objects.filter(user=user)
    followers = [follower.followers for follower in followers]

    print(followers)
    print(follower)
    

    if follower in followers:
        #this user already follows, remove follow
        existing_follower = Followers.objects.get(user=user, followers=request.user)
        existing_follower.delete()
        print('follower removed from list')
           
    else:
        new_follower = Followers(user=user, followers=request.user)
        new_follower.save()
        print('follower added to list')

    followers = Followers.objects.filter(user=user)
    followers = [follower.followers for follower in followers]
    print(followers)

    context = {
        "followers": followers
    }

    data = json.dumps(context, indent=4, sort_keys=True, default=str)
    return HttpResponse(data, content_type='application/json')

