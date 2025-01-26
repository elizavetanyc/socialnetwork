
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("post", views.post, name="post"),
    path("posts/<str:post_type>/<int:page_num>", views.posts, name="posts"),
    path("like/<int:post_id>", views.like, name="like"),
    path("followers/<int:user_id>", views.followers, name="followers"),
    path("follow/<int:user_id>", views.follow, name="follow"),
    path("edit/<int:post_id>", views.edit, name="edit"),
]
