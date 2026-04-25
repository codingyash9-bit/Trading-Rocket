import os
from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil

router = APIRouter()

USER_PHOTO_DIR = "user_data/photos"

# Ensure directory exists
if not os.path.exists(USER_PHOTO_DIR):
    os.makedirs(USER_PHOTO_DIR)

@router.post("/upload-photo/{user_id}")
async def upload_photo(user_id: str, file: UploadFile = File(...)):
    # Simple validation
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files allowed")
    
    # Save file
    file_path = os.path.join(USER_PHOTO_DIR, f"{user_id}.jpg")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return {"message": "Photo uploaded successfully", "user_id": user_id}
