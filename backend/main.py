from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List

app = FastAPI(
    title="Post Management API",
    description="A simple REST API for managing posts in-memory",
    version="1.0.0"
)

# Enable CORS for Next.js frontend running on http://localhost:3000
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for posts
posts_db = [
    {
        "id": 1,
        "title": "Welcome to MyPustak!",
        "body": "This is the first default post in our minimal Post Management App, built with FastAPI and Next.js."
    },
    {
        "id": 2,
        "title": "Exploring FastAPI",
        "body": "FastAPI is extremely fast and auto-documents endpoints. Perfect for prototyping and high-performance services."
    }
]

# ID Counter for new posts
next_id = 3

# Pydantic schemas for request/response validation
class Post(BaseModel):
    id: int
    title: str
    body: str

class PostCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=100, description="Title of the post, cannot be empty")
    body: str = Field(..., min_length=1, description="Body content of the post, cannot be empty")

@app.get("/posts", response_model=List[Post], status_code=status.HTTP_200_OK)
def get_posts():
    """
    Retrieve all posts.
    """
    return posts_db

@app.post("/posts", response_model=Post, status_code=status.HTTP_201_CREATED)
def create_post(post_in: PostCreate):
    """
    Create a new post and store it in-memory.
    """
    global next_id
    # Strip whitespace to prevent spaces-only titles or bodies
    title_stripped = post_in.title.strip()
    body_stripped = post_in.body.strip()
    
    if not title_stripped or not body_stripped:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title and body cannot be empty or contain only whitespace"
        )
        
    new_post = {
        "id": next_id,
        "title": title_stripped,
        "body": body_stripped
    }
    posts_db.append(new_post)
    next_id += 1
    return new_post

@app.delete("/posts/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(id: int):
    """
    Delete a post by its ID.
    """
    global posts_db
    post_index = -1
    for index, post in enumerate(posts_db):
        if post["id"] == id:
            post_index = index
            break
            
    if post_index == -1:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Post with ID {id} not found"
        )
        
    posts_db.pop(post_index)
    return
