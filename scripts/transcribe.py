import sys, wave, numpy as np, sherpa_onnx
M=sys.argv[1]
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=M+"/large-v3-encoder.int8.onnx",decoder=M+"/large-v3-decoder.int8.onnx",tokens=M+"/large-v3-tokens.txt",language="ar",task="transcribe",num_threads=8)
w=wave.open(sys.argv[2]); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768; sr=w.getframerate()
cuts=[float(x) for x in sys.argv[3].split(",")]
for s,e in zip(cuts[:-1],cuts[1:]):
    st=rec.create_stream(); st.accept_waveform(sr,a[int(s*sr):int(e*sr)]); rec.decode_stream(st)
    print(f"{s:.2f}-{e:.2f} | {st.result.text}", flush=True)
