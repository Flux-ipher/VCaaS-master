#!/usr/bin/env python3
"""
Simple test script to verify the frontend Next.js app is working
"""
import subprocess
import time
import requests
import sys
import os

def test_frontend():
    """Test the frontend Next.js application"""
    print("🌐 Testing Voice Clone Platform Frontend...")
    
    # Start the frontend development server
    print("🚀 Starting frontend development server...")
    
    # Change to frontend directory and start npm dev
    frontend_process = subprocess.Popen([
        "cmd", "/c", "npm run dev"
    ], 
    stdout=subprocess.PIPE, 
    stderr=subprocess.PIPE,
    cwd=os.path.join(os.getcwd(), "frontend"),
    shell=True
    )
    
    # Wait for server to start
    print("⏳ Waiting for Next.js server to start...")
    time.sleep(10)  # Next.js takes a bit longer to start
    
    try:
        # Test home page
        print("🔍 Testing home page...")
        response = requests.get("http://localhost:3000/", timeout=10)
        if response.status_code == 200:
            print("✅ Home page accessible")
            # Check if it contains expected content
            if "VoiceClone" in response.text and "Clone Any Voice" in response.text:
                print("✅ Home page content verified")
            else:
                print("⚠️  Home page content may be incomplete")
        else:
            print(f"❌ Home page failed: {response.status_code}")
            return False
        
        # Test Next.js API routes if they exist
        print("🔍 Testing Next.js health...")
        try:
            # Next.js development server info
            response = requests.get("http://localhost:3000/_next/static/chunks/webpack.js", timeout=5)
            if response.status_code == 200:
                print("✅ Next.js webpack chunks accessible")
            else:
                print("⚠️  Next.js development assets not fully ready")
        except:
            print("⚠️  Next.js development assets not yet available")
            
        print("\n🎉 Frontend test completed successfully!")
        print("📋 You can access:")
        print("   • Home Page: http://localhost:3000/")
        print("   • Dashboard: http://localhost:3000/dashboard")
        print("   • Training: http://localhost:3000/training")
        print("   • Playground: http://localhost:3000/playground")
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        print("💡 Make sure the frontend server is running")
        return False
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
        
    finally:
        # Stop the frontend server
        print("🛑 Stopping frontend server...")
        frontend_process.terminate()
        try:
            frontend_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            frontend_process.kill()
            frontend_process.wait()

if __name__ == "__main__":
    success = test_frontend()
    sys.exit(0 if success else 1)
