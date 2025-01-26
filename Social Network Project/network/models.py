from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    posts = models.ManyToManyField("Post", related_name="user_posts")
    followers = models.ManyToManyField("User",  through="Followers", related_name="user_followers")
    likes = models.ManyToManyField("User", through="Likes", related_name="user_likes")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "posts": self.posts.all(),
            "followers": self.followers.all(),
            "likes": self.likes.all()
        }


class Post(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="post_user")
    timestamp = models.DateTimeField(auto_now_add=True)
    body = models.TextField(blank=True)
    likes = models.ManyToManyField("User", through="Likes", related_name="post_likes")
    edited = models.BooleanField(default=False)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.id,
            "username": self.user.username,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "body": self.body,
            "likes": [user.username for user in self.likes.all()],
            "edited": self.edited
        }


class Likes(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="like_user")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="like_post")

    def serialize(self):
        return {
            "user": self.user.id,
            "post":self.post.id
        }


class Followers(models.Model):
    user = models.ForeignKey("User", on_delete=models.CASCADE, related_name="following_user")
    followers = models.ForeignKey("User", on_delete=models.CASCADE, related_name="followed_user")

    def serialize(self):
        return {
            "user": self.user.id,
            "followers":self.followers.id
        }

