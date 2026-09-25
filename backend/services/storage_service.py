import os
import shutil
import uuid
from fastapi import UploadFile

class StorageService:
    """
    Abstracted file storage service.
    Currently configured to use local filesystem for MVP.
    Easily swappable with S3/GCS in production.
    """
    def __init__(self):
        self.upload_dir = "uploads/resumes"
        os.makedirs(self.upload_dir, exist_ok=True)
        
    async def save_file(self, file: UploadFile) -> str:
        file_id = str(uuid.uuid4())
        ext = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
        filename = f"{file_id}{ext}"
        filepath = os.path.join(self.upload_dir, filename)
        
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        return f"/api/v1/resumes/download/{filename}"
        
    def get_filepath(self, file_url: str) -> str:
        filename = file_url.split("/")[-1]
        return os.path.join(self.upload_dir, filename)
        
    def delete_file(self, file_url: str):
        filepath = self.get_filepath(file_url)
        if os.path.exists(filepath):
            os.remove(filepath)
