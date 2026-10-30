@echo off
echo 🎤 Starting Voice Cloning Platform Demo...
echo.

echo 📂 Setting up directories...
cd backend
if not exist voice_models mkdir voice_models
if not exist audio_output mkdir audio_output
if not exist training_data mkdir training_data

echo.
echo 🚀 Starting Backend API (Python)...
echo Backend will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
start "Voice Cloning Backend" cmd /c "python voice_cloning_api.py"

echo.
echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak

echo.
echo 🌐 Starting Frontend (Next.js)...
echo Frontend will be available at: http://localhost:3000 or http://localhost:3001
cd ../frontend
start "Voice Cloning Frontend" cmd /c "npm run dev"

echo.
echo ✅ Demo is starting up!
echo.
echo 📋 Demo Features:
echo • Real voice cloning using Edge TTS, Google TTS, and Windows TTS
echo • Audio file upload and analysis
echo • Real-time training progress with WebSockets
echo • Voice synthesis with multiple engines
echo • Admin panel with secret access (type "ritsaadmin" on any page)
echo.
echo 🔗 Access Points:
echo • Frontend: http://localhost:3000
echo • Backend API: http://localhost:8000
echo • API Docs: http://localhost:8000/docs
echo • Admin Login: http://localhost:3000/admin/login
echo   - Username: ritsa_admin
echo   - Password: VoiceClone2024!@#
echo.
echo Press any key to close this window...
pause