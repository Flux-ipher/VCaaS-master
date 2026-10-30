import asyncio, json, numpy as np, soundfile as sf, websockets

async def test_longer_stream():
    uri = "ws://127.0.0.1:8000/api/v1/verify/stream"
    p1 = r"D:\New folder\LibriSpeech\dev-clean\1272\128104\1272-128104-0000.flac"
    p2 = r"D:\New folder\LibriSpeech\dev-clean\1272\128104\1272-128104-0001.flac"
    d1, sr = sf.read(p1, dtype="float32")
    d2, _ = sf.read(p2, dtype="float32")
    combined = np.concatenate([d1, d2])
    pcm_data = (combined * 32767).astype(np.int16).tobytes()
    chunk_bytes = 960

    print(f"Total audio duration: {len(combined)/16000:.1f}s")
    async with websockets.connect(uri) as ws:
        async def sender():
            for i in range(0, len(pcm_data), chunk_bytes):
                await ws.send(pcm_data[i:i + chunk_bytes])
                await asyncio.sleep(0.02)
            print("Finished sending all audio chunks.")

        async def receiver():
            responses = []
            try:
                while True:
                    msg = await asyncio.wait_for(ws.recv(), timeout=5.0)
                    resp = json.loads(msg)
                    responses.append(resp)
                    layers = list(resp.get("layers", {}).keys())
                    score = resp.get("overall_authenticity_score")
                    buf = resp.get("buffer_seconds")
                    print(f"-> [buf={buf}s] Score={score:.3f} | Layers ({len(layers)}): {layers}")
                    if "layer5_semantic" in resp.get("layers", {}):
                        print("   * L5 ASR Transcript:", resp["layers"]["layer5_semantic"].get("transcription"))
                    if "layer6_watermark" in resp.get("layers", {}):
                        print("   * L6 Watermark Verdict:", resp["layers"]["layer6_watermark"].get("verdict"))
            except asyncio.TimeoutError:
                print(f"Stream ended. Total frames: {len(responses)}")

        await asyncio.gather(sender(), receiver())

if __name__ == "__main__":
    asyncio.run(test_longer_stream())

