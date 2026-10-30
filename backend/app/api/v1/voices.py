"""
Voice management endpoints for VCaaS API v1.
Handles voice upload, processing, cloning, and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import tempfile
from datetime import datetime
import uuid

from ...core.database import get_db
from ...services.voice_processor import VoiceProcessor
from ...services.audio_processor import AudioProcessor
from ...services.voice_training_service import voice_training_service
from ...models.user import User
from ...models.voice import Voice
from .auth import get_current_user
from ...schemas.voice import (
    VoiceCreate,
    VoiceResponse,
    VoiceUpdate,
    VoiceUploadResponse
)

router = APIRouter(prefix="/voices", tags=["voice-management"])

@router.post("/upload", response_model=VoiceUploadResponse)
async def upload_voice(
    file: UploadFile = File(...),
    name: Optional[str] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a voice sample for processing and cloning."""
    
    # Validate file type
    allowed_types = ['audio/wav', 'audio/mp3', 'audio/flac', 'audio/m4a']
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Save uploaded file temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
        content = await file.read()
        temp_file.write(content)
        temp_file_path = temp_file.name
    
    try:
        # Process audio
        audio_processor = AudioProcessor()
        audio_info = await audio_processor.get_audio_info_from_path(temp_file_path)
        
        # Validate audio quality
        if audio_info['duration'] < 5:  # Minimum 5 seconds
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio must be at least 5 seconds long"
            )
        
        if audio_info['duration'] > 300:  # Maximum 5 minutes
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Audio must be less than 5 minutes long"
            )
        
        # Generate unique voice ID
        voice_id = f"voice_{uuid.uuid4().hex[:12]}"
        
        # Create voice record in database as pending/processing
        voice = Voice(
            id=voice_id,
            user_id=current_user.id,
            name=name or f"Voice {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            description=description,
            original_filename=file.filename,
            file_path=None,
            speaker_embedding=None,
            duration=audio_info['duration'],
            sample_rate=audio_info['sample_rate'],
            file_size=audio_info['file_size_bytes'],
            status='pending',
            quality_score=audio_info.get('quality_score', 0.85)
        )
        
        db.add(voice)
        db.commit()
        db.refresh(voice)
        
        # Start background processing
        await voice_training_service.start_training(voice.id, temp_file_path)
        
        return VoiceUploadResponse(
            voice_id=voice.id,
            name=voice.name,
            status=voice.status,
            duration=voice.duration,
            quality_score=voice.quality_score,
            upload_time=voice.created_at,
            next_steps="Voice is currently processing. You can check its status later."
        )
        
    except Exception as e:
        # Clean up temporary file only on immediate error
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        raise e

@router.get("/", response_model=List[VoiceResponse])
async def list_voices(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all voices belonging to the current user."""
    voices = db.query(Voice).filter(Voice.user_id == current_user.id).all()
    
    return [
        VoiceResponse(
            id=voice.id,
            name=voice.name,
            description=voice.description,
            status=voice.status,
            duration=voice.duration,
            quality_score=voice.quality_score,
            created_at=voice.created_at,
            updated_at=voice.updated_at
        )
        for voice in voices
    ]

@router.get("/{voice_id}", response_model=VoiceResponse)
async def get_voice(
    voice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get details of a specific voice."""
    voice = db.query(Voice).filter(
        Voice.id == voice_id,
        Voice.user_id == current_user.id
    ).first()
    
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice not found"
        )
    
    return VoiceResponse(
        id=voice.id,
        name=voice.name,
        description=voice.description,
        status=voice.status,
        duration=voice.duration,
        quality_score=voice.quality_score,
        created_at=voice.created_at,
        updated_at=voice.updated_at,
        sample_rate=voice.sample_rate,
        file_size=voice.file_size
    )

@router.put("/{voice_id}", response_model=VoiceResponse)
async def update_voice(
    voice_id: str,
    voice_update: VoiceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update voice metadata."""
    voice = db.query(Voice).filter(
        Voice.id == voice_id,
        Voice.user_id == current_user.id
    ).first()
    
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice not found"
        )
    
    # Update fields if provided
    if voice_update.name is not None:
        voice.name = voice_update.name
    if voice_update.description is not None:
        voice.description = voice_update.description
    
    voice.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(voice)
    
    return VoiceResponse(
        id=voice.id,
        name=voice.name,
        description=voice.description,
        status=voice.status,
        duration=voice.duration,
        quality_score=voice.quality_score,
        created_at=voice.created_at,
        updated_at=voice.updated_at
    )

@router.delete("/{voice_id}")
async def delete_voice(
    voice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a voice and its associated files."""
    voice = db.query(Voice).filter(
        Voice.id == voice_id,
        Voice.user_id == current_user.id
    ).first()
    
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice not found"
        )
    
    # Clean up files
    if voice.file_path and os.path.exists(voice.file_path):
        os.unlink(voice.file_path)
    
    # Delete from database
    db.delete(voice)
    db.commit()
    
    return {"message": "Voice deleted successfully"}

@router.get("/{voice_id}/preview")
async def get_voice_preview(
    voice_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a preview of the voice sample."""
    voice = db.query(Voice).filter(
        Voice.id == voice_id,
        Voice.user_id == current_user.id
    ).first()
    
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice not found"
        )
    
    if not voice.file_path or not os.path.exists(voice.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found"
        )
    
    return FileResponse(
        voice.file_path,
        media_type="audio/wav",
        filename=f"{voice.name}_preview.wav"
    )

@router.post("/{voice_id}/clone-test")
async def test_voice_clone(
    voice_id: str,
    text: str = "Hello, this is a test of your cloned voice.",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test voice cloning with a short phrase."""
    voice = db.query(Voice).filter(
        Voice.id == voice_id,
        Voice.user_id == current_user.id
    ).first()
    
    if not voice:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Voice not found"
        )
    
    if voice.status != 'ready':
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Voice is not ready for cloning"
        )
    
    # Initialize voice processor
    voice_processor = VoiceProcessor()
    
    # Generate test audio
    test_audio_path = await voice_processor.synthesize_speech(
        text=text,
        voice_id=voice_id,
        speaker_embedding=voice.speaker_embedding
    )
    
    return FileResponse(
        test_audio_path,
        media_type="audio/wav",
        filename=f"{voice.name}_test.wav"
    )