import asyncio
import json
import numpy as np
import soundfile as sf
import websockets

async def test_stream():
    uri = "ws://127.0.0.1:8000/api/v1/verify/stream"
    audio_path = r"D:\New folder\LibriSpeech\dev-clean\1272\128104\1272-128104-0000.flac"
    data, sr = sf.read(audio_path, dtype="float32")
    if data.ndim > 1:
        data = data.mean(axis=1)
    if sr != 16000:
        import resampy
        data = resampy.resample(data, sr, 16000)
    
    # Convert to 16-bit PCM bytes
    pcm_data = (data * 32767).astype(np.int16).tobytes()
    chunk_bytes = 960  # 30ms at 16kHz int16
    
    print(f"Connecting to {uri}...")
    async with websockets.connect(uri) as ws:
        print("Connected! Streaming audio chunks...")
        
        async def sender():
            for i in range(0, len(pcm_data), chunk_bytes):
                chunk = pcm_data[i:i + chunk_bytes]
                await ws.send(chunk)
                await asyncio.sleep(0.01)  # 10ms pacing
            print("Finished streaming all audio chunks.")

        async def receiver():
            responses = []
            try:
                while True:
                    msg = await asyncio.wait_for(ws.recv(), timeout=3.0)
                    resp = json.loads(msg)
                    responses.append(resp)
                    score = resp.get("overall_authenticity_score")
                    verdict = resp.get("verdict")
                    buf = resp.get("buffer_seconds")
                    layers = resp.get("layers", {})
                    print(f"-> Live Verdict: Score={score:.4f} | Verdict='{verdict}' | Buffer={buf}s | Layers={list(layers.keys())}")
            except asyncio.TimeoutError:
                print(f"Stream finished. Total live verdicts received: {len(responses)}")
            return responses

        await asyncio.gather(sender(), receiver())

if __name__ == "__main__":
    asyncio.run(test_stream())

