import asyncio, json, numpy as np, soundfile as sf, websockets, time

async def test_realtime_stream():
    uri = "ws://127.0.0.1:8000/api/v1/verify/stream"
    files = [
        r"D:\New folder\LibriSpeech\dev-clean\1272\128104\1272-128104-0000.flac",
        r"D:\New folder\LibriSpeech\dev-clean\1272\128104\1272-128104-0001.flac",
        r"D:\New folder\LibriSpeech\dev-clean\1272\128104\1272-128104-0002.flac"
    ]
    audios = [sf.read(f, dtype="float32")[0] for f in files]
    combined = np.concatenate(audios)
    pcm_data = (combined * 32767).astype(np.int16).tobytes()
    chunk_bytes = 960  # 30ms

    print(f"Total audio duration: {len(combined)/16000:.1f}s")
    async with websockets.connect(uri) as ws:
        async def sender():
            for i in range(0, len(pcm_data), chunk_bytes):
                await ws.send(pcm_data[i:i + chunk_bytes])
                await asyncio.sleep(0.03)  # real-time 30ms pace
            print("Finished streaming all audio chunks.")

        async def receiver():
            start = time.time()
            try:
                while True:
                    msg = await asyncio.wait_for(ws.recv(), timeout=6.0)
                    resp = json.loads(msg)
                    elapsed = time.time() - start
                    layers = list(resp.get("layers", {}).keys())
                    score = resp.get("overall_authenticity_score")
                    print(f"[{elapsed:4.1f}s] Score={score:.3f} | Layers ({len(layers)}): {layers}")
                    if "layer5_semantic" in resp.get("layers", {}):
                        print("   -> L5 Transcription:", resp["layers"]["layer5_semantic"].get("transcription"))
                    if "layer6_watermark" in resp.get("layers", {}):
                        print("   -> L6 Watermark Verdict:", resp["layers"]["layer6_watermark"].get("verdict"))
            except asyncio.TimeoutError:
                pass

        await asyncio.gather(sender(), receiver())

if __name__ == "__main__":
    asyncio.run(test_realtime_stream())

